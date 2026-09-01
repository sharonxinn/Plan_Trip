import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { Compass, RotateCw, ZoomIn, ZoomOut, MapPin, Sparkles, Globe, Map, Navigation } from 'lucide-react'

// Convert lat/lng to 3D sphere coordinate
function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

// Generate procedural earth texture canvas
function createEarthCanvasTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Smooth light ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024)
  oceanGrad.addColorStop(0, '#D8E8F5')
  oceanGrad.addColorStop(0.5, '#C6DDF0')
  oceanGrad.addColorStop(1, '#D8E8F5')
  ctx.fillStyle = oceanGrad
  ctx.fillRect(0, 0, 2048, 1024)

  // Grid lines / latitude lines
  ctx.strokeStyle = 'rgba(70, 120, 170, 0.12)'
  ctx.lineWidth = 1
  for (let y = 0; y <= 1024; y += 64) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(2048, y)
    ctx.stroke()
  }
  for (let x = 0; x <= 2048; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 1024)
    ctx.stroke()
  }

  // Draw continent landmass approximations (Warm soft sand)
  ctx.fillStyle = '#E8DFC8'
  ctx.shadowColor = '#D5C6AC'
  ctx.shadowBlur = 8

  const continents = [
    // Eurasia
    [[1100, 200], [1600, 220], [1750, 380], [1600, 520], [1300, 480], [1150, 420], [1050, 320]],
    // East Asia & Japan
    [[1550, 350], [1680, 360], [1660, 450], [1520, 420]],
    // Southeast Asia & Malaysia
    [[1450, 500], [1520, 520], [1500, 620], [1420, 580]],
    // Africa
    [[950, 420], [1120, 420], [1180, 560], [1100, 750], [980, 620], [900, 480]],
    // North America
    [[350, 180], [680, 220], [750, 380], [620, 500], [450, 480], [300, 320]],
    // South America
    [[600, 520], [720, 580], [680, 780], [580, 900], [520, 680]],
    // Australia
    [[1600, 680], [1750, 690], [1720, 820], [1580, 800]]
  ]

  continents.forEach(poly => {
    ctx.beginPath()
    ctx.moveTo(poly[0][0], poly[0][1])
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i][0], poly[i][1])
    }
    ctx.closePath()
    ctx.fill()
  })

  // City glow clusters worldwide (Warm terracotta pins)
  ctx.fillStyle = '#E06D53'
  ctx.shadowColor = '#E89858'
  ctx.shadowBlur = 10
  const cityDots = [
    [1620, 365], [1480, 530], [1495, 545], [1040, 310], [980, 280],
    [580, 360], [480, 380], [1530, 610], [1700, 750], [1220, 420],
    [1080, 400], [1110, 580], [1680, 740], [650, 680]
  ]
  cityDots.forEach(([cx, cy]) => {
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fill()
  })

  return new THREE.CanvasTexture(canvas)
}

