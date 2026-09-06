import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { Compass, RotateCw, ZoomIn, ZoomOut, MapPin, Sparkles, Globe, Map, Navigation, Play, Square } from 'lucide-react'

const LEG_FLIGHT_SECONDS = 2.6
const STOP_HOLD_SECONDS = 1.2
// Chase-camera offset relative to the plane during flight-through playback:
// how far above the route line and how far behind (opposite the direction
// of travel) the camera sits.
const FOLLOW_HEIGHT = 1.0
const FOLLOW_BACK = 1.6

// A stable reference for the (usually-omitted) `destinations` prop — `[]` as
// a default parameter would create a *new* array on every render, and since
// it sits in the scene-rebuilding effect's dependency list, that alone was
// enough to tear down and rebuild the entire WebGL scene on every re-render
// (including the one `setIsPlaying(true)` itself triggers), which reset
// flight-through playback back to off before it ever got to animate.
const EMPTY_DESTINATIONS = []

// A flight-path arc that stays radially anchored to the globe at every point
// along it (not just its two endpoints), by interpolating latitude/longitude
// (as colatitude `phi` and azimuth `theta`, matching latLngToVector3 below)
// directly and bulging the radius outward as a sine curve peaking at the
// midpoint. Endpoints are given as 3D positions (not raw lat/lng) since a
// repeat-visit pin is nudged slightly off its true coordinate to avoid
// overlapping an earlier stop, and the arc needs to start/end exactly there.
//
// An earlier version slerped the 3D *directions* instead, which is the true
// spherical great-circle path — geometrically correct, but for two stops far
// apart in longitude (e.g. Bangkok -> New York) the shortest great circle
// runs up near the pole, so the arc shot straight up out of frame in a tall,
// narrow loop ("basket handle") rather than sweeping low and wide across the
// globe the way a stylized flight-route map is expected to look. Interpolating
// phi/theta directly (taking the shorter way around on theta) keeps the path
// at roughly the same latitude band as its endpoints instead of detouring
// poleward, however far apart they are in longitude.
class SurfaceArc extends THREE.Curve {
  constructor(from, to, baseRadius, bulge) {
    super()
    const a = vector3ToPhiTheta(from)
    const b = vector3ToPhiTheta(to)
    this.phiFrom = a.phi
    this.dPhi = b.phi - a.phi
    this.thetaFrom = a.theta
    let dTheta = b.theta - a.theta
    if (dTheta > Math.PI) dTheta -= Math.PI * 2
    if (dTheta < -Math.PI) dTheta += Math.PI * 2
    this.dTheta = dTheta
    this.baseRadius = baseRadius
    this.bulge = bulge
  }

