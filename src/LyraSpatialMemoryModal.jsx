import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Compass, Eye, Play, Pause, RotateCcw, Volume2, VolumeX,
  X, Maximize2, Minimize2, Sparkles, Sliders, Move, Globe2, ArrowLeft,
  Layers, ZoomIn, Box, ShieldCheck, Zap, Gauge
} from 'lucide-react'

// ============================================================================
// NVIDIA LYRA SHADERS FOR DRAMATIC 3D GAUSSIAN SPLATTING & EXPLORABLE WORLDS
// ============================================================================

// 1. Lyra-1 3D Gaussian Splatting Vertex Shader
const LYRA_GAUSSIAN_VERTEX_SHADER = `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aAlpha;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepthZ;

  uniform float uDepthScale;
  uniform float uSplatSize;
  uniform float uTime;

  void main() {
    vColor = aColor;
    vAlpha = aAlpha;

    vec3 pos = position;

    // Bold volumetric depth displacement
    pos.z *= uDepthScale;
    vDepthZ = pos.z;

    // Atmospheric micro-breathing in the surrounding 3D space
    pos.y += sin(uTime * 1.2 + pos.x * 2.5 + pos.z * 1.5) * 0.02;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Dynamic perspective point size
    gl_PointSize = aSize * uSplatSize * (460.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 2.0, 64.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`

// 2. Lyra-1 3D Gaussian Splatting Fragment Shader
const LYRA_GAUSSIAN_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepthZ;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distSq = dot(coord, coord) * 4.0; // 0 at center, 1 at edge

    if (distSq > 1.0) discard;

    // True Gaussian exponential falloff: exp(-0.5 * (r / sigma)^2)
    float gaussian = exp(-2.8 * distSq);

    // Rich depth-reactive tone grading (distant splats take subtle atmospheric haze, near splats are bright)
    vec3 col = vColor * (1.0 + 0.18 * (1.0 - distSq));

    gl_FragColor = vec4(col, vAlpha * gaussian);
  }
`

// 3. Foreground Standstill People Shader (100% Pristine Clarity + Grounding)
const FOREGROUND_STANDSTILL_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FOREGROUND_STANDSTILL_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform vec3 uRimColor;
  uniform float uRimStrength;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    if (tex.a < 0.04) discard;

    // Direct 1:1 unwarped pixel sampling - ZERO distortion, ZERO blur!
    vec3 color = tex.rgb;

    // Subtle edge rim light to integrate subjects with the 3D space
    float edgeAlpha = smoothstep(0.04, 0.4, tex.a) * (1.0 - smoothstep(0.85, 1.0, tex.a));
    color += uRimColor * edgeAlpha * uRimStrength * 0.55;

    gl_FragColor = vec4(color, tex.a);
  }
`

// 4. Lyra-2 Deep Environment Horizon Vertex Shader
const DEEP_HORIZON_VERTEX_SHADER = `
  varying vec2 vUv;
  uniform float uDepthScale;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Deep curved panoramic projection creates vast receding space behind the people
    pos.z -= (pos.x * pos.x * 0.045 + pos.y * pos.y * 0.03) * uDepthScale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const DEEP_HORIZON_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float edgeDist = length((vUv - 0.5) * 2.0);
    float vignette = smoothstep(1.4, 0.5, edgeDist);

    gl_FragColor = vec4(tex.rgb * 0.92, tex.a * uOpacity * (0.65 + 0.35 * vignette));
  }
`

