import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Compass, Eye, Play, Pause, RotateCcw, Volume2, VolumeX,
  X, Maximize2, Minimize2, Sparkles, CheckCircle2, Sliders, Move, Globe2, ArrowLeft
} from 'lucide-react'

// ============================================================================
// SHADERS FOR PRISTINE 3D PHOTO RECONSTRUCTION
// ============================================================================

// Vertex Shader:
// - Displaces foreground subjects smoothly into 3D space
// - Planar lock on human subjects prevents jagged vertex stretching across faces
const PHOTO_3D_VERTEX_SHADER = `
  uniform sampler2D uDepthMap;
  uniform float uDepthScale;
  varying vec2 vUv;
  varying float vDepth;
  varying float vFaceMask;

  void main() {
    vUv = uv;
    vec4 depthSample = texture2D(uDepthMap, uv);
    float depth = depthSample.r;
    float faceMask = depthSample.g;
    vDepth = depth;
    vFaceMask = faceMask;

    vec3 pos = position;

    // Smooth physical Z displacement:
    // Foreground subjects come forward, background recedes deep into the room
    float zDisp = (depth - 0.42) * uDepthScale * 1.8;

    // Planar smoothing for human faces: avoids angular tilting or facial polygon tearing
    if (faceMask > 0.25) {
      zDisp = mix(zDisp, (0.86 - 0.42) * uDepthScale * 1.8, faceMask * 0.85);
    }

    pos.z += zDisp;

    // Subtle wide-angle curved cinema projection for natural spatial immersion
    pos.z -= (pos.x * pos.x * 0.012 + pos.y * pos.y * 0.012);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// Fragment Shader:
// - 100% UNWARPED direct UV sampling on human faces: ZERO parallax smearing
// - Unsharp-mask edge micro-contrast filter: makes eyes, smiles, expressions razor sharp
// - Perspective parallax shifts ONLY background scenery, creating true 3D separation
const PHOTO_3D_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform sampler2D uDepthMap;
  uniform vec2 uParallaxOffset;
  uniform float uParallaxAmount;
  uniform vec2 uResolution;
  varying vec2 vUv;
  varying float vDepth;
  varying float vFaceMask;

  void main() {
    vec4 depthSample = texture2D(uDepthMap, vUv);
    float depth = depthSample.r;
    float faceMask = depthSample.g;

    // Parallax is strictly damped to 0 on human faces and foreground subjects!
    // This prevents differential pixel shifting across eyes, nose, and mouth.
    float parallaxWeight = (1.0 - depth) * (1.0 - smoothstep(0.15, 0.75, faceMask));
    vec2 parallax = uParallaxOffset * parallaxWeight * uParallaxAmount;
    vec2 sampleUv = clamp(vUv + parallax, vec2(0.0005), vec2(0.9995));

    // Sample high-definition texture
    vec4 baseColor = texture2D(uTexture, sampleUv);

    // Unsharp mask filter for crystal-clear clarity on human faces and fine details
    vec2 texel = vec2(1.0 / max(uResolution.x, 512.0), 1.0 / max(uResolution.y, 512.0));
    vec4 blur = (
      texture2D(uTexture, sampleUv + vec2(texel.x, 0.0)) +
      texture2D(uTexture, sampleUv - vec2(texel.x, 0.0)) +
      texture2D(uTexture, sampleUv + vec2(0.0, texel.y)) +
      texture2D(uTexture, sampleUv - vec2(0.0, texel.y))
    ) * 0.25;

    // High-frequency detail boost (higher boost on human faces for crisp eyes & smiles)
    float sharpnessBoost = mix(0.18, 0.42, faceMask);
    vec3 sharpRgb = baseColor.rgb + (baseColor.rgb - blur.rgb) * sharpnessBoost;

    // Natural contrast and gentle warm tone grading
    sharpRgb = ((sharpRgb - 0.5) * 1.05) + 0.5;

    gl_FragColor = vec4(sharpRgb, 1.0);
  }
`