  getPoint(t, target = new THREE.Vector3()) {
    const phi = this.phiFrom + this.dPhi * t
    const theta = this.thetaFrom + this.dTheta * t
    const r = this.baseRadius + this.bulge * Math.sin(t * Math.PI)
    return target.set(-(r * Math.sin(phi) * Math.cos(theta)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
  }
}

// Inverse of latLngToVector3 — recovers colatitude (phi, 0 at the north pole)
// and azimuth (theta) from a 3D point already on (or near) the sphere.
function vector3ToPhiTheta(v) {
  const r = v.length()
  const phi = Math.acos(Math.max(-1, Math.min(1, v.y / r)))
  const theta = Math.atan2(v.z, -v.x)
  return { phi, theta }
}

// Convert lat/lng to 3D sphere coordinate
function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

// Real NASA-derived imagery (day map, terrain relief, ocean specular mask) —
// the same public-domain-sourced texture set three.js ships for its own
// earth demos, loaded once and reused across mounts.
const EARTH_TEXTURE_BASE = '/textures/earth'
let earthTextureCache = null
function loadEarthTextures() {
  if (!earthTextureCache) {
    const loader = new THREE.TextureLoader()
    const day = loader.load(`${EARTH_TEXTURE_BASE}/earth_atmos_2048.jpg`)
    // Color maps need sRGB decoding; normal/specular are data maps and stay linear.
    day.colorSpace = THREE.SRGBColorSpace
    earthTextureCache = {
      day,
      normal: loader.load(`${EARTH_TEXTURE_BASE}/earth_normal_2048.jpg`),
      specular: loader.load(`${EARTH_TEXTURE_BASE}/earth_specular_2048.jpg`)
    }
  }
  return earthTextureCache
}

export default function Globe3D({
  destinations = EMPTY_DESTINATIONS,
  selectedCity = null,
  onSelectCity,
  onOpenGoogleMap,
  routeStops = [],
  onStopReached,
  onPlaybackComplete
}) {
  const mountRef = useRef(null)
  const overlayRef = useRef(null)
  const [autoRotate, setAutoRotate] = useState(() => !(routeStops && routeStops.length >= 2))
  const [activeRegion, setActiveRegion] = useState('All')
  const [isPlaying, setIsPlaying] = useState(false)
  const isDraggingRef = useRef(false)
  const dragDistanceRef = useRef(0)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const globeGroupRef = useRef(null)
  const targetRotationRef = useRef({ x: 0.2, y: 0 })
  const cameraRef = useRef(null)
  const markerMeshesRef = useRef([])
  const isPlayingRef = useRef(false)
  const playLegIndexRef = useRef(0)
  const playTRef = useRef(0)
  const playHoldRef = useRef(0)

  const isRouteMode = routeStops && routeStops.length >= 2
  // Stable key so the scene only rebuilds when the route's actual content changes,
  // not on every parent re-render (routeStops is a fresh array reference otherwise).
  const routeStopsKey = useMemo(
    () => routeStops.map(s => `${s.id}-${s.lat}-${s.lng}`).join('|'),
    [routeStops]
  )

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Oceania']

  const filteredPills = useMemo(() => {
    if (activeRegion === 'All') return destinations.slice(0, 12)
    return destinations.filter(d => d.region === activeRegion || activeRegion === 'Middle East' && d.region?.includes('Middle'))
  }, [destinations, activeRegion])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // A fresh route means any in-progress flight-through no longer matches
    // reality — reset back to the start rather than resuming mid-air on stale legs.
    isPlayingRef.current = false
    playLegIndexRef.current = 0
    playTRef.current = 0
    playHoldRef.current = 0
    setIsPlaying(false)

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    // 6.2 keeps the 2.1-radius atmosphere comfortably inside the vertical FOV
    // (a wide/short container is height-limited, so 5.2 clipped the poles).
    camera.position.z = 6.2
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

    // Earth Sphere — real day/normal/specular imagery, not a drawn approximation
    const earthTextures = loadEarthTextures()
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTextures.day,
      normalMap: earthTextures.normal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: earthTextures.specular,
      specular: new THREE.Color(0x333333),
      shininess: 12
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
          gl_FragColor = vec4(0.35, 0.62, 1.0, 0.6) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      // Without this, the (semi-transparent) atmosphere still writes to the
      // depth buffer, which fights with the route arcs' own depth test and
      // makes them appear to cut in and out of the globe's surface.
      depthWrite: false
    })
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    globeGroup.add(atmosphereMesh)