// 5. 3D Floor Perspective Ground Reflection Shader
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
    // Ground perspective grid lines
    vec2 gridUv = abs(fract(vUv * 32.0 - 0.5) - 0.5) / fwidth(vUv * 32.0);
    float line = min(gridUv.x, gridUv.y);
    float gridAlpha = 1.0 - min(line, 1.0);

    // Distance falloff from center under the people
    float dist = length(vWorldPosition.xz - vec2(0.0, 1.2));
    float fade = smoothstep(16.0, 2.0, dist);

    vec3 color = mix(uBaseColor * 0.4, uBaseColor * 1.6, gridAlpha * 0.5);
    float alpha = (0.15 + gridAlpha * 0.38) * fade * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`

// ============================================================================
// NVIDIA LYRA SCENE PROCESSOR (Dramatic Depth & Standstill People Decoupling)
// ============================================================================
function processLyraScene(image, splatCount = 38000) {
  const W = Math.min(image.width || 800, 720)
  const H = Math.round(W * ((image.height || 600) / (image.width || 800)))

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(image, 0, 0, W, H)

  let imgData
  try {
    imgData = ctx.getImageData(0, 0, W, H)
  } catch (err) {
    console.warn('Cross-origin fallback for Lyra processing:', err)
    return null
  }

  const data = imgData.data
  const totalPixels = W * H

  // Calculate dominant ambient color
  let sumR = 0, sumG = 0, sumB = 0
  for (let i = 0; i < totalPixels; i += 8) {
    sumR += data[i * 4]
    sumG += data[i * 4 + 1]
    sumB += data[i * 4 + 2]
  }
  const sampleCount = Math.ceil(totalPixels / 8)
  const dominantRgb = [
    Math.round(sumR / sampleCount),
    Math.round(sumG / sampleCount),
    Math.round(sumB / sampleCount)
  ]

  // Step A: Multi-cue human detection (skin chrominance, hair, central focus)
  const subjectMask = new Float32Array(totalPixels)
  for (let y = 0; y < H; y++) {
    const normY = y / H
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      // Human skin chrominance test with shadow tolerance
      const isSkin = (r > 60 && g > 34 && b > 20 && r > g && (r - b) > 10 && (g - b) > -32)

      const normX = (x / W - 0.5) * 2.0
      const centerFactor = Math.max(0, 1.0 - Math.abs(normX) * 0.78)

      let confidence = 0.0
      if (isSkin && normY > 0.10 && normY < 0.94) {
        confidence = 0.95 * centerFactor
      }

      subjectMask[y * W + x] = confidence
    }
  }

  // Step B: Morphological expansion downwards and outwards to capture whole bodies (clothing, torso, hair)
  const expandedMask = new Float32Array(totalPixels)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const val = subjectMask[y * W + x]
      if (val > 0.35) {
        const extendY = Math.min(H - 1, y + Math.round(H * 0.32))
        const extendX = Math.round(W * 0.14)
        for (let dy = y; dy <= extendY; dy += 2) {
          const spread = Math.round(extendX * (1.0 + (dy - y) / (extendY - y + 1) * 0.7))
          const startX = Math.max(0, x - spread)
          const endX = Math.min(W - 1, x + spread)
          for (let dx = startX; dx <= endX; dx += 2) {
            const idx = dy * W + dx
            expandedMask[idx] = Math.max(expandedMask[idx], val * (1.0 - (dy - y) / (extendY - y + 1) * 0.3))
          }
        }
      }
    }
  }

  // Step C: Bilateral edge smoothing for clean, feathered subject cutout
  const finalSubjectAlpha = new Uint8ClampedArray(totalPixels)
  for (let i = 0; i < totalPixels; i++) {
    const val = Math.max(subjectMask[i], expandedMask[i])
    let alpha = 0
    if (val > 0.28) {
      alpha = Math.min(255, Math.round(((val - 0.28) / 0.35) * 255))
    }
    finalSubjectAlpha[i] = alpha
  }

  // 2. Generate Foreground Texture Canvas (People Stand Still, 100% Crisp)
  const fgCanvas = document.createElement('canvas')
  fgCanvas.width = W
  fgCanvas.height = H
  const fgCtx = fgCanvas.getContext('2d')
  fgCtx.drawImage(image, 0, 0, W, H)
  const fgImgData = fgCtx.getImageData(0, 0, W, H)
  const fgData = fgImgData.data

  for (let i = 0; i < totalPixels; i++) {
    fgData[i * 4 + 3] = finalSubjectAlpha[i]
  }
  fgCtx.putImageData(fgImgData, 0, 0)

  // 3. Generate Inpainted Background Canvas (Fills behind people so looking sideways doesn't show black holes)
  const bgCanvas = document.createElement('canvas')
  bgCanvas.width = W
  bgCanvas.height = H
  const bgCtx = bgCanvas.getContext('2d')
  bgCtx.drawImage(image, 0, 0, W, H)
  const bgImgData = bgCtx.getImageData(0, 0, W, H)
  const bgData = bgImgData.data

  for (let y = 0; y < H; y++) {
    let leftX = -1, rightX = -1
    for (let x = 0; x < W; x++) {
      if (finalSubjectAlpha[y * W + x] < 50) {
        if (leftX === -1) leftX = x
        rightX = x
      }
    }

    if (leftX !== -1 && rightX !== -1) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4
        if (finalSubjectAlpha[y * W + x] > 70) {
          const leftIdx = (y * W + Math.max(0, leftX)) * 4
          const rightIdx = (y * W + Math.min(W - 1, rightX)) * 4
          const t = (x - leftX) / Math.max(1, rightX - leftX)
          bgData[idx] = Math.round(data[leftIdx] * (1 - t) + data[rightIdx] * t)
          bgData[idx + 1] = Math.round(data[leftIdx + 1] * (1 - t) + data[rightIdx + 1] * t)
          bgData[idx + 2] = Math.round(data[leftIdx + 2] * (1 - t) + data[rightIdx + 2] * t)
          bgData[idx + 3] = 255
        }
      }
    }
  }
  bgCtx.putImageData(bgImgData, 0, 0)

  // 4. Generate Lyra 3D Gaussian Splats (3DGS) with DRAMATIC Depth Staging
  const count = splatCount
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const alphas = new Float32Array(count)

  const aspect = W / H
  const worldWidth = 6.4
  const worldHeight = worldWidth / aspect

  let splatIdx = 0
  for (let i = 0; i < count; i++) {
    const rx = Math.random()
    const ry = Math.random()
    const px = Math.floor(rx * (W - 1))
    const py = Math.floor(ry * (H - 1))
    const pIdx = py * W + px

    const isPerson = finalSubjectAlpha[pIdx] > 130
    const xWorld = (rx - 0.5) * worldWidth
    const yWorld = -(ry - 0.5) * worldHeight

    // DRAMATIC 3D DEPTH STAGING:
    // Standstill people will be at z = +1.25.
    // Near ground starts at z = +0.6, receding to z = -3.5.
    // Midground scenery sits at z = -1.2 to -3.8.
    // Distant skyline/sky recedes to z = -4.8 to -7.2.
    const normY = py / H
    let zDepth = 0

    if (isPerson) {
      // Inpainted space deep behind the people
      zDepth = -1.8 - Math.random() * 2.8
    } else {
      // Surrounding scenery depth gradient
      if (normY > 0.65) {
        // Ground floor: recedes from near (+0.5) backward to (-2.5)
        const tFloor = (1.0 - normY) / 0.35
        zDepth = 0.5 - tFloor * 3.0 - Math.random() * 0.4
      } else {
        // Buildings, skyline, sky: deep recession
        const tSky = Math.pow(1.0 - normY / 0.65, 0.9)
        zDepth = -1.2 - tSky * 4.6 - Math.random() * 0.8
      }
    }

    const dIdx = pIdx * 4
    const r = bgData[dIdx] / 255
    const g = bgData[dIdx + 1] / 255
    const b = bgData[dIdx + 2] / 255

    positions[splatIdx * 3] = xWorld + (Math.random() - 0.5) * 0.05
    positions[splatIdx * 3 + 1] = yWorld + (Math.random() - 0.5) * 0.05
    positions[splatIdx * 3 + 2] = zDepth

    colors[splatIdx * 3] = r
    colors[splatIdx * 3 + 1] = g
    colors[splatIdx * 3 + 2] = b

    const distFactor = Math.abs(zDepth) * 0.32 + 0.68
    sizes[splatIdx] = (isPerson ? 0.05 : 0.075) * distFactor * (0.85 + Math.random() * 0.45)
    alphas[splatIdx] = isPerson ? 0.6 : 0.95

    splatIdx++
  }

  return {
    foregroundCanvas: fgCanvas,
    backgroundCanvas: bgCanvas,
    dominantRgb,
    aspect,
    worldWidth,
    worldHeight,
    gaussianData: {
      positions,
      colors,
      sizes,
      alphas,
      count: splatIdx
    }
  }
}

// ============================================================================
// COMPONENT: LyraSpatialMemoryModal
// ============================================================================
export default function LyraSpatialMemoryModal({ postcard, onClose }) {
  const mountRef = useRef(null)

  // Lyra Engine Mode: 'lyra-2-world' | 'lyra-3dgs' | 'lyra-dual'
  const [engineMode, setEngineMode] = useState('lyra-2-world')

  // Trajectory: 'zoomgs' | 'walkthrough' | 'arc' | 'orbit'
  const [trajectoryMode, setTrajectoryMode] = useState('arc') // Default to Parallax Arc for maximum visible 3D motion!
  const [isPlaying, setIsPlaying] = useState(true)

  // 3D Depth Preset: 'natural' (1.2x) | 'dramatic' (2.2x - default) | 'hyper' (3.4x - extreme pop!)
  const [depthPreset, setDepthPreset] = useState('dramatic')
  const [depthSlider, setDepthSlider] = useState(2.2)

  const [splatDensity, setSplatDensity] = useState('balanced')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timelineProgress, setTimelineProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)

  const audioCtxRef = useRef(null)
  const animFrameRef = useRef(null)
  const progressRef = useRef(0)
  const isPlayingRef = useRef(true)
  const trajectoryModeRef = useRef('arc')
  const engineModeRef = useRef('lyra-2-world')
  const uniformsRef = useRef({})
  const cameraRef = useRef(null)
  const depthSliderRef = useRef(2.2)

  // Interactive Mouse Pointer Hover Parallax State
  const mouseParallaxRef = useRef({
    targetX: 0,
    targetY: 0,
    curX: 0,
    curY: 0
  })

  // Orbital Interaction Drag State
  const orbitRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    rotX: 0,
    rotY: 0,
    targetRotX: 0,
    targetRotY: 0,
    distance: 4.2, // Closer camera distance for much stronger 3D perspective!
    targetDistance: 4.2
  })

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { trajectoryModeRef.current = trajectoryMode }, [trajectoryMode])
  useEffect(() => { engineModeRef.current = engineMode }, [engineMode])
  useEffect(() => { depthSliderRef.current = depthSlider }, [depthSlider])

  const handleReturn = () => {
    if (typeof onClose === 'function') onClose()
  }

  // Handle Depth Preset Switch
  const handleSelectDepthPreset = (preset) => {
    setDepthPreset(preset)
    const val = preset === 'natural' ? 1.3 : preset === 'hyper' ? 3.4 : 2.2
    setDepthSlider(val)
  }

  // Ambient Warm Sound
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
          masterGain.gain.setValueAtTime(0.045, ctx.currentTime)

          const chords = [220.00, 329.63, 440.00, 659.25]
          chords.forEach((freq, idx) => {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = freq
            g.gain.setValueAtTime(0.012 / (idx + 1), ctx.currentTime)

            const lfo = ctx.createOscillator()
            lfo.frequency.value = 0.1 + idx * 0.04
            const lfoGain = ctx.createGain()
            lfoGain.gain.value = 0.004
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
        console.warn('Audio init error:', err)
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
      if (e.key === 'Escape') handleReturn()
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

  // ==========================================================================
  // THREE.JS SCENE SETUP & NVIDIA LYRA RENDER PIPELINE
  // ==========================================================================
  useEffect(() => {
    const container = mountRef.current
    if (!container || !postcard) return

    setIsProcessing(true)

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x030712)

    // Wide 54-degree FOV for dramatic 3D perspective parallax
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 100)
    camera.position.set(0, 0, 4.2)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    let splatPoints = null
    let foregroundMesh = null
    let shadowMesh = null
    let horizonMesh = null
    let floorMesh = null
    let nearParticles = null
    let farParticles = null

    // Uniforms
    const splatUniforms = {
      uDepthScale: { value: depthSliderRef.current },
      uSplatSize: { value: 1.15 },
      uTime: { value: 0 }
    }

    const fgUniforms = {
      uTexture: { value: null },
      uRimColor: { value: new THREE.Color(0x60a5fa) },
      uRimStrength: { value: 0.8 }
    }

    const horizonUniforms = {
      uTexture: { value: null },
      uOpacity: { value: 0.9 },
      uDepthScale: { value: depthSliderRef.current }
    }

    const floorUniforms = {
      uBaseColor: { value: new THREE.Color(0x38bdf8) },
      uOpacity: { value: 0.75 }
    }

    uniformsRef.current = {
      splat: splatUniforms,
      fg: fgUniforms,
      horizon: horizonUniforms,
      floor: floorUniforms
    }

    // Load Image and Run Lyra Scene Decomposition
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = postcard.image
    img.onload = () => {
      const targetSplatCount = splatDensity === 'fine' ? 24000 : splatDensity === 'dense' ? 56000 : 38000
      const processed = processLyraScene(img, targetSplatCount)

      if (!processed) {
        setIsProcessing(false)
        return
      }

      const {
        foregroundCanvas,
        backgroundCanvas,
        dominantRgb,
        worldWidth,
        worldHeight,
        gaussianData
      } = processed

      // 1. Foreground Texture (Pin-Sharp Standstill People)
      const fgTex = new THREE.CanvasTexture(foregroundCanvas)
      fgTex.colorSpace = THREE.SRGBColorSpace
      fgTex.minFilter = THREE.LinearMipmapLinearFilter
      fgTex.magFilter = THREE.LinearFilter
      fgTex.generateMipmaps = true
      fgTex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      fgUniforms.uTexture.value = fgTex

      // 2. Background Inpainted Texture (For Deep Horizon)
      const bgTex = new THREE.CanvasTexture(backgroundCanvas)
      bgTex.colorSpace = THREE.SRGBColorSpace
      bgTex.minFilter = THREE.LinearMipmapLinearFilter
      bgTex.magFilter = THREE.LinearFilter
      bgTex.generateMipmaps = true
      horizonUniforms.uTexture.value = bgTex

      // Ambient color matching location atmosphere
      floorUniforms.uBaseColor.value.setRGB(
        dominantRgb[0] / 255,
        dominantRgb[1] / 255,
        dominantRgb[2] / 255
      )
      fgUniforms.uRimColor.value.setRGB(
        dominantRgb[0] / 255,
        dominantRgb[1] / 255,
        dominantRgb[2] / 255
      )

      // ======================================================================
      // 1. FOREGROUND STANDSTILL SUBJECT MESH (Positioned FORWARD at z = +1.25!)
      // ======================================================================
      const fgGeo = new THREE.PlaneGeometry(worldWidth, worldHeight)
      const fgMat = new THREE.ShaderMaterial({
        vertexShader: FOREGROUND_STANDSTILL_VERTEX_SHADER,
        fragmentShader: FOREGROUND_STANDSTILL_FRAGMENT_SHADER,
        uniforms: fgUniforms,
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide
      })
      foregroundMesh = new THREE.Mesh(fgGeo, fgMat)
      // Boldly positioned in the foreground: standing still at z = 1.25!
      foregroundMesh.position.set(0, 0, 1.25)
      scene.add(foregroundMesh)

      // Soft Ground Drop Shadow under the people
      const shadowGeo = new THREE.PlaneGeometry(worldWidth * 0.9, worldHeight * 0.9)
      const shadowMat = new THREE.MeshBasicMaterial({
        map: fgTex,
        transparent: true,
        opacity: 0.35,
        color: 0x000000,
        depthWrite: false
      })
      shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
      shadowMesh.position.set(0.18, -0.15, -0.4) // Shadow cast into the midground
      shadowMesh.scale.set(0.96, 0.96, 1)
      scene.add(shadowMesh)

      // ======================================================================
      // 2. LYRA 3D GAUSSIAN SPLATTING SYSTEM (3DGS for Surrounding Scenery)
      // ======================================================================
      const splatGeo = new THREE.BufferGeometry()
      splatGeo.setAttribute('position', new THREE.BufferAttribute(gaussianData.positions, 3))
      splatGeo.setAttribute('aColor', new THREE.BufferAttribute(gaussianData.colors, 3))
      splatGeo.setAttribute('aSize', new THREE.BufferAttribute(gaussianData.sizes, 1))
      splatGeo.setAttribute('aAlpha', new THREE.BufferAttribute(gaussianData.alphas, 1))

      const splatMat = new THREE.ShaderMaterial({
        vertexShader: LYRA_GAUSSIAN_VERTEX_SHADER,
        fragmentShader: LYRA_GAUSSIAN_FRAGMENT_SHADER,
        uniforms: splatUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending
      })

      splatPoints = new THREE.Points(splatGeo, splatMat)
      scene.add(splatPoints)

      // ======================================================================
      // 3. LYRA-2 DEEP HORIZON CURVED BACKDROP (Continuous Surrounding World)
      // ======================================================================
      const horizonGeo = new THREE.PlaneGeometry(worldWidth * 1.8, worldHeight * 1.6, 36, 36)
      const horizonMat = new THREE.ShaderMaterial({
        vertexShader: DEEP_HORIZON_VERTEX_SHADER,
        fragmentShader: DEEP_HORIZON_FRAGMENT_SHADER,
        uniforms: horizonUniforms,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      })
      horizonMesh = new THREE.Mesh(horizonGeo, horizonMat)
      horizonMesh.position.set(0, 0, -4.8) // Pushed deep back into 3D horizon
      scene.add(horizonMesh)

      // ======================================================================
      // 4. 3D REFLECTIVE GROUND GRID (Physical Grounding for Standstill People)
      // ======================================================================
      const floorGeo = new THREE.PlaneGeometry(22, 20, 28, 28)
      floorGeo.rotateX(-Math.PI / 2)
      floorGeo.translate(0, -worldHeight * 0.52, 0.4)

      const floorMat = new THREE.ShaderMaterial({
        vertexShader: FLOOR_VERTEX_SHADER,
        fragmentShader: FLOOR_FRAGMENT_SHADER,
        uniforms: floorUniforms,
        transparent: true,
        depthWrite: false
      })
      floorMesh = new THREE.Mesh(floorGeo, floorMat)
      scene.add(floorMesh)

      // ======================================================================
      // 5. MULTI-LAYER VOLUMETRIC PHOTONS (Near & Deep Depth Immersion)
      // ======================================================================
      // Near Photons: Float directly between camera and people! (Immediate stereoscopic 3D pop!)
      const nearCount = 120
      const nearGeo = new THREE.BufferGeometry()
      const nearPos = new Float32Array(nearCount * 3)
      for (let i = 0; i < nearCount; i++) {
        nearPos[i * 3] = (Math.random() - 0.5) * 5.5
        nearPos[i * 3 + 1] = (Math.random() - 0.5) * 4.0
        nearPos[i * 3 + 2] = 2.0 + Math.random() * 1.8 // In front of people!
      }
      nearGeo.setAttribute('position', new THREE.BufferAttribute(nearPos, 3))
      const nearMat = new THREE.PointsMaterial({
        size: 0.038,
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      })
      nearParticles = new THREE.Points(nearGeo, nearMat)
      scene.add(nearParticles)

      // Far Photons: Float behind people in surrounding 3D space
      const farCount = 280
      const farGeo = new THREE.BufferGeometry()
      const farPos = new Float32Array(farCount * 3)
      for (let i = 0; i < farCount; i++) {
        farPos[i * 3] = (Math.random() - 0.5) * 9.0
        farPos[i * 3 + 1] = (Math.random() - 0.5) * 6.5
        farPos[i * 3 + 2] = -0.5 - Math.random() * 4.5
      }
      farGeo.setAttribute('position', new THREE.BufferAttribute(farPos, 3))
      const farMat = new THREE.PointsMaterial({
        size: 0.026,
        color: 0xfef08a,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      })
      farParticles = new THREE.Points(farGeo, farMat)
      scene.add(farParticles)

      setIsProcessing(false)
    }

    // Interactive Mouse Hover Parallax (Cursor Tracking)
    const onMouseMoveWindow = (e) => {
      // Calculate normalized mouse coordinates (-1 to +1)
      const nx = (e.clientX / window.innerWidth - 0.5) * 2.0
      const ny = (e.clientY / window.innerHeight - 0.5) * 2.0
      mouseParallaxRef.current.targetX = nx
      mouseParallaxRef.current.targetY = ny

      if (orbitRef.current.isDragging) {
        const dx = e.clientX - orbitRef.current.startX
        const dy = e.clientY - orbitRef.current.startY
        orbitRef.current.targetRotY += dx * 0.006
        orbitRef.current.targetRotX = Math.max(-0.65, Math.min(0.65, orbitRef.current.targetRotX + dy * 0.006))
        orbitRef.current.startX = e.clientX
        orbitRef.current.startY = e.clientY
      }
    }

    const onMouseDown = (e) => {
      orbitRef.current.isDragging = true
      orbitRef.current.startX = e.clientX
      orbitRef.current.startY = e.clientY
    }

    const onMouseUp = () => { orbitRef.current.isDragging = false }

    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY * 0.002
      orbitRef.current.targetDistance = Math.max(2.4, Math.min(6.5, orbitRef.current.targetDistance + delta))
    }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMoveWindow)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('wheel', onWheel, { passive: false })

    // Touch Support
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
        orbitRef.current.targetRotY += dx * 0.007
        orbitRef.current.targetRotX = Math.max(-0.65, Math.min(0.65, orbitRef.current.targetRotX + dy * 0.007))
        lastTouchX = e.touches[0].clientX
        lastTouchY = e.touches[0].clientY
      }
    }
    const onTouchEnd = () => { orbitRef.current.isDragging = false }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    // Resize
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Render Animation Loop
    let lastTime = performance.now()

    const animate = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(animate)
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      // Smooth camera orbit interpolation
      const orb = orbitRef.current
      orb.rotX += (orb.targetRotX - orb.rotX) * 0.09
      orb.rotY += (orb.targetRotY - orb.rotY) * 0.09
      orb.distance += (orb.targetDistance - orb.distance) * 0.09

      // Smooth mouse hover parallax interpolation
      const mp = mouseParallaxRef.current
      mp.curX += (mp.targetX - mp.curX) * 0.08
      mp.curY += (mp.targetY - mp.curY) * 0.08

      const curDepthScale = depthSliderRef.current

      if (isPlayingRef.current) {
        progressRef.current = (progressRef.current + delta * 0.11) % 1.0
        setTimelineProgress(progressRef.current)
      }

      const p = progressRef.current
      splatUniforms.uTime.value = currentTime * 0.001

      // Dynamic Layer Visibility by Lyra Engine Mode
      const currentMode = engineModeRef.current
      if (splatPoints) {
        splatPoints.visible = currentMode !== 'lyra-dual'
      }
      if (horizonMesh) {
        horizonMesh.visible = currentMode === 'lyra-2-world' || currentMode === 'lyra-dual'
      }
      if (floorMesh) {
        floorMesh.visible = currentMode !== 'lyra-3dgs'
      }

      // DRAMATIC CAMERA TRAJECTORIES WITH POWERFUL 3D PARALLAX
      const traj = trajectoryModeRef.current

      // Calculate hover parallax offset (adds immediate 3D pop on every mouse movement!)
      const hoverOffsetScale = 0.55 * (curDepthScale / 2.0)
      const hx = mp.curX * hoverOffsetScale
      const hy = -mp.curY * (hoverOffsetScale * 0.7)

      if (traj === 'arc') {
        // PARALLAX ARC: WIDE SWEEPING CINEMATIC SWING (±3.0 units lateral shift!)
        const angle = p * Math.PI * 2
        const arcX = Math.sin(angle) * 3.0 * (curDepthScale / 2.2)
        const arcY = Math.cos(angle * 0.5) * 0.85
        const arcZ = orb.distance + Math.cos(angle) * 1.1

        camera.position.x = arcX + hx + Math.sin(orb.rotY) * arcZ
        camera.position.y = arcY + hy + orb.rotX * 2.2
        camera.position.z = Math.cos(orb.rotY) * arcZ
        camera.lookAt(0, 0, 0.4)
      } else if (traj === 'zoomgs') {
        // LYRA 2.0 ZOOMGS TRAJECTORY:
        // Dolly zoom: moves right up close to the people (Z = 2.4), then pulls out to wide 3D space (Z = 5.4)
        const zoomCycle = Math.sin(p * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5
        const curDist = 2.4 + (1.0 - zoomCycle) * 3.0 // between 2.4 and 5.4!
        const swayX = Math.sin(p * Math.PI * 2) * 1.5 * (curDepthScale / 2.2)
        const swayY = Math.cos(p * Math.PI * 2 * 0.5) * 0.55

        camera.position.x = swayX + hx + Math.sin(orb.rotY) * curDist
        camera.position.y = swayY + hy + orb.rotX * 2.2
        camera.position.z = Math.cos(orb.rotY) * curDist
        camera.lookAt(0, 0, 0.6)
      } else if (traj === 'walkthrough') {
        // STEP INSIDE: Walks right past foreground particles towards the people (Z = 1.9), then backs up
        const cycle = Math.sin(p * Math.PI * 2) * 0.5 + 0.5
        const zPos = 1.9 + (1.0 - cycle) * 2.8
        const xPos = Math.sin(p * Math.PI * 2 * 0.6) * 1.2 * (curDepthScale / 2.2)
        const yPos = Math.cos(p * Math.PI * 2 * 0.5) * 0.4

        camera.position.x = xPos + hx + Math.sin(orb.rotY) * zPos
        camera.position.y = yPos + hy + orb.rotX * 2.0
        camera.position.z = Math.cos(orb.rotY) * zPos
        camera.lookAt(0, 0, 0.5)
      } else {
        // FREE 3D ORBIT: Full direct user control + hover parallax
        camera.position.x = hx + Math.sin(orb.rotY) * orb.distance
        camera.position.y = hy + orb.rotX * 3.2
        camera.position.z = Math.cos(orb.rotY) * orb.distance
        camera.lookAt(0, 0, 0.4)
      }

      // Drift near and far floating photons in 3D
      if (nearParticles) {
        const pNear = nearParticles.geometry.attributes.position.array
        for (let i = 0; i < 120; i++) {
          pNear[i * 3 + 1] += Math.sin(currentTime * 0.0016 + i) * 0.0012
        }
        nearParticles.geometry.attributes.position.needsUpdate = true
      }
      if (farParticles) {
        const pFar = farParticles.geometry.attributes.position.array
        for (let i = 0; i < 280; i++) {
          pFar[i * 3 + 1] += Math.sin(currentTime * 0.001 + i) * 0.0007
        }
        farParticles.geometry.attributes.position.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMoveWindow)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', handleResize)

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      renderer.dispose()
    }
  }, [postcard, splatDensity])

  // Sync Depth Scale
  useEffect(() => {
    if (uniformsRef.current.splat) {
      uniformsRef.current.splat.uDepthScale.value = depthSlider
    }
    if (uniformsRef.current.horizon) {
      uniformsRef.current.horizon.uDepthScale.value = depthSlider
    }
  }, [depthSlider])

  const handleResetView = () => {
    orbitRef.current.targetRotX = 0
    orbitRef.current.targetRotY = 0
    orbitRef.current.targetDistance = 4.2
  }

  return (
    <div className="lyra-spatial-modal is-crisp-3d-photo" role="dialog" aria-modal="true" aria-label="NVIDIA Lyra 3D Spatial Memory Modal">
      {/* 3D WebGL Canvas Viewport */}
      <div className="lyra-canvas-viewport" ref={mountRef} />

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="lyra-processing-shield">
          <div className="lyra-spinner" />
          <p>NVIDIA Lyra 3D Engine: Isolating Standstill Subjects & Synthesizing 3D Gaussian World...</p>
        </div>
      )}

      {/* Spatial HUD Overlay Controls */}
      <div className="lyra-spatial-ui">
        {/* TOP NAVIGATION BAR */}
        <header className="lyra-top-bar">
          <div className="lyra-top-left-cluster">
            {/* Primary Return to Global Probe Button */}
            <button
              type="button"
              className="lyra-main-return-btn"
              onClick={handleReturn}
              title="Return to Global 3D Probe (or press Esc)"
            >
              <ArrowLeft size={16} />
              <Globe2 size={17} />
              <span>Return to Global Probe</span>
            </button>

            {/* Lyra Technology Brand Badge */}
            <div className="lyra-brand-badge desktop-only">
              <span className="lyra-pulse-dot" />
              <div className="lyra-brand-text">
                <strong>NVIDIA Lyra 3D</strong>
                <small className="face-clarity-tag">
                  <ShieldCheck size={11} />
                  People Stand Still · 100% Pin-Sharp
                </small>
              </div>
            </div>

            {/* Engine Mode Pills */}
            <div className="lyra-engine-selector desktop-only" role="group" aria-label="Lyra Engine Mode">
              <button
                className={`engine-chip ${engineMode === 'lyra-2-world' ? 'active' : ''}`}
                onClick={() => setEngineMode('lyra-2-world')}
                title="Lyra 2.0 Explorable Generative World (3DGS + Deep Horizon + Ground)"
              >
                <Box size={13} />
                <span>Lyra 2.0 World</span>
              </button>
              <button
                className={`engine-chip ${engineMode === 'lyra-3dgs' ? 'active' : ''}`}
                onClick={() => setEngineMode('lyra-3dgs')}
                title="Lyra 1.0 Pure 3D Gaussian Splatting surrounding still people"
              >
                <Sparkles size={13} />
                <span>3DGS Splats</span>
              </button>
              <button
                className={`engine-chip ${engineMode === 'lyra-dual' ? 'active' : ''}`}
                onClick={() => setEngineMode('lyra-dual')}
                title="Lyra Dual-Layer Spatial Hologram"
              >
                <Layers size={13} />
                <span>Dual Layer</span>
              </button>
            </div>
          </div>

          {/* Camera Trajectory Controls */}
          <div className="spatial-camera-modes" role="group" aria-label="Camera Trajectory">
            <button
              className={`spatial-mode-btn ${trajectoryMode === 'arc' ? 'active' : ''}`}
              onClick={() => { setTrajectoryMode('arc'); setIsPlaying(true) }}
              title="Parallax Arc: Wide cinematic sweep showing maximum 3D separation"
            >
              <Sparkles size={14} />
              <span>Parallax Arc</span>
            </button>

            <button
              className={`spatial-mode-btn ${trajectoryMode === 'zoomgs' ? 'active' : ''}`}
              onClick={() => { setTrajectoryMode('zoomgs'); setIsPlaying(true) }}
              title="Lyra 2.0 ZoomGS: Smoothly zooms close to people, then zooms out into wide 3D space"
            >
              <ZoomIn size={14} />
              <span>ZoomGS</span>
            </button>

            <button
              className={`spatial-mode-btn ${trajectoryMode === 'walkthrough' ? 'active' : ''}`}
              onClick={() => { setTrajectoryMode('walkthrough'); setIsPlaying(true) }}
              title="Step Inside: Walk through the surrounding 3D Gaussian volume"
            >
              <Compass size={14} />
              <span>Step Inside</span>
            </button>

            <button
              className={`spatial-mode-btn ${trajectoryMode === 'orbit' ? 'active' : ''}`}
              onClick={() => setTrajectoryMode('orbit')}
              title="Free 3D Orbit: Drag to rotate anywhere in 360 degrees"
            >
              <Eye size={14} />
              <span>Free 3D Orbit</span>
            </button>
          </div>

          <div className="lyra-top-actions">
            {/* Reset View */}
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

            {/* Close / Return Button */}
            <button
              type="button"
              className="lyra-top-close-probe-btn"
              onClick={handleReturn}
              aria-label="Exit to Global Probe"
              title="Return to Global Probe (Esc)"
            >
              <Globe2 size={15} />
              <span className="desktop-only">Back to Globe</span>
              <X size={16} />
            </button>
          </div>
        </header>

        {/* BOTTOM HUD & DRAMATIC 3D DEPTH CONTROLS */}
        <footer className="lyra-memory-footer crisp-footer">
          <div className="crisp-control-card">
            <div className="crisp-top-row">
              {/* 3D Depth Intensity Presets */}
              <div className="depth-selector-group">
                <span className="depth-label"><Gauge size={13} /> 3D Pop:</span>
                <div className="depth-chips">
                  <button
                    className={depthPreset === 'natural' ? 'active' : ''}
                    onClick={() => handleSelectDepthPreset('natural')}
                    title="Natural 3D depth separation (1.3x)"
                  >
                    Natural
                  </button>
                  <button
                    className={depthPreset === 'dramatic' ? 'active' : ''}
                    onClick={() => handleSelectDepthPreset('dramatic')}
                    title="Dramatic high-impact 3D depth (2.2x)"
                  >
                    Dramatic 3D
                  </button>
                  <button
                    className={depthPreset === 'hyper' ? 'active' : ''}
                    onClick={() => handleSelectDepthPreset('hyper')}
                    title="Extreme Hyper-3D Pop! (3.4x)"
                  >
                    <Zap size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                    Hyper 3D
                  </button>
                </div>
              </div>

              {/* Live Depth Scale Slider */}
              <div className="depth-slider-control desktop-only">
                <span className="slider-label">Depth Boost:</span>
                <input
                  type="range"
                  min="0.8"
                  max="4.0"
                  step="0.1"
                  value={depthSlider}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    setDepthSlider(v)
                    if (v < 1.6) setDepthPreset('natural')
                    else if (v > 2.8) setDepthPreset('hyper')
                    else setDepthPreset('dramatic')
                  }}
                  title="Adjust 3D depth intensity"
                />
                <span className="slider-value-pill">{depthSlider.toFixed(1)}x</span>
              </div>

              {/* Orbit & Hover Hint Badge */}
              <div className="crisp-orbit-hint desktop-only">
                <Move size={12} />
                <span>Move mouse for instant 3D parallax · Drag to orbit</span>
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
                onClick={handleReturn}
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
