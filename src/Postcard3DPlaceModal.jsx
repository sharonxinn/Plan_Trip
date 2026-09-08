import React, { useState, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  ArrowLeft, ExternalLink, Globe2, MapPin, Compass, Layers,
  Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Sparkles,
  X, Eye, Calendar, Users, Share2, Send, Check, Navigation,
  ChevronLeft, ChevronRight, RefreshCw, Car, Footprints,
  MoreVertical, ShoppingBag
} from 'lucide-react'
import './postcard-3d-place.css'

// High-precision landmark data matching Google Street View navigation points
const STREET_VIEW_LANDMARKS = {
  'suria klcc': {
    title: 'Suria KLCC',
    step: 'Step 19 of 19',
    address: 'Lot No. 241, Level 2Menara, Petronas Twin Tower, Kuala Lumpur City Centre, 50088 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'Suria KLCC, Petronas Twin Towers, Kuala Lumpur',
    lat: 3.1578,
    lng: 101.7119,
    heading: 200,
    pitch: 12,
    date: 'Jun 2024',
    panoImage: '/images/streetview_suria_klcc.png'
  },
  'petronas twin towers & klcc park': {
    title: 'Suria KLCC',
    step: 'Step 19 of 19',
    address: 'Lot No. 241, Level 2Menara, Petronas Twin Tower, Kuala Lumpur City Centre, 50088 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'Suria KLCC, Petronas Twin Towers, Kuala Lumpur',
    lat: 3.1578,
    lng: 101.7119,
    heading: 200,
    pitch: 12,
    date: 'Jun 2024',
    panoImage: '/images/streetview_suria_klcc.png'
  },
  'petronas twin towers': {
    title: 'Suria KLCC',
    step: 'Step 19 of 19',
    address: 'Lot No. 241, Level 2Menara, Petronas Twin Tower, Kuala Lumpur City Centre, 50088 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'Suria KLCC, Petronas Twin Towers, Kuala Lumpur',
    lat: 3.1578,
    lng: 101.7119,
    heading: 200,
    pitch: 12,
    date: 'Jun 2024',
    panoImage: '/images/streetview_suria_klcc.png'
  },
  'klcc park': {
    title: 'Suria KLCC',
    step: 'Step 19 of 19',
    address: 'Lot No. 241, Level 2Menara, Petronas Twin Tower, Kuala Lumpur City Centre, 50088 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'Suria KLCC, Petronas Twin Towers, Kuala Lumpur',
    lat: 3.1578,
    lng: 101.7119,
    heading: 200,
    pitch: 12,
    date: 'Jun 2024',
    panoImage: '/images/streetview_suria_klcc.png'
  },
  'klcc': {
    title: 'Suria KLCC',
    step: 'Step 19 of 19',
    address: 'Lot No. 241, Level 2Menara, Petronas Twin Tower, Kuala Lumpur City Centre, 50088 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'Suria KLCC, Petronas Twin Towers, Kuala Lumpur',
    lat: 3.1578,
    lng: 101.7119,
    heading: 200,
    pitch: 12,
    date: 'Jun 2024',
    panoImage: '/images/streetview_suria_klcc.png'
  },
  'batu caves': {
    title: 'Batu Caves Temple Grounds',
    step: 'Step 14 of 14',
    address: 'Gombak, 68100 Batu Caves, Selangor, Malaysia',
    query: 'Batu Caves, Gombak, Selangor',
    lat: 3.2379,
    lng: 101.6840,
    heading: 30,
    pitch: 18,
    date: 'Aug 2024',
    panoImage: '/images/batucaves_friends_climb.jpg'
  },
  'jalan alor & city centre': {
    title: 'Jalan Alor Food Street',
    step: 'Step 8 of 8',
    address: 'Jalan Alor, Bukit Bintang, 50200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'Jalan Alor Food Street, Kuala Lumpur',
    lat: 3.1458,
    lng: 101.7088,
    heading: 110,
    pitch: 4,
    date: 'Sep 2024',
    panoImage: '/images/trip_friends_supper.jpg'
  },
  'heritage avenue & arts quarter': {
    title: 'Central Market & Heritage Arts Walk',
    step: 'Step 11 of 11',
    address: 'Jalan Hang Kasturi, City Centre, 50050 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'Central Market, Kuala Lumpur',
    lat: 3.1436,
    lng: 101.6961,
    heading: 260,
    pitch: 5,
    date: 'May 2024',
    panoImage: '/images/neighbourhood_street_walk.jpg'
  },
  'the exchange trx sky park': {
    title: 'The Exchange TRX Sky Park',
    step: 'Step 16 of 16',
    address: 'The Exchange TRX, Persiaran TRX, Imbi, 55188 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    query: 'The Exchange TRX Sky Park, Kuala Lumpur',
    lat: 3.1428,
    lng: 101.7188,
    heading: 320,
    pitch: 15,
    date: 'Jul 2024',
    panoImage: '/images/trx_rooftop_friends.jpg'
  },
  'armenian street': {
    title: 'Armenian Street Heritage Core',
    step: 'Step 9 of 9',
    address: 'Lebuh Armenian, George Town, 10200 George Town, Pulau Pinang, Malaysia',
    query: 'Armenian Street, George Town, Penang',
    lat: 5.4152,
    lng: 100.3374,
    heading: 85,
    pitch: 6,
    date: 'Aug 2024',
    panoImage: '/images/penang_mural_friends.jpg'
  },
  'heritage arts & street district': {
    title: 'Armenian Street Arts District',
    step: 'Step 9 of 9',
    address: 'Lebuh Armenian, George Town, 10200 George Town, Pulau Pinang, Malaysia',
    query: 'Armenian Street, George Town, Penang',
    lat: 5.4152,
    lng: 100.3374,
    heading: 85,
    pitch: 6,
    date: 'Aug 2024',
    panoImage: '/images/neighbourhood_street_walk.jpg'
  },
  'chew jetty': {
    title: 'Chew Jetty Clan House Walkway',
    step: 'Step 12 of 12',
    address: 'Chew Jetty, Weld Quay, 10300 George Town, Pulau Pinang, Malaysia',
    query: 'Chew Jetty, George Town, Penang',
    lat: 5.4128,
    lng: 100.3400,
    heading: 140,
    pitch: 2,
    date: 'Jul 2024',
    panoImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=84'
  },
  'penang hill': {
    title: 'Penang Hill Funicular Summit',
    step: 'Step 6 of 6',
    address: 'Jalan Stesen Bukit Bendera, 11500 Air Itam, Pulau Pinang, Malaysia',
    query: 'Penang Hill Summit, Penang',
    lat: 5.4243,
    lng: 100.2693,
    heading: 190,
    pitch: 10,
    date: 'Jun 2024',
    panoImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&q=84'
  },
  'pulau tikus market': {
    title: 'Pulau Tikus Morning Market',
    step: 'Step 4 of 4',
    address: 'Jalan Pasar, Pulau Tikus, 10350 George Town, Pulau Pinang, Malaysia',
    query: 'Pulau Tikus Market, George Town, Penang',
    lat: 5.4307,
    lng: 100.3120,
    heading: 45,
    pitch: 0,
    date: 'Aug 2024',
    panoImage: '/images/trip_friends_supper.jpg'
  },
  'senso-ji asakusa': {
    title: 'Sensō-ji Kaminarimon Gate',
    step: 'Step 22 of 22',
    address: '2-chōme-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan',
    query: 'Senso-ji Temple, Asakusa, Tokyo',
    lat: 35.7148,
    lng: 139.7967,
    heading: 355,
    pitch: 14,
    date: 'May 2024',
    panoImage: '/images/tokyo_sensoji_friends.jpg'
  },
  'shibuya crossing': {
    title: 'Shibuya Scramble Crossing',
    step: 'Step 15 of 15',
    address: '2 Chome-2-1 Dogenzaka, Shibuya City, Tokyo 150-0043, Japan',
    query: 'Shibuya Crossing, Tokyo',
    lat: 35.6595,
    lng: 139.7005,
    heading: 220,
    pitch: 8,
    date: 'May 2024',
    panoImage: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1400&q=84'
  },
  'fushimi inari shrine': {
    title: 'Fushimi Inari Torii Gate Trail',
    step: 'Step 18 of 18',
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto, 612-0882, Japan',
    query: 'Fushimi Inari Taisha, Kyoto',
    lat: 34.9671,
    lng: 135.7727,
    heading: 10,
    pitch: 12,
    date: 'May 2024',
    panoImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=84'
  },
  'wat arun': {
    title: 'Wat Arun Temple of Dawn',
    step: 'Step 10 of 10',
    address: '158 Thanon Wang Doem, Wat Arun, Bangkok Yai, Bangkok 10600, Thailand',
    query: 'Wat Arun, Bangkok',
    lat: 13.7437,
    lng: 100.4889,
    heading: 290,
    pitch: 4,
    date: 'Feb 2024',
    panoImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=84'
  },
  'pak khlong talat': {
    title: 'Pak Khlong Talat Flower Market',
    step: 'Step 8 of 8',
    address: 'Chak Phet Road, Wang Burapha Phirom, Phra Nakhon, Bangkok 10200, Thailand',
    query: 'Pak Khlong Talat Flower Market, Bangkok',
    lat: 13.7419,
    lng: 100.4975,
    heading: 145,
    pitch: 1,
    date: 'Feb 2024',
    panoImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=84'
  },
  'chao phraya express': {
    title: 'Chao Phraya Express River Pier',
    step: 'Step 5 of 5',
    address: 'Sathorn Pier, Yan Nawa, Sathon, Bangkok 10120, Thailand',
    query: 'Sathorn Pier, Chao Phraya Express, Bangkok',
    lat: 13.7226,
    lng: 100.5144,
    heading: 260,
    pitch: 3,
    date: 'Feb 2024',
    panoImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1400&q=84'
  }
}