export default function Globe3D({
  destinations = [],
  selectedCity = null,
  onSelectCity,
  onOpenGoogleMap
}) {
  const mountRef = useRef(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [activeRegion, setActiveRegion] = useState('All')
  const isDraggingRef = useRef(false)
  const dragDistanceRef = useRef(0)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const globeGroupRef = useRef(null)
  const targetRotationRef = useRef({ x: 0.2, y: 0 })
  const cameraRef = useRef(null)
  const markerMeshesRef = useRef([])

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Oceania']

  const filteredPills = useMemo(() => {
    if (activeRegion === 'All') return destinations.slice(0, 12)
    return destinations.filter(d => d.region === activeRegion || activeRegion === 'Middle East' && d.region?.includes('Middle'))
  }, [destinations, activeRegion])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 5.2
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Raycaster for click interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // Starfield background
    const starGeometry = new THREE.BufferGeometry()
    const starCount = 1200
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80
      starPositions[i + 1] = (Math.random() - 0.5) * 80
      starPositions[i + 2] = (Math.random() - 0.5) * 80 - 15
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({
      color: 0xD9C5B2,
      size: 0.06,
      transparent: true,
      opacity: 0.5
    })
    const starField = new THREE.Points(starGeometry, starMaterial)
    scene.add(starField)

    // Main Earth Globe Group
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)
    globeGroupRef.current = globeGroup

    // Earth Sphere
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const earthTexture = createEarthCanvasTexture()
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.02,
      specular: new THREE.Color(0xFFF6EE),
      shininess: 15
    })
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
    earthMesh.name = 'earth-sphere'
    globeGroup.add(earthMesh)

    // Atmosphere Glow Layer (Warm soft peach-sky glow)
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.88, 0.55, 0.45, 0.6) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    })
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    globeGroup.add(atmosphereMesh)

    // Outer Cloud Halo
    const cloudGeometry = new THREE.SphereGeometry(2.03, 48, 48)
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    })
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
    globeGroup.add(cloudMesh)

    // Lighting (Warm Daylight)
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.6)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0)
    sunLight.position.set(5, 3, 5)
    scene.add(sunLight)

    const blueBackLight = new THREE.DirectionalLight(0x0284c7, 1.5)
    blueBackLight.position.set(-5, -2, -4)
    scene.add(blueBackLight)

    // Add City Pin Markers for all destinations
    const markerGroup = new THREE.Group()
    globeGroup.add(markerGroup)
    markerMeshesRef.current = []

    destinations.forEach(dest => {
      const pos = latLngToVector3(dest.lat, dest.lng, 2.04)

      // Glowing marker dot
      const dotGeometry = new THREE.SphereGeometry(0.045, 16, 16)
      const isSelected = selectedCity?.id === dest.id || selectedCity?.city?.toLowerCase() === dest.city.toLowerCase()
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xf59e0b : 0x38bdf8
      })
      const dotMesh = new THREE.Mesh(dotGeometry, dotMaterial)
      dotMesh.position.copy(pos)
      dotMesh.userData = { destination: dest }
      markerGroup.add(dotMesh)
      markerMeshesRef.current.push(dotMesh)

      // Pulsing Ring
      const ringGeometry = new THREE.RingGeometry(0.05, 0.085, 24)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xf59e0b : 0x00f2fe,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      })
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial)
      ringMesh.position.copy(pos)
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0))
      markerGroup.add(ringMesh)
    })

    // Animation Loop
    let animationFrameId
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Auto rotation
      if (autoRotate && !isDraggingRef.current) {
        globeGroup.rotation.y += 0.002
      } else {
        // Smooth dampening towards target rotation
        globeGroup.rotation.y += (targetRotationRef.current.y - globeGroup.rotation.y) * 0.08
        globeGroup.rotation.x += (targetRotationRef.current.x - globeGroup.rotation.x) * 0.08
      }

      cloudMesh.rotation.y += 0.001
      renderer.render(scene, camera)
    }
    animate()

    // Mouse & Touch Controls
    const handleMouseDown = e => {
      isDraggingRef.current = true
      dragDistanceRef.current = 0
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = e => {
      if (!isDraggingRef.current) return
      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y
      dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY)

      globeGroup.rotation.y += deltaX * 0.005
      globeGroup.rotation.x += deltaY * 0.005
      targetRotationRef.current = { x: globeGroup.rotation.x, y: globeGroup.rotation.y }

      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = e => {
      isDraggingRef.current = false

      // If user simply clicked (drag distance small), perform Raycasting to detect destination or trigger map
      if (dragDistanceRef.current < 6) {
        const rect = dom.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects([earthMesh, ...markerMeshesRef.current], true)

        if (intersects.length > 0) {
          const hit = intersects[0]
          if (hit.object.userData?.destination) {
            onSelectCity(hit.object.userData.destination)
            if (onOpenGoogleMap) onOpenGoogleMap(hit.object.userData.destination)
          } else {
            // Clicked on the Earth sphere: open the real Google Map for current destination
            if (onOpenGoogleMap && selectedCity) {
              onOpenGoogleMap(selectedCity)
            }
          }
        }
      }
    }

    const handleWheel = e => {
      e.preventDefault()
      camera.position.z = Math.max(3.2, Math.min(8.0, camera.position.z + e.deltaY * 0.003))
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    dom.addEventListener('wheel', handleWheel, { passive: false })

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      dom.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      dom.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)
      if (container.contains(dom)) {
        container.removeChild(dom)
      }
      renderer.dispose()
    }
  }, [destinations, selectedCity, onSelectCity, onOpenGoogleMap])

  // Fly to selected city anywhere on Earth
  useEffect(() => {
    if (!selectedCity || !globeGroupRef.current) return
    const phi = (90 - selectedCity.lat) * (Math.PI / 180)
    const theta = (selectedCity.lng + 180) * (Math.PI / 180)

    targetRotationRef.current = {
      x: (selectedCity.lat / 90) * 0.5,
      y: -theta + Math.PI / 2
    }
    setAutoRotate(false)
  }, [selectedCity])

  const zoom = delta => {
    if (!cameraRef.current) return
    cameraRef.current.position.z = Math.max(3.2, Math.min(8.0, cameraRef.current.position.z + delta))
  }

  return (
    <div className="globe-wrapper">
      <div className="globe-canvas-container" ref={mountRef} />

      {/* Floating Controls */}
      <div className="globe-controls">
        <button
          className="control-btn map-mode-btn"
          onClick={() => onOpenGoogleMap && onOpenGoogleMap(selectedCity)}
          title="Click to Open Real Google Maps & Nearby Sights"
        >
          <Map size={16} />
          <span>Real Google Map</span>
        </button>
        <button
          className={`control-btn ${autoRotate ? 'active' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Earth Auto-Rotation"
        >
          <RotateCw size={16} />
          <span>{autoRotate ? 'Spinning' : 'Paused'}</span>
        </button>
        <button className="control-btn" onClick={() => zoom(-0.6)} title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button className="control-btn" onClick={() => zoom(0.6)} title="Zoom Out">
          <ZoomOut size={16} />
        </button>
      </div>

      {/* Click Hint Overlay */}
      <div className="globe-click-hint">
        <MapPin size={13} />
        <span>Click anywhere on the 3D globe to view Real Google Map & Nearby Spots</span>
      </div>

      {/* Region Tabs & Quick Destinations */}
      <div className="globe-destination-pills">
        <div className="region-filter-bar">
          <span className="pills-label">
            <Globe size={13} /> Region:
          </span>
          {regions.map(reg => (
            <button
              key={reg}
              className={`region-tab-btn ${activeRegion === reg ? 'active' : ''}`}
              onClick={() => setActiveRegion(reg)}
            >
              {reg}
            </button>
          ))}
        </div>

        <div className="pills-carousel">
          {filteredPills.map(dest => (
            <button
              key={dest.id}
              className={`dest-pill ${selectedCity?.id === dest.id ? 'active' : ''}`}
              onClick={() => {
                onSelectCity(dest)
              }}
            >
              <MapPin size={12} />
              <span>{dest.city}</span>
              <small className="pill-country">({dest.countryCode || dest.country})</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