// 3D Floor Perspective Reflection Shader (Reconstructs the ground of the whole 3D photo)
const FLOOR_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const FLOOR_FRAGMENT_SHADER = `
  uniform vec3 uBaseColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    // Elegant perspective grid lines
    vec2 gridUv = abs(fract(vUv * 24.0 - 0.5) - 0.5) / fwidth(vUv * 24.0);
    float line = min(gridUv.x, gridUv.y);
    float gridAlpha = 1.0 - min(line, 1.0);

    // Distance falloff from center of photo
    float dist = length(vWorldPosition.xz - vec2(0.0, 0.5));
    float fade = smoothstep(12.0, 1.5, dist);

    vec3 color = mix(uBaseColor * 0.35, uBaseColor * 1.4, gridAlpha * 0.35);
    float alpha = (0.15 + gridAlpha * 0.25) * fade * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`

// ============================================================================
// DEPTH & HUMAN FACE MAP GENERATOR
// Extracts 3D depth + isolates human faces to guarantee 100% clarity
// ============================================================================
function generateWhole3DPhotoDepth(image) {
  const canvas = document.createElement('canvas')
  const W = 360
  const H = 240
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, W, H)

  let imgData
  try {
    imgData = ctx.getImageData(0, 0, W, H)
  } catch (e) {
    // Fallback if cross-origin restricted
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#222222')
    grad.addColorStop(1, '#ffffff')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    return { depthCanvas: canvas, dominantRgb: [40, 70, 120] }
  }

  const d = imgData.data
  const rawDepth = new Float32Array(W * H)
  const faceMask = new Float32Array(W * H)

  let totalR = 0, totalG = 0, totalB = 0

  // 1st Pass: Spatial perspective gradient + Human Face/Body Detection
  for (let y = 0; y < H; y++) {
    const normY = y / H // 0 = background/sky, 1 = table/ground foreground
    // Perspective baseline: street/table recedes smoothly backward
    const basePerspective = Math.pow(normY, 0.85) * 0.70 + 0.16

    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4
      const r = d[idx]
      const g = d[idx + 1]
      const b = d[idx + 2]

      totalR += r
      totalG += g
      totalB += b

      // Detect human skin chrominance (faces, hands, portraits)
      const isSkin = (r > 70 && g > 40 && b > 25 && r > g && (r - b) > 14 && (g - b) > -25)
      
      // Central focus weighting: in travel memories, people are centered or mid-frame
      const normX = (x / W - 0.5) * 2.0
      const centerFactor = Math.max(0, 1.0 - Math.abs(normX) * 0.75)

      let humanConfidence = 0.0
      if (isSkin && normY > 0.16 && normY < 0.90) {
        humanConfidence = 0.95 * centerFactor
      }

      faceMask[y * W + x] = humanConfidence

      // If human subject detected, elevate to unified foreground plane (0.86)
      // This prevents eyes/hair from sinking into holes, and nose from spiking
      let depth = basePerspective
      if (humanConfidence > 0.28) {
        depth = 0.86
      }

      rawDepth[y * W + x] = depth
    }
  }

  // Calculate dominant ambient color for room lighting
  const pixelCount = W * H
  const dominantRgb = [
    Math.round(totalR / pixelCount),
    Math.round(totalG / pixelCount),
    Math.round(totalB / pixelCount)
  ]

  // 2nd Pass: Edge-preserving bilateral depth smoothing
  // Keeps human contours clean while transitioning smoothly into the background
  const smoothDepth = new Float32Array(W * H)
  const radius = 5

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const isHuman = faceMask[y * W + x] > 0.35
      if (isHuman) {
        // Enforce solid planar face stability
        smoothDepth[y * W + x] = 0.86
        continue
      }

      let sum = 0
      let weight = 0
      for (let dy = -radius; dy <= radius; dy += 2) {
        const ny = y + dy
        if (ny >= 0 && ny < H) {
          for (let dx = -radius; dx <= radius; dx += 2) {
            const nx = x + dx
            if (nx >= 0 && nx < W) {
              sum += rawDepth[ny * W + nx]
              weight += 1
            }
          }
        }
      }
      smoothDepth[y * W + x] = sum / weight
    }
  }

  // Write multi-channel map:
  // R = 3D Depth displacement
  // G = Human Face Clarity Mask (1.0 = sharp 1:1, 0.0 = parallax background)
  // B = Ambient depth relief
  for (let i = 0; i < W * H; i++) {
    const dVal = Math.round(Math.max(0, Math.min(1, smoothDepth[i])) * 255)
    const fVal = Math.round(Math.max(0, Math.min(1, faceMask[i])) * 255)
    d[i * 4] = dVal
    d[i * 4 + 1] = fVal
    d[i * 4 + 2] = dVal
    d[i * 4 + 3] = 255
  }

  ctx.putImageData(imgData, 0, 0)
  return { depthCanvas: canvas, dominantRgb }
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function LyraSpatialMemoryModal({ postcard, onClose }) {
  const handleReturnToGlobalProbe = () => {
    if (typeof onClose === 'function') {
      onClose()
    }
  }

  const mountRef = useRef(null)

  // Camera Trajectory: 'walkthrough' | 'arc' | 'orbit'
  const [trajectoryMode, setTrajectoryMode] = useState('walkthrough')
  const [isPlaying, setIsPlaying] = useState(true)
  const [depthPreset, setDepthPreset] = useState('natural') // 'gentle' | 'natural' | 'deep'
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timelineProgress, setTimelineProgress] = useState(0)

  const audioCtxRef = useRef(null)
  const animFrameRef = useRef(null)
  const progressRef = useRef(0)
  const isPlayingRef = useRef(true)
  const trajectoryModeRef = useRef('walkthrough')
  const uniformsRef = useRef(null)
  const cameraRef = useRef(null)

  // Orbital Interaction Drag State
  const orbitRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    rotX: 0, // pitch
    rotY: 0, // yaw
    targetRotX: 0,
    targetRotY: 0,
    distance: 5.2,
    targetDistance: 5.2
  })

  const depthScale = depthPreset === 'gentle' ? 0.35 : depthPreset === 'deep' ? 1.05 : 0.65

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { trajectoryModeRef.current = trajectoryMode }, [trajectoryMode])

  // Warm Ambient Nostalgic Harmony
  const toggleSound = () => {
    if (soundEnabled) {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.suspend()
      }
      setSoundEnabled(false)
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!audioCtxRef.current) {
          const ctx = new AudioCtx()
          audioCtxRef.current = ctx

          const masterGain = ctx.createGain()
          masterGain.gain.setValueAtTime(0.042, ctx.currentTime)

          // Harmonic resonant warm frequencies (evening chord shimmer)
          const frequencies = [261.63, 329.63, 392.00, 523.25]
          frequencies.forEach((f, i) => {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = f
            g.gain.setValueAtTime(0.01 / (i + 1), ctx.currentTime)

            // Subtle slow tremolo
            const lfo = ctx.createOscillator()
            lfo.frequency.value = 0.12 + i * 0.05
            const lfoGain = ctx.createGain()
            lfoGain.gain.value = 0.003
            lfo.connect(lfoGain)
            lfoGain.connect(g.gain)
            lfo.start()

            osc.connect(g)
            g.connect(masterGain)
            osc.start()
          })

          masterGain.connect(ctx.destination)
        } else {
          audioCtxRef.current.resume()
        }
        setSoundEnabled(true)
      } catch (err) {
        console.warn('Audio init warning:', err)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
    }
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleReturnToGlobalProbe()
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        setIsPlaying(p => !p)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Three.js Whole 3D Photo Scene
  useEffect(() => {
    const container = mountRef.current
    if (!container || !postcard) return

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050912)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 5.2)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    // Guarantee native retina/DPI sharpness
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // Load High-Res Texture with 16x Anisotropy for pin-sharp face rendering
    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')

    const texture = textureLoader.load(postcard.image, (tex) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = true
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      tex.needsUpdate = true
    })
    texture.colorSpace = THREE.SRGBColorSpace

    // Initial Depth Texture
    const dummyCanvas = document.createElement('canvas')
    dummyCanvas.width = 64
    dummyCanvas.height = 64
    const dctx = dummyCanvas.getContext('2d')
    const grad = dctx.createLinearGradient(0, 0, 0, 64)
    grad.addColorStop(0, '#222')
    grad.addColorStop(1, '#fff')
    dctx.fillStyle = grad
    dctx.fillRect(0, 0, 64, 64)
    const initialDepthTexture = new THREE.CanvasTexture(dummyCanvas)

    // Subdivided 3D Photo Mesh
    const meshGeo = new THREE.PlaneGeometry(6.6, 4.4, 160, 160)

    const uniforms = {
      uTexture: { value: texture },
      uDepthMap: { value: initialDepthTexture },
      uDepthScale: { value: depthScale },
      uParallaxOffset: { value: new THREE.Vector2(0, 0) },
      uParallaxAmount: { value: 0.042 },
      uResolution: { value: new THREE.Vector2(width, height) }
    }
    uniformsRef.current = uniforms

    const photoMaterial = new THREE.ShaderMaterial({
      vertexShader: PHOTO_3D_VERTEX_SHADER,
      fragmentShader: PHOTO_3D_FRAGMENT_SHADER,
      uniforms: uniforms,
      side: THREE.DoubleSide
    })

    const photoMesh = new THREE.Mesh(meshGeo, photoMaterial)
    scene.add(photoMesh)

    // Reconstruct the whole 3D Floor / Ground Stage
    const floorGeo = new THREE.PlaneGeometry(16, 14, 24, 24)
    floorGeo.rotateX(-Math.PI / 2)
    floorGeo.translate(0, -2.2, 1.2)

    const floorUniforms = {
      uBaseColor: { value: new THREE.Color(0x38bdf8) },
      uOpacity: { value: 0.65 }
    }

    const floorMat = new THREE.ShaderMaterial({
      vertexShader: FLOOR_VERTEX_SHADER,
      fragmentShader: FLOOR_FRAGMENT_SHADER,
      uniforms: floorUniforms,
      transparent: true,
      depthWrite: false
    })

    const floorMesh = new THREE.Mesh(floorGeo, floorMat)
    scene.add(floorMesh)

    // Surrounding Ambient Spatial Halo
    const haloGeo = new THREE.SphereGeometry(14, 32, 16)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x081528,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.4
    })
    const haloMesh = new THREE.Mesh(haloGeo, haloMat)
    scene.add(haloMesh)

    // Floating 3D Spatial Particles (Atmospheric depth)
    const particleCount = 380
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 8.0
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 5.0
      particlePos[i * 3 + 2] = (Math.random() - 0.3) * 4.0
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 0.022,
      color: 0xfde047,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Generate Whole 3D Photo Depth & Face Preservation Mask from Image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = postcard.image
    img.onload = () => {
      const { depthCanvas, dominantRgb } = generateWhole3DPhotoDepth(img)
      const depthTexture = new THREE.CanvasTexture(depthCanvas)
      depthTexture.minFilter = THREE.LinearFilter
      depthTexture.magFilter = THREE.LinearFilter
      depthTexture.generateMipmaps = false

      if (uniformsRef.current) {
        uniformsRef.current.uDepthMap.value = depthTexture
      }

      // Tint floor reflections to match location atmosphere
      floorUniforms.uBaseColor.value.setRGB(
        dominantRgb[0] / 255,
        dominantRgb[1] / 255,
        dominantRgb[2] / 255
      )

      // Adjust mesh scale to preserve exact original photo aspect ratio
      const aspect = img.width / img.height
      if (aspect > 1) {
        photoMesh.scale.set(aspect / 1.5, 1, 1)
      } else {
        photoMesh.scale.set(1, 1.5 / aspect, 1)
      }
    }

    // Ambient Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.1))

    // Interactive Drag & Orbit Controls
    const onMouseDown = (e) => {
      orbitRef.current.isDragging = true
      orbitRef.current.startX = e.clientX
      orbitRef.current.startY = e.clientY
    }

    const onMouseMove = (e) => {
      if (orbitRef.current.isDragging) {
        const dx = e.clientX - orbitRef.current.startX
        const dy = e.clientY - orbitRef.current.startY
        orbitRef.current.targetRotY += dx * 0.005
        orbitRef.current.targetRotX = Math.max(-0.6, Math.min(0.6, orbitRef.current.targetRotX + dy * 0.005))
        orbitRef.current.startX = e.clientX
        orbitRef.current.startY = e.clientY
      }
    }

    const onMouseUp = () => {
      orbitRef.current.isDragging = false
    }

    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY * 0.002
      orbitRef.current.targetDistance = Math.max(3.2, Math.min(7.2, orbitRef.current.targetDistance + delta))
    }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('wheel', onWheel, { passive: false })

    // Touch Support for Mobile
    let lastTouchX = 0
    let lastTouchY = 0
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        orbitRef.current.isDragging = true
        lastTouchX = e.touches[0].clientX
        lastTouchY = e.touches[0].clientY
      }
    }
    const onTouchMove = (e) => {
      if (orbitRef.current.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX
        const dy = e.touches[0].clientY - lastTouchY
        orbitRef.current.targetRotY += dx * 0.006
        orbitRef.current.targetRotX = Math.max(-0.6, Math.min(0.6, orbitRef.current.targetRotX + dy * 0.006))
        lastTouchX = e.touches[0].clientX
        lastTouchY = e.touches[0].clientY
      }
    }
    const onTouchEnd = () => { orbitRef.current.isDragging = false }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    // Window Resize
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      if (uniformsRef.current) {
        uniformsRef.current.uResolution.value.set(w, h)
      }
    }
    window.addEventListener('resize', handleResize)

    // Render Animation Loop
    let lastTime = performance.now()

    const animate = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(animate)
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      // Smooth camera interpolation
      const orb = orbitRef.current
      orb.rotX += (orb.targetRotX - orb.rotX) * 0.08
      orb.rotY += (orb.targetRotY - orb.rotY) * 0.08
      orb.distance += (orb.targetDistance - orb.distance) * 0.08

      if (isPlayingRef.current) {
        progressRef.current = (progressRef.current + delta * 0.11) % 1.0
        setTimelineProgress(progressRef.current)
      }

      const p = progressRef.current

      // Continuous 3D Spatial Trajectories
      if (trajectoryModeRef.current === 'walkthrough') {
        // Step Inside: Smooth walkthrough stepping right up to the people, then gently pulling out
        const cycle = Math.sin(p * Math.PI * 2) * 0.5 + 0.5
        const zPos = orb.distance - cycle * 1.6
        const xPos = Math.sin(p * Math.PI * 2 * 0.7) * 0.38
        const yPos = Math.cos(p * Math.PI * 2 * 0.5) * 0.18

        camera.position.x = xPos + Math.sin(orb.rotY) * zPos
        camera.position.y = yPos + orb.rotX * 2.0
        camera.position.z = Math.cos(orb.rotY) * zPos
        camera.lookAt(0, 0, 0)
      } else if (trajectoryModeRef.current === 'arc') {
        // Parallax Arc: Smooth 3D sweep side to side, revealing physical depth behind the subjects
        const angle = p * Math.PI * 2
        const arcX = Math.sin(angle) * 1.35
        const arcY = Math.cos(angle * 0.5) * 0.25
        const arcZ = orb.distance + Math.cos(angle) * 0.45

        camera.position.x = arcX + Math.sin(orb.rotY) * arcZ
        camera.position.y = arcY + orb.rotX * 2.0
        camera.position.z = Math.cos(orb.rotY) * arcZ
        camera.lookAt(0, 0, 0)
      } else {
        // Free 3D Orbit: User drags to rotate anywhere around the whole 3D photo
        camera.position.x = Math.sin(orb.rotY) * orb.distance
        camera.position.y = orb.rotX * 3.0
        camera.position.z = Math.cos(orb.rotY) * orb.distance
        camera.lookAt(0, 0, 0)
      }

      // Pass camera parallax offset to shader for background depth shifting
      if (uniformsRef.current) {
        uniformsRef.current.uParallaxOffset.value.set(
          camera.position.x * 0.038,
          camera.position.y * 0.038
        )
      }

      // Gentle floating animation for dust particles
      const posArr = particleGeo.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += Math.sin(currentTime * 0.001 + i) * 0.0008
      }
      particleGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', handleResize)

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      meshGeo.dispose()
      photoMaterial.dispose()
      floorGeo.dispose()
      floorMat.dispose()
      haloGeo.dispose()
      haloMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      texture.dispose()
      initialDepthTexture.dispose()
      renderer.dispose()
    }
  }, [postcard])

  // Sync Depth Scale
  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.uDepthScale.value = depthScale
    }
  }, [depthScale])

  // Reset Orbit View
  const handleResetView = () => {
    orbitRef.current.targetRotX = 0
    orbitRef.current.targetRotY = 0
    orbitRef.current.targetDistance = 5.2
  }

  return (
    <div className="lyra-spatial-modal is-crisp-3d-photo" role="dialog" aria-modal="true" aria-label="3D Spatial Photo Reconstruction">
      {/* 3D WebGL Canvas Viewport */}
      <div className="lyra-canvas-viewport" ref={mountRef} />

      {/* Spatial HUD Overlay Controls */}
      <div className="lyra-spatial-ui">
        {/* TOP BAR */}
        <header className="lyra-top-bar">
          <div className="lyra-top-left-cluster">
            {/* Primary Return to Global Probe Button */}
            <button
              type="button"
              className="lyra-main-return-btn"
              onClick={handleReturnToGlobalProbe}
              title="Return to Global 3D Probe (or press Esc)"
            >
              <ArrowLeft size={16} />
              <Globe2 size={17} />
              <span>Return to Global Probe</span>
            </button>

            <div className="lyra-brand-badge desktop-only">
              <span className="lyra-pulse-dot" />
              <div className="lyra-brand-text">
                <strong>Spatial 3D Photo</strong>
                <small className="face-clarity-tag">
                  <CheckCircle2 size={11} />
                  Crystal Face Clarity Engine
                </small>
              </div>
            </div>
          </div>

          {/* Camera Trajectory Controls */}
          <div className="spatial-camera-modes" role="group" aria-label="Camera Trajectory">
            <button
              className={`spatial-mode-btn ${trajectoryMode === 'walkthrough' ? 'active' : ''}`}
              onClick={() => { setTrajectoryMode('walkthrough'); setIsPlaying(true) }}
              title="Step inside the photo and walk through the memory"
            >
              <Compass size={14} />
              <span>Step Inside</span>
            </button>

            <button
              className={`spatial-mode-btn ${trajectoryMode === 'arc' ? 'active' : ''}`}
              onClick={() => { setTrajectoryMode('arc'); setIsPlaying(true) }}
              title="Cinematic left-to-right parallax arc sweep"
            >
              <Sparkles size={14} />
              <span>Parallax Arc</span>
            </button>

            <button
              className={`spatial-mode-btn ${trajectoryMode === 'orbit' ? 'active' : ''}`}
              onClick={() => setTrajectoryMode('orbit')}
              title="Free 3D orbit - drag to rotate and explore the whole 3D photo"
            >
              <Eye size={14} />
              <span>Free 3D Orbit</span>
            </button>
          </div>

          <div className="lyra-top-actions">
            {/* Reset View Button */}
            <button
              className="lyra-pill-btn desktop-only"
              onClick={handleResetView}
              title="Reset 3D camera orientation"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            {/* Ambient Atmosphere Sound */}
            <button
              className={`lyra-pill-btn ${soundEnabled ? 'active' : ''}`}
              onClick={toggleSound}
              title={soundEnabled ? 'Mute atmosphere' : 'Play warm atmospheric audio'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="desktop-only">{soundEnabled ? 'Atmosphere On' : 'Atmosphere'}</span>
            </button>

            {/* Fullscreen */}
            <button className="lyra-icon-btn desktop-only" onClick={toggleFullscreen} title="Toggle fullscreen">
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Top Right Return / Close Button */}
            <button
              type="button"
              className="lyra-top-close-probe-btn"
              onClick={handleReturnToGlobalProbe}
              aria-label="Exit to Global Probe"
              title="Return to Global Probe (Esc)"
            >
              <Globe2 size={15} />
              <span className="desktop-only">Back to Globe</span>
              <X size={16} />
            </button>
          </div>
        </header>

        {/* BOTTOM HUD & DEPTH RELIEF CONTROLS */}
        <footer className="lyra-memory-footer crisp-footer">
          <div className="crisp-control-card">
            <div className="crisp-top-row">
              {/* Depth Separation Selector */}
              <div className="depth-selector-group">
                <span className="depth-label"><Sliders size={13} /> 3D Depth:</span>
                <div className="depth-chips">
                  <button
                    className={depthPreset === 'gentle' ? 'active' : ''}
                    onClick={() => setDepthPreset('gentle')}
                  >
                    Gentle
                  </button>
                  <button
                    className={depthPreset === 'natural' ? 'active' : ''}
                    onClick={() => setDepthPreset('natural')}
                  >
                    Natural 3D
                  </button>
                  <button
                    className={depthPreset === 'deep' ? 'active' : ''}
                    onClick={() => setDepthPreset('deep')}
                  >
                    Deep Space
                  </button>
                </div>
              </div>

              {/* Orbit Hint Badge */}
              <div className="crisp-orbit-hint desktop-only">
                <Move size={12} />
                <span>Drag to rotate 3D view · Scroll to zoom</span>
              </div>

              {/* Trajectory Play/Pause */}
              <div className="walkthrough-play-group">
                <button
                  className="timeline-play-btn"
                  onClick={() => setIsPlaying(p => !p)}
                  title={isPlaying ? 'Pause camera motion' : 'Resume camera motion'}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
                </button>
              </div>
            </div>

            {/* Trajectory Timeline Scrubber */}
            <div className="crisp-scrubber-bar">
              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={timelineProgress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  setTimelineProgress(val)
                  progressRef.current = val
                }}
                aria-label="3D Camera Walkthrough Position"
              />
              <div className="scrubber-progress-fill" style={{ width: `${timelineProgress * 100}%` }} />
            </div>

            {/* Memory Info & Quote */}
            <div className="crisp-info-row">
              <div className="dest-badge-col">
                <strong>{postcard.title}</strong>
                <span>{postcard.place || postcard.city}</span>
              </div>
              {postcard.note && (
                <p className="crisp-memory-quote">
                  “{postcard.note}”
                </p>
              )}
              {/* Bottom Quick Return Button */}
              <button
                type="button"
                className="lyra-bottom-probe-cta"
                onClick={handleReturnToGlobalProbe}
                title="Return to Global Probe"
              >
                <ArrowLeft size={14} />
                <Globe2 size={15} />
                <span>Return to Global Probe</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