export default function Postcard3DPlaceModal({ postcard, onClose }) {
  const panoMountRef = useRef(null)

  // View Mode: 'streetview' (360° Street View) | 'satellite' (3D Aerial) | 'map' (Standard Map)
  const [viewMode, setViewMode] = useState('streetview')
  const [isFlipped, setIsFlipped] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [currentHeading, setCurrentHeading] = useState(0)

  // Camera reset trigger callback
  const resetCameraRef = useRef(null)

  // Resolve matching landmark metadata
  const placeKey = (postcard?.place || postcard?.title || '').toLowerCase().trim()
  const landmark = STREET_VIEW_LANDMARKS[placeKey] || {
    title: postcard?.place || postcard?.title || 'Suria KLCC',
    step: 'Step 19 of 19',
    address: `${postcard?.place || postcard?.title || 'Suria KLCC'}, ${postcard?.city || 'Kuala Lumpur'}, ${postcard?.country || 'Malaysia'}`,
    query: `${postcard?.place || postcard?.title || 'Suria KLCC'}, ${postcard?.city || 'Kuala Lumpur'}`,
    lat: postcard?.lat || 3.1578,
    lng: postcard?.lng || 101.7119,
    heading: 200,
    pitch: 10,
    date: postcard?.dates || 'Jun 2024',
    panoImage: postcard?.image || '/images/streetview_suria_klcc.png'
  }

  // Google Maps Deep Links
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(landmark.query)}`
  const nativeStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${landmark.lat},${landmark.lng}&heading=${landmark.heading}&pitch=${landmark.pitch}&fov=80`
  const googleEarth3DUrl = `https://earth.google.com/web/search/${encodeURIComponent(landmark.query)}`

  // Optional Official Google Embed API if key is present
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const officialStreetViewEmbed = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(mapsApiKey)}&location=${landmark.lat},${landmark.lng}&heading=${landmark.heading}&pitch=${landmark.pitch}&fov=80`
    : null

  // Fallback Satellite & Map Embed
  const googleSatelliteEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(landmark.query)}&t=k&z=18&hl=en&output=embed`
  const googleRoadmapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(landmark.query)}&t=m&z=16&hl=en&output=embed`

  // ==========================================================================
  // THREE.JS 360° INTERACTIVE STREET VIEW SPHERE PANORAMA
  // ==========================================================================
  useEffect(() => {
    if (viewMode !== 'streetview' || officialStreetViewEmbed) return

    const container = panoMountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75 / zoomLevel, width / height, 0.1, 1000)
    camera.position.set(0, 0, 0.1)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // Load High-Res 360 Panorama Texture
    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    const panoTexture = textureLoader.load(landmark.panoImage || postcard?.image, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = false
    })

    // Large Inverted Sphere for 360 Environment
    const sphereGeo = new THREE.SphereGeometry(50, 60, 40)
    sphereGeo.scale(-1, 1, 1) // Invert normals so texture is on the inside
    const sphereMat = new THREE.MeshBasicMaterial({ map: panoTexture })
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    scene.add(sphereMesh)

    // Heading calculation
    const initLon = landmark.heading || 200
    const initLat = -(landmark.pitch || 10)
    const headingRad = THREE.MathUtils.degToRad(initLon)

    // Ground Street Waypoint Cross ('X' Navigation Marker matching Google Street View)
    const crossGroup = new THREE.Group()
    const crossMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    })
    const bar1 = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.5), crossMat)
    const bar2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3.6), crossMat)
    const ringGeo = new THREE.RingGeometry(2.3, 2.55, 36)
    const ringMesh = new THREE.Mesh(ringGeo, crossMat)
    crossGroup.add(bar1)
    crossGroup.add(bar2)
    crossGroup.add(ringMesh)
    crossGroup.rotation.x = -Math.PI / 2
    crossGroup.rotation.z = Math.PI / 4
    // Position forward on the asphalt street in front of camera
    crossGroup.position.set(11 * Math.cos(headingRad), -5.8, 11 * Math.sin(headingRad))
    scene.add(crossGroup)

    // Building POI Pin Badge (Blue circular store/place marker at Suria KLCC entrance)
    const poiCanvas = document.createElement('canvas')
    poiCanvas.width = 256
    poiCanvas.height = 256
    const ctx = poiCanvas.getContext('2d')
    if (ctx) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 4

      // Blue circle
      ctx.fillStyle = '#1a73e8'
      ctx.beginPath()
      ctx.arc(128, 128, 76, 0, Math.PI * 2)
      ctx.fill()

      // White ring
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.arc(128, 128, 76, 0, Math.PI * 2)
      ctx.stroke()

      // Shopping Bag icon in center
      ctx.shadowColor = 'transparent'
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(96, 115, 64, 52, 6)
      } else {
        ctx.rect(96, 115, 64, 52)
      }
      ctx.fill()

      // Handle
      ctx.beginPath()
      ctx.arc(128, 115, 18, Math.PI, 0)
      ctx.stroke()
    }

    const poiTexture = new THREE.CanvasTexture(poiCanvas)
    const poiMat = new THREE.SpriteMaterial({ map: poiTexture, transparent: true })
    const poiSprite = new THREE.Sprite(poiMat)
    poiSprite.position.set(28 * Math.cos(headingRad - 0.18), 1.2, 28 * Math.sin(headingRad - 0.18))
    poiSprite.scale.set(3.2, 3.2, 1)
    scene.add(poiSprite)

    // Interactive Drag & Look Controls
    let isUserInteracting = false
    let onPointerDownPointerX = 0
    let onPointerDownPointerY = 0
    let onPointerDownLon = initLon
    let onPointerDownLat = initLat
    let lon = onPointerDownLon
    let lat = onPointerDownLat

    // Reset camera function exposed to external buttons (Restart / Compass click)
    resetCameraRef.current = () => {
      lon = initLon
      lat = initLat
    }

    const onPointerDown = (e) => {
      isUserInteracting = true
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      onPointerDownPointerX = clientX
      onPointerDownPointerY = clientY
      onPointerDownLon = lon
      onPointerDownLat = lat
    }

    const onPointerMove = (e) => {
      if (!isUserInteracting) return
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      lon = (onPointerDownPointerX - clientX) * 0.15 + onPointerDownLon
      lat = (clientY - onPointerDownPointerY) * 0.15 + onPointerDownLat
    }

    const onPointerUp = () => { isUserInteracting = false }

    const onWheel = (e) => {
      e.preventDefault()
      camera.fov = Math.max(30, Math.min(95, camera.fov + e.deltaY * 0.05))
      camera.updateProjectionMatrix()
    }

    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    container.addEventListener('wheel', onWheel, { passive: false })

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
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Clamp vertical tilt
      lat = Math.max(-85, Math.min(85, lat))
      const phi = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lon)

      const targetX = 500 * Math.sin(phi) * Math.cos(theta)
      const targetY = 500 * Math.cos(phi)
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta)

      camera.lookAt(targetX, targetY, targetZ)

      // Update compass heading
      const normHeading = Math.round((360 - (lon % 360)) % 360)
      setCurrentHeading(normHeading)

      // Pulsating opacity for navigation cross
      const t = performance.now() * 0.003
      crossMat.opacity = 0.75 + Math.sin(t) * 0.2

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', handleResize)

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      sphereGeo.dispose()
      sphereMat.dispose()
      panoTexture.dispose()
      crossMat.dispose()
      bar1.geometry.dispose()
      bar2.geometry.dispose()
      ringGeo.dispose()
      poiCanvas.remove?.()
      poiTexture.dispose()
      poiMat.dispose()
      renderer.dispose()
    }
  }, [viewMode, landmark.panoImage, landmark.heading, landmark.pitch, officialStreetViewEmbed])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (photoPreviewOpen) setPhotoPreviewOpen(false)
        else onClose?.()
      }
      if (e.key === 'f' || e.key === 'F') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          setIsFlipped(prev => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, photoPreviewOpen])

  const copyShareLink = () => {
    navigator.clipboard?.writeText(nativeStreetViewUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="postcard-3d-modal is-streetview-mode" role="dialog" aria-modal="true" aria-label={`Google Street View of ${landmark.title}`}>
      {/* 1. MAIN FULL-SCREEN VIEWPORT */}
      <div className="streetview-main-viewport">
        {/* VIEW 1: Interactive 360° Photosphere Street View */}
        {viewMode === 'streetview' && !officialStreetViewEmbed && (
          <>
            <div className="streetview-360-canvas" ref={panoMountRef} />
            <div className="streetview-vignette" />
            <div className="streetview-drag-hint">
              <Compass size={14} />
              <span>Click & drag to explore 360° Street View</span>
            </div>
          </>
        )}

        {/* VIEW 1 (API KEY EMBED): Official Google Street View Embed */}
        {viewMode === 'streetview' && officialStreetViewEmbed && (
          <iframe
            title={`Google Street View of ${landmark.title}`}
            src={officialStreetViewEmbed}
            className="streetview-iframe"
            allowFullScreen=""
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}

        {/* VIEW 2: 3D Satellite Map */}
        {viewMode === 'satellite' && (
          <iframe
            title={`3D Satellite View of ${landmark.title}`}
            src={googleSatelliteEmbed}
            className="streetview-iframe"
            allowFullScreen=""
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}

        {/* VIEW 3: Standard Road Map */}
        {viewMode === 'map' && (
          <iframe
            title={`Road Map of ${landmark.title}`}
            src={googleRoadmapEmbed}
            className="streetview-iframe"
            allowFullScreen=""
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      {/* 2. TOP-LEFT ROUTE & LOCATION CARD (Matching Google Street View UI) */}
      <div className="gsv-top-left-card" role="region" aria-label="Route Information">
        <button
          type="button"
          className="gsv-back-btn"
          onClick={onClose}
          title="Back to Memory Stories (Esc)"
          aria-label="Back to stories"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="gsv-route-details">
          <div className="gsv-route-stops-container">
            <div className="gsv-stops-indicator">
              <div className="stop-circle" />
              <div className="stop-dots" />
              <div className="stop-pin-icon"><MapPin size={11} /></div>
            </div>

            <div className="gsv-stops-text-col">
              <div className="gsv-origin-row">
                <span className="origin-label">from</span>
                <span className="origin-name">Your location</span>
                <div className="gsv-route-icons-right">
                  <MapPin size={14} className="route-pin-icon" title="Origin Pin" />
                  <MoreVertical size={14} className="route-more-icon" title="Options" />
                </div>
              </div>

              <div className="gsv-dest-row">
                <span className="dest-label">to</span>
                <span className="dest-name" title={landmark.address}>
                  {landmark.address}
                </span>
              </div>
            </div>
          </div>

          <div className="gsv-brand-row">
            <div className="gsv-logo-badge">
              <svg className="google-color-g" viewBox="0 0 24 24" width="16" height="16">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#0ea5e9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#38bdf8" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#0284c7" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google Street View</span>
            </div>
            <span className="gsv-date-pill">{landmark.date}</span>
          </div>
        </div>
      </div>

      {/* 3. TOP-RIGHT ACTION BAR (Share & Close) */}
      <div className="gsv-top-right-bar">
        <div className="gsv-mode-switch-group">
          <button
            className={`gsv-mode-btn ${viewMode === 'streetview' ? 'active' : ''}`}
            onClick={() => setViewMode('streetview')}
            title="360° Street View interactive ground view"
          >
            <Footprints size={14} />
            <span>Street View</span>
          </button>
          <button
            className={`gsv-mode-btn ${viewMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setViewMode('satellite')}
            title="3D Satellite photorealistic view"
          >
            <Sparkles size={14} />
            <span>3D Satellite</span>
          </button>
          <button
            className={`gsv-mode-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Road navigation map"
          >
            <Layers size={14} />
            <span>Map</span>
          </button>
        </div>

        <button
          type="button"
          className="gsv-icon-action-btn"
          onClick={copyShareLink}
          title={copiedLink ? 'Link Copied!' : 'Share Street View link'}
        >
          {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
          <span>{copiedLink ? 'Copied' : 'Share'}</span>
        </button>

        <button
          type="button"
          className="gsv-close-btn"
          onClick={onClose}
          aria-label="Close Street View (Esc)"
          title="Close (Esc)"
        >
          <X size={19} />
        </button>
      </div>

      {/* 4. BOTTOM-LEFT ROUTE STEP CARD (Matching Google Street View UI) */}
      <div className="gsv-bottom-step-card" role="region" aria-label="Step directions">
        <span className="step-count-badge">{landmark.step}</span>
        <div className="step-title-row">
          <MapPin size={16} className="step-pin" />
          <div className="step-content">
            <h3 className="step-place-name">{landmark.title}</h3>
            <p className="step-full-address">{landmark.address}</p>
          </div>
        </div>

        <div className="step-actions-row">
          <button
            type="button"
            className="step-btn"
            onClick={() => {
              if (resetCameraRef.current) resetCameraRef.current()
            }}
            title="Look at starting perspective"
          >
            <ChevronLeft size={14} />
            <span>Previous step</span>
          </button>

          <button
            type="button"
            className="step-btn restart"
            onClick={() => {
              setViewMode('streetview')
              if (resetCameraRef.current) resetCameraRef.current()
            }}
            title="Restart panorama"
          >
            <RefreshCw size={13} />
            <span>Restart</span>
          </button>

          <a
            href={nativeStreetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="step-open-native-btn"
            title="Open in native Google Street View (full immersion)"
          >
            <span>Full Google Maps</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 5. BOTTOM-RIGHT COMPASS & ZOOM CONTROLS (Matching Google Street View UI) */}
      <div className="gsv-bottom-right-controls">
        {/* Interactive Rotating Compass Rose */}
        <div
          className="gsv-compass-rose"
          title={`Compass: ${currentHeading}° (Click to face landmark)`}
          style={{ transform: `rotate(${-currentHeading}deg)` }}
          onClick={() => {
            if (resetCameraRef.current) resetCameraRef.current()
          }}
        >
          <div className="compass-dial">
            <div className="compass-needle north" />
            <div className="compass-needle south" />
            <span className="compass-n-label">N</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="gsv-zoom-controls">
          <button
            type="button"
            className="gsv-zoom-btn"
            onClick={() => setZoomLevel(z => Math.min(2.0, z + 0.2))}
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="gsv-zoom-btn"
            onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.2))}
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
        </div>
      </div>

      {/* 6. FLOATING POSTCARD IN TOP RIGHT (As requested by user!) */}
      <aside className={`floating-postcard-container ${isMinimized ? 'is-minimized' : ''}`}>
        {/* Minimized Pill State */}
        {isMinimized ? (
          <button
            type="button"
            className="minimized-postcard-pill"
            onClick={() => setIsMinimized(false)}
            title="Click to expand travel postcard"
          >
            <img src={postcard?.image} alt={postcard?.title} className="mini-thumb" />
            <div className="mini-info">
              <strong>{postcard?.title}</strong>
              <small>{postcard?.place || postcard?.city}</small>
            </div>
            <Maximize2 size={14} className="mini-icon" />
          </button>
        ) : (
          /* Full Interactive 3D Flip Travel Postcard */
          <div className={`postcard-card-wrapper ${isFlipped ? 'is-flipped' : ''}`}>
            {/* FRONT OF POSTCARD (Photograph + Details) */}
            <div className="postcard-face postcard-front">
              {/* Postcard Top Controls Bar */}
              <div className="postcard-controls-header">
                <span className="postcard-stamp-label">
                  <MapPin size={12} />
                  <span>{postcard?.city}, {postcard?.country}</span>
                </span>
                <div className="postcard-header-actions">
                  <button
                    type="button"
                    className="postcard-tool-btn"
                    onClick={() => setIsFlipped(true)}
                    title="Flip postcard to read handwritten travel story (F)"
                  >
                    <RotateCcw size={13} />
                    <span>Flip</span>
                  </button>
                  <button
                    type="button"
                    className="postcard-tool-btn"
                    onClick={() => setIsMinimized(true)}
                    title="Minimize postcard to view full Street View"
                  >
                    <Minimize2 size={13} />
                  </button>
                </div>
              </div>

              {/* Photograph with Frame */}
              <div
                className="postcard-photo-frame"
                onClick={() => setPhotoPreviewOpen(true)}
                title="Click to view photograph in full resolution"
                role="button"
                tabIndex={0}
              >
                <img
                  src={postcard?.image}
                  alt={postcard?.title}
                  className="postcard-photo-img"
                  loading="eager"
                />
                <div className="photo-zoom-hint">
                  <Eye size={13} />
                  <span>Inspect photo</span>
                </div>
              </div>

              {/* Postcard Front Content */}
              <div className="postcard-front-body">
                <div className="postcard-title-row">
                  <h3>{postcard?.title}</h3>
                  {postcard?.dates && (
                    <span className="postcard-date-tag">
                      <Calendar size={11} />
                      <span>{postcard.dates}</span>
                    </span>
                  )}
                </div>

                <p className="postcard-landmark-name">
                  <MapPin size={13} className="pin-icon" />
                  <span>{postcard?.place || postcard?.city}</span>
                </p>

                {/* Quoted Traveler Memory */}
                {(postcard?.note || postcard?.publicNote || postcard?.excerpt) && (
                  <blockquote className="postcard-quote">
                    “{postcard.note || postcard.publicNote || postcard.excerpt}”
                  </blockquote>
                )}

                {/* Traveler / Author attribution */}
                <div className="postcard-author-row">
                  <span className="author-name">
                    <Users size={12} />
                    <span>{postcard?.author || 'Traveller'}</span>
                  </span>
                  <button
                    type="button"
                    className="btn-flip-prompt"
                    onClick={() => setIsFlipped(true)}
                  >
                    <span>Read back</span>
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* BACK OF POSTCARD (Authentic Stationery with Stamp & Airmail) */}
            <div className="postcard-face postcard-back">
              {/* Airmail Chevron Top Stripe */}
              <div className="airmail-strip" />

              <div className="postcard-back-header">
                <span className="post-card-title">PAR AVION · POST CARD</span>
                <button
                  type="button"
                  className="postcard-tool-btn"
                  onClick={() => setIsFlipped(false)}
                  title="Flip back to front photograph"
                >
                  <RotateCcw size={13} />
                  <span>View Photo</span>
                </button>
              </div>

              <div className="postcard-back-grid">
                {/* Left Side: Handwritten Story & Journal */}
                <div className="postcard-message-area">
                  <p className="handwritten-greeting">Dear friends,</p>
                  <p className="handwritten-text">
                    {postcard?.note || postcard?.publicNote || postcard?.excerpt || 'Greetings from this incredible place! Exploring the streets, looking out across the skyline, and making memories together.'}
                  </p>
                  <p className="handwritten-signoff">— {postcard?.author || 'Your travel crew'}</p>

                  <div className="postmark-date-stamp">
                    <span>{postcard?.dates || '15 SEP 2026'}</span>
                    <small>{postcard?.city?.toUpperCase() || 'MALAYSIA'}</small>
                  </div>
                </div>

                {/* Vertical Divider Line */}
                <div className="postcard-divider-line" />

                {/* Right Side: Postage Stamp & Address Block */}
                <div className="postcard-address-area">
                  {/* Authentic Postal Stamp */}
                  <div className="postal-stamp-box">
                    <div className="stamp-inner">
                      <Globe2 size={16} />
                      <span className="stamp-cost">AIR MAIL</span>
                      <small>{postcard?.country || 'WORLD'}</small>
                    </div>
                    <div className="stamp-cancellation-wavy" />
                  </div>

                  {/* Recipient Address Lines */}
                  <div className="recipient-lines">
                    <div className="addr-line" />
                    <div className="addr-line" />
                    <div className="addr-line" />
                    <span className="addr-label">To: The Travel Explorers</span>
                  </div>
                </div>
              </div>

              {/* Back Footer Actions */}
              <div className="postcard-back-footer">
                <button
                  type="button"
                  className="btn-postcard-action"
                  onClick={copyShareLink}
                >
                  {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Spot'}</span>
                </button>
                <a
                  href={nativeStreetViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-postcard-action primary"
                >
                  <Navigation size={13} />
                  <span>Street View</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 7. FULL-SIZE PHOTOGRAPH PREVIEW LIGHTBOX */}
      {photoPreviewOpen && (
        <div
          className="photo-lightbox-modal"
          onClick={() => setPhotoPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={postcard?.image} alt={postcard?.title} className="lightbox-img" />
            <div className="lightbox-caption">
              <strong>{postcard?.title}</strong>
              <span>{postcard?.place || postcard?.city} · {postcard?.author}</span>
            </div>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setPhotoPreviewOpen(false)}
              aria-label="Close photo preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