    // Lighting — the real day-map's ocean pixels are naturally very dark
    // (true to the satellite photo), so a low ambient left the far side of
    // the globe (whatever isn't facing the "sun") reading as solid black as
    // soon as it was rotated into view. That wasn't just a cosmetic problem:
    // a route arc is genuinely drawn right on the sphere's surface, but over
    // a hard-to-see (near-black) stretch of globe it visually read as a line
    // floating off the edge of the planet rather than following it. Ambient
    // is kept strong enough that the whole globe stays visibly a sphere (not
    // just its sunlit side), so any arc drawn on its surface reads as such
    // from every angle, with the sun light adding a brighter side on top.
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.7)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.9)
    sunLight.position.set(5, 3, 5)
    scene.add(sunLight)

    const blueBackLight = new THREE.DirectionalLight(0x0284c7, 0.25)
    blueBackLight.position.set(-5, -2, -4)
    scene.add(blueBackLight)

    // Add City Pin Markers — either the full destinations browser, or (when a
    // routeStops sequence is supplied) numbered journey stops with connecting arcs.
    const markerGroup = new THREE.Group()
    globeGroup.add(markerGroup)
    markerMeshesRef.current = []
    const routeLabelEntries = []
    // Populated only in route mode, but declared here so the animation loop
    // below (defined after this block closes) can still see them.
    let legCurves = []
    let planeAnchor = null
    let planeEl = null
    // Chase-cam state for flight-through playback: the plane's current
    // direction of travel (frozen during a stop-hold, refreshed while
    // actively flying a leg), plus bookkeeping to restore the normal
    // wide-overview camera once playback ends.
    let currentTangent = new THREE.Vector3(0, 0, 1)
    let wasFollowing = false
    let savedCamZ = null

    if (isRouteMode) {
      const LEG_COLORS = [0x3e7b6c, 0xd9822b]
      const routeGroup = new THREE.Group()
      globeGroup.add(routeGroup)

      // Round trips revisit the same city (KL -> Japan -> KL), so repeated
      // coordinates are nudged apart along the sphere surface — otherwise the
      // start/end pins and their arcs would sit exactly on top of each other.
      const occurrenceCount = {}
      const stopPositions = routeStops.map(stop => {
        const key = `${stop.lat},${stop.lng}`
        const occurrence = occurrenceCount[key] || 0
        occurrenceCount[key] = occurrence + 1
        // Raised well clear of the sphere (2.0) — the normal-mapped terrain
        // relief can make the literal surface look bumpy, so pins/arcs need
        // a generous gap or they read as clipping into hills at a glance.
        let pos = latLngToVector3(stop.lat, stop.lng, 2.14)
        if (occurrence > 0) {
          const normal = pos.clone().normalize()
          let tangent = new THREE.Vector3(0, 1, 0).cross(normal)
          if (tangent.lengthSq() < 1e-6) tangent = new THREE.Vector3(1, 0, 0).cross(normal)
          tangent.normalize().applyAxisAngle(normal, occurrence * (Math.PI / 2))
          pos = pos.clone().addScaledVector(tangent, 0.22).normalize().multiplyScalar(2.14)
        }
        return pos
      })

      // Arced flight-path style legs between consecutive stops
      stopPositions.slice(0, -1).forEach((from, i) => {
        const to = stopPositions[i + 1]
        const angleBetween = from.clone().normalize().angleTo(to.clone().normalize())
        // A shallow lift — hugs the surface closely (never dropping below
        // the base radius, so it can't dip back into the terrain relief)
        // while still reading as a raised route line rather than a texture
        // painted flat onto the sphere.
        const bowHeight = 0.01 + 0.015 * Math.sin(angleBetween)
        const curve = new SurfaceArc(from, to, 2.14, bowHeight)
        const color = LEG_COLORS[i % LEG_COLORS.length]

        const tubeGeometry = new THREE.TubeGeometry(curve, 48, 0.015, 8, false)
        const tubeMaterial = new THREE.MeshBasicMaterial({ color })
        routeGroup.add(new THREE.Mesh(tubeGeometry, tubeMaterial))

        const tangent = curve.getTangentAt(0.92).normalize()
        const arrowGeometry = new THREE.ConeGeometry(0.03, 0.08, 10)
        const arrowMaterial = new THREE.MeshBasicMaterial({ color })
        const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial)
        arrowMesh.position.copy(curve.getPointAt(0.92))
        arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
        routeGroup.add(arrowMesh)

        legCurves.push({ curve, toStop: routeStops[i + 1] })
      })

      // An invisible anchor whose position we drive during flight-through
      // playback, purely so we can read its world position each frame the
      // same way the labels do (accounting for the globe's own rotation).
      planeAnchor = new THREE.Object3D()
      routeGroup.add(planeAnchor)

      // Numbered stop markers + HTML labels projected over the canvas
      const overlay = overlayRef.current
      if (overlay) overlay.innerHTML = ''

      if (overlay) {
        planeEl = document.createElement('div')
        planeEl.className = 'route-plane-marker'
        // A line-art plane icon (same style/family as the rest of the UI's
        // lucide icons) instead of the emoji glyph, which rendered
        // inconsistently across platforms and didn't match the app's look.
        planeEl.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>'
        planeEl.style.opacity = '0'
        overlay.appendChild(planeEl)
      }

      routeStops.forEach((stop, idx) => {
        const pos = stopPositions[idx]
        const isStart = idx === 0
        const isEnd = idx === routeStops.length - 1
        const color = isStart ? 0x3e7b6c : isEnd ? 0xd9822b : 0xeda100

        // A sphere (not a flat ring) so the pin looks like a clean dot from
        // every viewing angle instead of foreshortening into an ellipse.
        const dotGeometry = new THREE.SphereGeometry(0.055, 16, 16)
        const dotMaterial = new THREE.MeshBasicMaterial({ color })
        const dotMesh = new THREE.Mesh(dotGeometry, dotMaterial)
        dotMesh.position.copy(pos)
        markerGroup.add(dotMesh)

        const haloGeometry = new THREE.SphereGeometry(0.09, 16, 16)
        const haloMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
        const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial)
        haloMesh.position.copy(pos)
        markerGroup.add(haloMesh)

        if (overlay) {
          const labelEl = document.createElement('div')
          labelEl.className = 'route-stop-label'
          const badge = document.createElement('span')
          badge.className = 'route-stop-label-badge'
          badge.style.background = `#${color.toString(16).padStart(6, '0')}`
          badge.textContent = String(idx + 1)
          const text = document.createElement('span')
          text.className = 'route-stop-label-text'
          text.textContent = `${stop.flag || ''} ${stop.city}`
          labelEl.appendChild(badge)
          labelEl.appendChild(text)
          overlay.appendChild(labelEl)
          routeLabelEntries.push({ mesh: dotMesh, el: labelEl })
        }
      })
    } else {
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
    }

    // Animation Loop
    let animationFrameId
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      // Flight-through playback: advance the plane along the current leg's
      // curve, hold briefly at each arrival, and ease the globe to keep
      // facing the destination as it flies — all before this frame renders.
      if (isPlayingRef.current && legCurves.length > 0) {
        const legIdx = playLegIndexRef.current
        if (legIdx >= legCurves.length) {
          isPlayingRef.current = false
          setIsPlaying(false)
          if (onPlaybackComplete) onPlaybackComplete()
        } else if (playHoldRef.current > 0) {
          playHoldRef.current -= delta
        } else {
          playTRef.current = Math.min(1, playTRef.current + delta / LEG_FLIGHT_SECONDS)
          const leg = legCurves[legIdx]
          planeAnchor.position.copy(leg.curve.getPointAt(playTRef.current))
          currentTangent = leg.curve.getTangentAt(Math.min(0.999, Math.max(0.001, playTRef.current)))

          const theta = (leg.toStop.lng + 180) * (Math.PI / 180)
          targetRotationRef.current = { x: (leg.toStop.lat / 90) * 0.5, y: -theta + Math.PI / 2 }

          if (playTRef.current >= 1) {
            const arrivedIdx = legIdx + 1
            playHoldRef.current = STOP_HOLD_SECONDS
            playTRef.current = 0
            playLegIndexRef.current = arrivedIdx
            if (onStopReached) onStopReached(routeStops[arrivedIdx], arrivedIdx)
          }
        }
      }

      if (isPlayingRef.current) {
        // Chase camera: while the plane is flying, ride along just behind
        // and above it (rather than orbiting the whole globe from a fixed
        // outside view), looking a little ahead along its direction of
        // travel — like mult.dev's plane-follows-the-route playback instead
        // of a static wide shot of the whole planet. The globe itself is
        // left exactly as it was when Play was pressed, so the only thing
        // moving is the camera chasing the plane through world space.
        if (!wasFollowing) {
          savedCamZ = camera.position.z
          wasFollowing = true
        }
        const worldPos = new THREE.Vector3()
        planeAnchor.getWorldPosition(worldPos)
        const worldTangent = currentTangent.clone().transformDirection(globeGroup.matrixWorld).normalize()
        const radialOut = worldPos.clone().normalize()
        const desiredCamPos = worldPos
          .clone()
          .addScaledVector(radialOut, FOLLOW_HEIGHT)
          .addScaledVector(worldTangent, -FOLLOW_BACK)
        camera.position.lerp(desiredCamPos, 0.15)
        const lookTarget = worldPos.clone().addScaledVector(worldTangent, 0.6)
        camera.lookAt(lookTarget)
      } else {
        if (wasFollowing) {
          wasFollowing = false
          camera.position.set(0, 0, savedCamZ != null ? savedCamZ : camera.position.z)
          camera.rotation.set(0, 0, 0)
        }
        // Auto rotation
        if (autoRotate && !isDraggingRef.current) {
          globeGroup.rotation.y += 0.002
        } else {
          // Smooth dampening towards target rotation
          globeGroup.rotation.y += (targetRotationRef.current.y - globeGroup.rotation.y) * 0.08
          globeGroup.rotation.x += (targetRotationRef.current.x - globeGroup.rotation.x) * 0.08
        }
      }

      renderer.render(scene, camera)

      // Project the plane marker over its current 3D anchor while playing
      if (planeEl) {
        const showPlane = isPlayingRef.current
        if (!showPlane) {
          planeEl.style.opacity = '0'
        } else {
          const worldPos = new THREE.Vector3()
          planeAnchor.getWorldPosition(worldPos)
          const normal = worldPos.clone().normalize()
          const camDir = camera.position.clone().sub(worldPos).normalize()
          if (normal.dot(camDir) < 0.05) {
            planeEl.style.opacity = '0'
          } else {
            const w = container.clientWidth
            const h = container.clientHeight
            const ndc = worldPos.clone().project(camera)
            const x = (ndc.x * 0.5 + 0.5) * w
            const y = (-ndc.y * 0.5 + 0.5) * h
            planeEl.style.opacity = '1'
            planeEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
          }
        }
      }

      // Keep the HTML journey labels pinned over their 3D pins, hiding them
      // when the globe's rotation carries that pin around to the far side.
      if (routeLabelEntries.length > 0) {
        const w = container.clientWidth
        const h = container.clientHeight
        // Nearby stops (e.g. a round trip's start/end) project close together on
        // screen — stack their labels instead of letting them overlap illegibly.
        const placed = []
        routeLabelEntries.forEach(({ mesh, el }) => {
          const worldPos = new THREE.Vector3()
          mesh.getWorldPosition(worldPos)
          const normal = worldPos.clone().normalize()
          const camDir = camera.position.clone().sub(worldPos).normalize()
          const facing = normal.dot(camDir)
          if (facing < 0.08) {
            el.style.opacity = '0'
            return
          }
          const ndc = worldPos.clone().project(camera)
          const x = (ndc.x * 0.5 + 0.5) * w
          let y = (-ndc.y * 0.5 + 0.5) * h

          const halfWidth = (el.offsetWidth || 90) / 2 + 6
          let attempts = 0
          while (
            attempts < 6 &&
            placed.some(p => Math.abs(p.x - x) < halfWidth + p.halfWidth && Math.abs(p.y - y) < 24)
          ) {
            y -= 24
            attempts++
          }
          placed.push({ x, y, halfWidth })

          el.style.opacity = '1'
          el.style.transform = `translate(-50%, -130%) translate(${x}px, ${y}px)`
        })
      }
    }
    animate()

    // Mouse & Touch Controls
    const handleMouseDown = e => {
      isDraggingRef.current = true
      dragDistanceRef.current = 0
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = e => {
      // The chase camera owns rotation/position during flight-through playback.
      if (!isDraggingRef.current || isPlayingRef.current) return
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
      // The chase camera owns camera.position during flight-through playback.
      if (isPlayingRef.current) return
      // 4.3 is the closest allowed zoom — any nearer and the low-poly
      // continent shapes read as a crude blob and pins crowd the frame edge.
      camera.position.z = Math.max(4.3, Math.min(8.0, camera.position.z + e.deltaY * 0.003))
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
      if (overlayRef.current) overlayRef.current.innerHTML = ''
      if (container.contains(dom)) {
        container.removeChild(dom)
      }
      renderer.dispose()
    }
  }, [destinations, selectedCity, onSelectCity, onOpenGoogleMap, routeStopsKey])

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

  // In journey mode, face the globe toward the route's overall center immediately
  // — otherwise the pins/arcs can start out on the far side, invisible until the
  // (slow) auto-rotation eventually brings them into view. Centering on just the
  // first stop pushed every other stop toward the edge of the visible hemisphere
  // for routes spanning any real distance (e.g. KL -> Tokyo), so the raised arcs
  // between them visibly bulged past the globe's silhouette into empty space —
  // centering the route's average direction instead keeps every stop (and the
  // arcs between them) closer to the middle of the frame, where there's room
  // for an arc to rise without crossing the horizon.
  useEffect(() => {
    if (!isRouteMode || !globeGroupRef.current) return
    const sum = routeStops.reduce((acc, stop) => acc.add(latLngToVector3(stop.lat, stop.lng, 1)), new THREE.Vector3())
    const avgDir = sum.normalize()
    const y = Math.atan2(-avgDir.x, avgDir.z)
    const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, avgDir.y))) * 180) / Math.PI
    targetRotationRef.current = { x: (lat / 90) * 0.5, y }
    setAutoRotate(false)
  }, [routeStopsKey, isRouteMode])

  const zoom = delta => {
    if (!cameraRef.current || isPlayingRef.current) return
    cameraRef.current.position.z = Math.max(4.3, Math.min(8.0, cameraRef.current.position.z + delta))
  }

  const startPlayback = () => {
    if (!isRouteMode) return
    playLegIndexRef.current = 0
    playTRef.current = 0
    playHoldRef.current = 0
    isPlayingRef.current = true
    setAutoRotate(false)
    setIsPlaying(true)
    if (onStopReached) onStopReached(routeStops[0], 0)
  }

  const stopPlayback = () => {
    isPlayingRef.current = false
    setIsPlaying(false)
  }

  return (
    <div className="globe-wrapper">
      <div className="globe-canvas-container" ref={mountRef} />
      {isRouteMode && <div className="globe-route-label-layer" ref={overlayRef} />}

      {/* Floating Controls */}
      <div className="globe-controls">
        {!isRouteMode && (
          <button
            className="control-btn map-mode-btn"
            onClick={() => onOpenGoogleMap && onOpenGoogleMap(selectedCity)}
            title="Click to Open Real Google Maps & Nearby Sights"
          >
            <Map size={16} />
            <span>Real Google Map</span>
          </button>
        )}
        {isRouteMode && (
          <button
            className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
            title={isPlaying ? 'Stop the flight-through' : 'Play an animated flight through your route'}
          >
            {isPlaying ? <Square size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Stop' : 'Play Journey'}</span>
          </button>
        )}
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
        <span>
          {isRouteMode
            ? isPlaying
              ? 'Following the flight along your route...'
              : 'Drag to rotate the globe, scroll to zoom — the arrows show your travel direction'
            : 'Click anywhere on the 3D globe to view Real Google Map & Nearby Spots'}
        </span>
      </div>

      {/* Region Tabs & Quick Destinations (Explore mode only) */}
      {!isRouteMode && (
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
      )}
    </div>
  )
}
