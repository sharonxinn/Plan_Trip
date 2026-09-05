import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Camera, Check, Coins, DollarSign, FileText, Globe2, History,
  MapPin, Pause, Play, Rocket, Send, Sparkles, Users2
} from 'lucide-react'
import LyraSpatialMemoryModal from './LyraSpatialMemoryModal'

const STORAGE_KEY = 'plantrip-public-memory-posts-v1'

const TYPE_META = {
  postcard: { label: 'Postcard', icon: Camera, color: '#ff8f70' },
  spending: { label: 'Spending recap', icon: DollarSign, color: '#5fd5b3' },
  trip: { label: 'Past trip', icon: History, color: '#f6c563' },
  journal: { label: 'Trip journal', icon: FileText, color: '#86b7ff' }
}

const PUBLIC_LOCATION_STORIES = [
  {
    city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869,
    title: 'Three bright days between towers, markets and late suppers',
    summary: 'A practical city break with shaded walks, rail connections and plenty of room for food stops.',
    dates: '15–18 September 2026', travellers: '4 friends', author: 'Pei Shan & friends',
    postcards: [
      ['Twin towers selfie at blue hour', 'Petronas Twin Towers & KLCC Park', '/images/klcc_friends_evening.jpg', 'The fountain lights came on just as the rain cleared and everyone gathered for a group photo.'],
      ['Morning climb at Batu Caves', 'Batu Caves', '/images/batucaves_friends_climb.jpg', 'We reached the rainbow steps before the morning heat and took our time on the climb.'],
      ['Late supper with the crew', 'Jalan Alor & City Centre', '/images/trip_friends_supper.jpg', 'Everyone ordered one favourite and shared everything. The kind of trip we will keep talking about.'],
      ['Quiet avenue walk and blossom trees', 'Heritage Avenue & Arts Quarter', '/images/neighbourhood_street_walk.jpg', 'Quiet morning streets with blooming pink trees, brick storefronts and warm sunshine before the city wakes up.'],
      ['Golden hour stroll across the skyline', 'The Exchange TRX Sky Park', '/images/trx_rooftop_friends.jpg', 'The rooftop garden gave us an easy final afternoon walk above the city.']
    ],
    spending: { planned: 3800, actual: 3458, currency: 'RM', perPerson: 865, categories: [['Stay', 1320], ['Transport', 718], ['Food', 836], ['Experiences', 404], ['Shopping', 180]] },
    days: [['Day 1 · City centre', 'KLCC Park → Petronas Towers → Saloma Link → Kampung Baru dinner'], ['Day 2 · Culture and markets', 'Batu Caves → Central Market → Petaling Street → Jalan Alor'], ['Day 3 · New Kuala Lumpur', 'The Exchange TRX → Bukit Bintang → rooftop sunset']],
    journal: [['08:10 · Batu Caves', 'The limestone looked silver in the early light. We finished the steps before breakfast.'], ['14:30 · Central Market', 'We split up for forty minutes and returned with prints, snacks and the same blue postcard.'], ['21:15 · Jalan Alor', 'The best meal was the one where nobody remembered who ordered which plate.']],
    notes: [['Pei Shan', 'Use the covered KLCC walkway in the afternoon heat.'], ['Marcus', 'Tap-to-pay worked on rail, but keep small cash for markets.'], ['Vicky', 'Book the towers before the trip and leave one dinner undecided.']]
  },
  {
    city: 'George Town', country: 'Malaysia', lat: 5.4164, lng: 100.3327,
    title: 'Four slow days of murals, clan jetties and breakfast tables',
    summary: 'A walkable heritage trip paced around early mornings, shaded arcades and Penang’s food culture.',
    dates: '10–13 August 2026', travellers: '4 friends', author: 'Aina’s food club',
    postcards: [
      ['Painted lanes and laughter', 'Armenian Street', '/images/penang_mural_friends.jpg', 'Found the famous bicycle mural and took turns posing with it.'],
      ['Quiet avenue walk and blossom trees', 'Heritage Arts & Street District', '/images/neighbourhood_street_walk.jpg', 'Sunlit streets with cherry blossom trees in the distance, open sky and calm morning air.'],
      ['Wooden homes over the water', 'Chew Jetty', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1100&q=84', 'We walked softly and stayed for the evening breeze.'],
      ['The hill before the clouds', 'Penang Hill', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1100&q=84', 'Cool morning air at the top before the crowds arrived.'],
      ['Breakfast table feast', 'Pulau Tikus Market', '/images/trip_friends_supper.jpg', 'Char kway teow, iced kopi and bowls of curry noodles shared together.']
    ],
    spending: { planned: 2200, actual: 1980, currency: 'RM', perPerson: 495, categories: [['Stay', 720], ['Transport', 210], ['Food', 604], ['Experiences', 286], ['Shopping', 160]] },
    days: [['Day 1 · Heritage core', 'Armenian Street → Khoo Kongsi → Chew Jetty → clan-house dinner'], ['Day 2 · Hills and gardens', 'Penang Hill → The Habitat → Gurney Drive'], ['Day 3 · Local neighbourhoods', 'Pulau Tikus breakfast → Blue Mansion → Hin Bus Depot'], ['Day 4 · Easy farewell', 'Kopi stop → market gifts → airport']],
    journal: [['07:40 · Campbell Street', 'Metal shutters lifted one by one while the first kopi cups reached the tables.'], ['12:20 · Armenian Street', 'We stopped following the mural list and found a tiny print studio.'], ['18:05 · Chew Jetty', 'The boards warmed in the last light and dinner boats moved across the channel.']],
    notes: [['Aina', 'Leave one morning unplanned and walk before the streets get busy.'], ['Daniel', 'Hawker meals kept the budget low without making the trip feel restricted.'], ['Sara', 'The funicular queue is much shorter before 9am.']]
  },
  {
    city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503,
    title: 'Six days of neighbourhoods, small bars and last trains',
    summary: 'A rail-first trip that pairs the famous crossings with calm gardens and neighbourhood evenings.',
    dates: '1–6 May 2026', travellers: '2 travellers', author: 'Mika & Ren',
    postcards: [
      ['Morning stroll under the lantern', 'Senso-ji Asakusa', '/images/tokyo_sensoji_friends.jpg', 'At eight, the temple courtyard belonged to locals and early walkers.'],
      ['Umbrellas across Shibuya', 'Shibuya Crossing', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1100&q=84', 'Looking out over the sea of umbrellas after evening drizzle.'],
      ['Afternoon pause beneath the trees', 'Shinjuku Gyoen', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=84', 'We bought lunch nearby and sat under the cherry trees.'],
      ['Counter stories late at night', 'Omoide Yokocho', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1100&q=84', 'Six seats, grilled skewers and stories late into the night.']
    ],
    spending: { planned: 8000, actual: 7450, currency: 'RM', perPerson: 3725, categories: [['Stay', 2840], ['Rail', 1130], ['Food', 1760], ['Experiences', 1120], ['Shopping', 600]] },
    days: [['Day 1 · Asakusa', 'Senso-ji → Kappabashi → Sumida River'], ['Day 2 · Shibuya', 'Meiji Shrine → Harajuku → Shibuya Sky'], ['Day 3 · Tsukiji and Ginza', 'Outer Market → Hamarikyu → Ginza'], ['Day 4 · Shinjuku', 'Gyoen → galleries → Omoide Yokocho'], ['Day 5 · Kamakura day trip', 'Great Buddha → Hase → seaside train'], ['Day 6 · Yanaka', 'Morning walk → coffee → airport']],
    journal: [['07:05 · Asakusa', 'Incense drifted through a nearly empty gate.'], ['16:50 · Shibuya', 'Clouds opened for twelve minutes exactly at sunset.'], ['22:40 · Shinjuku', 'We caught the last comfortable train with grilled smoke still on our jackets.']],
    notes: [['Mika', 'Group each day by rail line instead of chasing a long attraction list.'], ['Ren', 'Carry a small hand towel and put a coin pouch in an easy pocket.']]
  },
  {
    city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018,
    title: 'River boats, temple mornings and a very good food budget',
    summary: 'Four energetic days connected by river, rail and short evening walks.',
    dates: '20–23 February 2026', travellers: '3 friends', author: 'Ploy, Fern & Nan',
    postcards: [
      ['River breeze at sunset', 'Wat Arun & Chao Phraya', '/images/bangkok_watarun_friends.jpg', 'Watching longtail boats drift past as the temple began to gleam.'],
      ['Neon market walk', 'Yaowarat Chinatown', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1100&q=84', 'Following the street food smells down the neon alleys.'],
      ['Midnight flower walk', 'Pak Khlong Talat', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=84', 'Fresh jasmine garlands and bright flowers in every stall.'],
      ['Commute on the river boat', 'Chao Phraya Express', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1100&q=84', 'The river commute was the best view in the whole city.']
    ],
    spending: { planned: 3000, actual: 2690, currency: 'RM', perPerson: 897, categories: [['Stay', 960], ['Transport', 330], ['Food', 720], ['Experiences', 480], ['Shopping', 200]] },
    days: [['Day 1 · Old city', 'Grand Palace → Wat Pho → Wat Arun'], ['Day 2 · Markets', 'Chatuchak → Ari cafés → rooftop'], ['Day 3 · River neighbourhoods', 'Talat Noi → ferry → ICONSIAM'], ['Day 4 · Food finale', 'Jim Thompson House → Yaowarat Road']],
    journal: [['08:00 · Wat Pho', 'The tiled courtyards were cool enough to walk slowly.'], ['15:10 · Chao Phraya', 'We skipped traffic and watched the city rearrange itself from the water.'], ['20:35 · Yaowarat', 'Dinner arrived in six small plates and disappeared just as quickly.']],
    notes: [['Ploy', 'The orange-flag boat is cheap, fast and part of the experience.'], ['Fern', 'Temple clothing rules are easy if you keep a light overshirt in your bag.']]
  }
]

const SEED_POSTS = PUBLIC_LOCATION_STORIES.flatMap(location => [
  ...location.postcards.map((postcard, index) => ({ id: `seed-${location.city}-postcard-${index}`, type: 'postcard', city: location.city, country: location.country, lat: location.lat, lng: location.lng, author: location.author, title: postcard[0], excerpt: postcard[1], publicNote: postcard[3], image: postcard[2], time: 'Shared publicly' })),
  { id: `seed-${location.city}-spending`, type: 'spending', city: location.city, country: location.country, lat: location.lat, lng: location.lng, author: location.author, title: `${location.spending.currency} ${location.spending.actual.toLocaleString()} total spend`, excerpt: `${location.spending.currency} ${location.spending.perPerson.toLocaleString()} per traveller`, publicNote: location.notes[0]?.[1], time: 'Shared publicly' },
  { id: `seed-${location.city}-trip`, type: 'trip', city: location.city, country: location.country, lat: location.lat, lng: location.lng, author: location.author, title: location.title, excerpt: `${location.dates} · ${location.travellers}`, publicNote: location.notes[1]?.[1], time: 'Shared publicly' },
  { id: `seed-${location.city}-journal`, type: 'journal', city: location.city, country: location.country, lat: location.lat, lng: location.lng, author: location.author, title: `Notes from ${location.city}`, excerpt: location.journal[0]?.[1], publicNote: location.notes[0]?.[1], time: 'Shared publicly' }
])

function latLngToVector3(lat, lng, radius = 2.02) {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function makeEarthTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 800
  const ctx = canvas.getContext('2d')
  const ocean = ctx.createLinearGradient(0, 0, 0, 800)
  ocean.addColorStop(0, '#183d67')
  ocean.addColorStop(.48, '#0b294b')
  ocean.addColorStop(1, '#071b33')
  ctx.fillStyle = ocean
  ctx.fillRect(0, 0, 1600, 800)

  ctx.strokeStyle = 'rgba(136,183,222,.09)'
  ctx.lineWidth = 1
  for (let x = 0; x <= 1600; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 800); ctx.stroke() }
  for (let y = 0; y <= 800; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke() }

  const continents = [
    [[70,170],[150,95],[275,90],[370,145],[350,225],[285,265],[230,335],[135,300],[90,230]],
    [[320,355],[390,375],[445,450],[430,570],[385,700],[340,620],[315,490]],
    [[690,145],[805,105],[1000,120],[1120,175],[1280,160],[1440,245],[1390,350],[1240,365],[1120,330],[1010,380],[900,340],[825,270],[720,250]],
    [[760,330],[890,325],[940,410],[900,570],[820,650],[755,530],[720,405]],
    [[1190,360],[1265,390],[1320,470],[1275,540],[1210,485]],
    [[1320,540],[1440,545],[1490,630],[1415,690],[1305,650]],
    [[1480,300],[1510,315],[1500,365],[1475,350]],
    [[560,650],[720,650],[810,690],[765,720],[600,715]]
  ]
  const land = ctx.createLinearGradient(0, 80, 0, 720)
  land.addColorStop(0, '#6aa58a')
  land.addColorStop(.55, '#397965')
  land.addColorStop(1, '#245747')
  ctx.fillStyle = land
  ctx.shadowColor = 'rgba(86,208,171,.35)'
  ctx.shadowBlur = 18
  continents.forEach(points => {
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.closePath()
    ctx.fill()
  })
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeStarGeometry(outer = .105, inner = .045) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + i * Math.PI / 5
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return new THREE.ShapeGeometry(shape)
}

function makeMarkerLabel(post, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 360
  canvas.height = 82
  const ctx = canvas.getContext('2d')
  ctx.font = '700 27px sans-serif'
  const name = post.city.length > 18 ? `${post.city.slice(0, 17)}…` : post.city
  const textWidth = ctx.measureText(name).width
  ctx.fillStyle = 'rgba(5,13,23,.82)'
  ctx.beginPath()
  ctx.roundRect(8, 7, Math.min(340, textWidth + 76), 64, 18)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(34, 39, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f5f8fb'
  ctx.fillText(name, 53, 48)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true }))
  sprite.scale.set(1.08, .246, 1)
  sprite.userData.labelTexture = texture
  return sprite
}

function makeGoldStarMarker(post, count) {
  const canvas = document.createElement('canvas')
  canvas.width = 192
  canvas.height = 192
  const ctx = canvas.getContext('2d')
  ctx.translate(96, 96)
  ctx.beginPath()
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? 72 : 32
    const angle = -Math.PI / 2 + i * Math.PI / 5
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.shadowColor = '#f4cf69'
  ctx.shadowBlur = 28
  const gold = ctx.createLinearGradient(-40, -60, 45, 65)
  gold.addColorStop(0, '#fff1a6')
  gold.addColorStop(.45, '#e5bb52')
  gold.addColorStop(1, '#9c6a14')
  ctx.fillStyle = gold
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#ffe9a0'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fillStyle = '#181307'
  ctx.font = '800 42px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(count), 0, 3)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false }))
  sprite.scale.set(.52, .52, 1)
  sprite.userData = { post, labelTexture: texture }
  return sprite
}

function MemoryGlobe({ posts, onSelect, playing, onTogglePlaying }) {
  const mountRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const playingRef = useRef(playing)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100)
    camera.position.set(0, .04, 6.45)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    group.rotation.x = .04
    group.rotation.y = Math.PI - .24
    scene.add(group)

    const earthGeometry = new THREE.SphereGeometry(2, 96, 96)
    const loader = new THREE.TextureLoader()
    const texture = loader.load('/textures/earth-atmos-2048.jpg')
    const normalMap = loader.load('/textures/earth-normal-2048.jpg')
    const specularMap = loader.load('/textures/earth-specular-2048.jpg')
    texture.colorSpace = THREE.SRGBColorSpace
    const earth = new THREE.Mesh(earthGeometry, new THREE.MeshPhongMaterial({
      map: texture,
      normalMap,
      normalScale: new THREE.Vector2(.72, .72),
      specularMap,
      specular: new THREE.Color(0x52677b),
      shininess: 10
    }))
    group.add(earth)

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.12, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: 'varying vec3 n; void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'varying vec3 n; void main(){float a=pow(.72-dot(n,vec3(0.,0.,1.)),2.4);gl_FragColor=vec4(.24,.72,1.,a*.72);}',
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
      })
    )
    group.add(atmosphere)

    const starsGeometry = new THREE.BufferGeometry()
    const stars = new Float32Array(1450 * 3)
    for (let i = 0; i < stars.length; i += 3) {
      stars[i] = (Math.random() - .5) * 22
      stars[i + 1] = (Math.random() - .5) * 13
      stars[i + 2] = -2 - Math.random() * 10
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3))
    scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xddebf5, size: .018, transparent: true, opacity: .82 })))
    scene.add(new THREE.AmbientLight(0x7790a6, .58))
    const key = new THREE.DirectionalLight(0xfff4dc, 2.35)
    key.position.set(-3.5, 2.6, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x3d9dff, .92)
    rim.position.set(-5, -1, -3)
    scene.add(rim)

    const markers = []
    const halos = []
    const locationGroups = Object.values(posts.reduce((groups, post) => {
      const key = `${post.city}-${post.country}`
      if (!groups[key]) groups[key] = { post, posts: [] }
      groups[key].posts.push(post)
      return groups
    }, {}))
    locationGroups.forEach(({ post, posts: locationPosts }, index) => {
      const markerColor = '#e7bd58'
      const color = new THREE.Color(markerColor)
      const surface = latLngToVector3(post.lat + (index % 3) * .32, post.lng + (index % 4) * .32, 2.01)
      const pos = surface.clone().normalize().multiplyScalar(2.22)
      const marker = makeGoldStarMarker(post, locationPosts.length)
      marker.userData.locationKey = `${post.city}-${post.country}`
      marker.position.copy(pos)
      group.add(marker)
      markers.push(marker)
      const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([surface, pos]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: .7 }))
      group.add(stem)
      const halo = new THREE.Mesh(new THREE.RingGeometry(.12, .145, 28), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: .48 }))
      halo.position.copy(pos.clone().multiplyScalar(1.004))
      halo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize())
      halo.userData.baseScale = .9 + (index % 3) * .12
      group.add(halo)
      halos.push(halo)
      const label = makeMarkerLabel(post, markerColor)
      label.position.copy(pos.clone().normalize().multiplyScalar(2.39))
      label.position.y += .13
      label.userData.post = post
      label.userData.locationKey = `${post.city}-${post.country}`
      group.add(label)
      markers.push(label)
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let dragging = false
    let moved = 0
    let last = { x: 0, y: 0 }
    const down = event => { dragging = true; moved = 0; last = { x: event.clientX, y: event.clientY }; renderer.domElement.setPointerCapture?.(event.pointerId) }
    const move = event => {
      if (!dragging) return
      const dx = event.clientX - last.x
      const dy = event.clientY - last.y
      moved += Math.abs(dx) + Math.abs(dy)
      group.rotation.y += dx * .006
      group.rotation.x = Math.max(-.75, Math.min(.75, group.rotation.x + dy * .004))
      last = { x: event.clientX, y: event.clientY }
    }
    const up = event => {
      dragging = false
      if (moved > 6) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(markers.filter(item => item.userData.post))[0]
      if (hit?.object.userData.post) onSelectRef.current(hit.object.userData.locationKey)
    }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)

    const resize = () => {
      const width = mount.clientWidth || 700
      const height = mount.clientHeight || 620
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    let frame
    const clock = new THREE.Clock()
    const animate = () => {
      const t = clock.getElapsedTime()
      if (playingRef.current && !dragging) group.rotation.y += .0017
      halos.forEach((marker, index) => {
        const pulse = marker.userData.baseScale + Math.sin(t * 2.3 + index) * .15
        marker.scale.setScalar(pulse)
        marker.material.opacity = .38 + Math.sin(t * 2.3 + index) * .2
      })
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', down)
      renderer.domElement.removeEventListener('pointermove', move)
      renderer.domElement.removeEventListener('pointerup', up)
      texture.dispose()
      normalMap.dispose()
      specularMap.dispose()
      scene.traverse(item => { item.geometry?.dispose?.(); item.material?.dispose?.() })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [posts])

  return (
    <div className="memory-earth-stage">
      <div className="earth-stage-copy">
        <span><span className="earth-live-dot" /> Live memory map</span>
        <strong>{posts.length} stories around the world</strong>
      </div>
      <div className="memory-earth-canvas" ref={mountRef} aria-label="Interactive 3D Earth with public travel memories" />
      <button className="earth-motion-toggle" onClick={onTogglePlaying} aria-label={playing ? 'Pause globe rotation' : 'Resume globe rotation'}>
        {playing ? <Pause size={15}/> : <Play size={15}/>} {playing ? 'Pause' : 'Rotate'}
      </button>
      <div className="earth-drag-hint">Drag to explore · select a light to open its story</div>
    </div>
  )
}

function LocationBlog({ story, personalPosts, onRemovePersonalPost, onOpen3DPostcard }) {
  if (!story) return null

  // Deduplicate personal postcards
  const personalPostcards = useMemo(() => {
    const seen = new Set()
    return personalPosts.filter(post => {
      if (post.type !== 'postcard' || !post.image) return false
      const key = `${post.image}|${post.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [personalPosts])

  // Deduplicate personal journals
  const personalJournals = useMemo(() => {
    const seen = new Set()
    return personalPosts.filter(post => {
      if (post.type !== 'journal') return false
      const key = (post.excerpt || post.publicNote || '').trim().toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [personalPosts])

  // Strictly deduplicated public notes: community tips + user notes
  const publicNotes = useMemo(() => {
    const list = []
    const seen = new Set()

    // 1. Community notes
    story.notes.forEach(([author, text]) => {
      const trimmed = text.trim()
      const key = `${author.toLowerCase()}:${trimmed.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ id: `seed-${author}`, author, text: trimmed, isMine: false })
      }
    })

    // 2. Personal notes (deduplicated so duplicate submits never repeat)
    personalPosts.forEach(post => {
      const trimmed = post.publicNote?.trim()
      if (!trimmed) return
      const key = `you:${trimmed.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ id: post.id, author: post.author || 'You', text: trimmed, isMine: true })
      }
    })

    return list
  }, [story.notes, personalPosts])

  return (
    <article className="public-location-blog" aria-live="polite">
      <header className="public-blog-hero">
        <span><MapPin size={14}/> Complete public trip story</span>
        <h2>{story.city}, {story.country}</h2>
        <p>{story.summary}</p>
        <div><strong>{story.dates}</strong><span>{story.travellers}</span><span>Shared by {story.author}</span></div>
      </header>

      <section className="public-blog-section">
        <div className="public-blog-section-title">
          <Camera size={17}/>
          <div>
            <h3>Postcards</h3>
            <p>{story.postcards.length + personalPostcards.length} frames from this trip · Click any postcard to enter in 3D</p>
          </div>
        </div>
        <div className="public-postcard-gallery">
          {story.postcards.map(([title, place, image, note], index) => (
            <figure
              key={`${title}-${index}`}
              className="is-3d-postcard"
              tabIndex={0}
              role="button"
              aria-label={`Step inside ${title} in 3D`}
              onClick={() => onOpen3DPostcard?.({
                title,
                place,
                image,
                note,
                city: story.city,
                country: story.country,
                author: story.author,
                dates: story.dates
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen3DPostcard?.({
                    title,
                    place,
                    image,
                    note,
                    city: story.city,
                    country: story.country,
                    author: story.author,
                    dates: story.dates
                  })
                }
              }}
            >
              <div className="postcard-image-wrap">
                <img src={image} alt={`${title} at ${place}`} loading="lazy"/>
                <span className="postcard-3d-pill">
                  <Sparkles size={11} />
                  <span>3D View</span>
                </span>
              </div>
              <figcaption>
                <small>{place}</small>
                <strong>{title}</strong>
                <p>{note}</p>
                <span className="postcard-3d-action-hint">Click to step inside in 3D →</span>
              </figcaption>
            </figure>
          ))}
          {personalPostcards.map(post => (
            <figure
              key={post.id}
              className="is-personal-post is-3d-postcard"
              tabIndex={0}
              role="button"
              aria-label={`Step inside ${post.title} in 3D`}
              onClick={() => onOpen3DPostcard?.({
                title: post.title,
                place: `${post.city}, ${post.country}`,
                image: post.image,
                note: post.excerpt || post.publicNote,
                city: post.city,
                country: post.country,
                author: 'You',
                dates: post.dates || 'Recent'
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen3DPostcard?.({
                    title: post.title,
                    place: `${post.city}, ${post.country}`,
                    image: post.image,
                    note: post.excerpt || post.publicNote,
                    city: post.city,
                    country: post.country,
                    author: 'You',
                    dates: post.dates || 'Recent'
                  })
                }
              }}
            >
              <div className="postcard-image-wrap">
                <img src={post.image} alt={`${post.title} shared by you`} loading="lazy"/>
                <span className="postcard-3d-pill personal">
                  <Sparkles size={11} />
                  <span>Your 3D Postcard</span>
                </span>
              </div>
              <figcaption>
                <small>Shared by you</small>
                <strong>{post.title}</strong>
                <p>{post.excerpt || post.publicNote}</p>
                <span className="postcard-3d-action-hint">Click to step inside in 3D →</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="public-blog-section spending-story">
        <div className="public-blog-section-title"><DollarSign size={17}/><div><h3>Spending recap</h3><p>Complete group cost breakdown</p></div></div>
        <div className="public-spend-metrics">
          <span><small>Planned</small><strong>{story.spending.currency} {story.spending.planned.toLocaleString()}</strong></span>
          <span><small>Actual</small><strong>{story.spending.currency} {story.spending.actual.toLocaleString()}</strong></span>
          <span className="saved"><small>Saved</small><strong>{story.spending.currency} {(story.spending.planned - story.spending.actual).toLocaleString()}</strong></span>
          <span><small>Per traveller</small><strong>{story.spending.currency} {story.spending.perPerson.toLocaleString()}</strong></span>
        </div>
        <div className="public-category-list">
          {story.spending.categories.map(([name, amount]) => <div key={name}><span>{name}</span><i><b style={{width:`${Math.max(12, amount / story.spending.actual * 100)}%`}}/></i><strong>{story.spending.currency} {amount.toLocaleString()}</strong></div>)}
        </div>
      </section>

      <section className="public-blog-section">
        <div className="public-blog-section-title"><History size={17}/><div><h3>Past trip</h3><p>{story.title}</p></div></div>
        <div className="public-itinerary-list">
          {story.days.map(([day, route]) => <div key={day}><span>{day}</span><p>{route}</p></div>)}
        </div>
      </section>

      <section className="public-blog-section">
        <div className="public-blog-section-title"><FileText size={17}/><div><h3>Trip journal</h3><p>Moments recorded along the way</p></div></div>
        <div className="public-journal-list">
          {story.journal.map(([time, text]) => <blockquote key={time}><small>{time}</small><p>{text}</p></blockquote>)}
          {personalJournals.map(post => (
            <blockquote key={post.id} className="is-personal-journal">
              <small>Your note · {post.time || 'Recent'}</small>
              <p>{post.excerpt || post.publicNote}</p>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="public-blog-section">
        <div className="public-blog-section-title">
          <Users2 size={17}/>
          <div>
            <h3>Public notes</h3>
            <p>Useful details from the people who were there</p>
          </div>
        </div>
        <div className="public-note-list">
          {publicNotes.map(note => (
            <blockquote key={note.id || note.text} className={`public-note-item ${note.isMine ? 'is-mine' : ''}`}>
              <span>{note.author.slice(0, 1)}</span>
              <div className="note-content-wrap">
                <div className="note-author-line">
                  <strong>{note.author}</strong>
                  {note.isMine && <span className="you-pill-tag">Your Note</span>}
                </div>
                <p>{note.text}</p>
              </div>
              {note.isMine && onRemovePersonalPost && (
                <button
                  className="btn-delete-note"
                  onClick={() => onRemovePersonalPost(note.id, note.text)}
                  title="Remove this note"
                  aria-label="Remove note"
                >
                  ✕
                </button>
              )}
            </blockquote>
          ))}
        </div>
      </section>
    </article>
  )
}

export default function MemoryWorld({
  selectedCity, selectedCountry, departureDate, returnDate, travellers,
  initialBudget = 3800, totalActual = 3458, varianceAmount = 342, basket = [], mode = 'browse',
  currentCoinBalance = 0, onEarnCoins, onOpenDashboardGlobe
}) {
  const city = selectedCity?.city || 'Kuala Lumpur'
  const country = selectedCountry?.country || selectedCity?.country || 'Malaysia'
  const lat = Number(selectedCity?.lat) || 3.139
  const lng = Number(selectedCity?.lng) || 101.6869
  const [posts, setPosts] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      // Clean up previous test duplicates from localStorage
      const seen = new Set()
      const cleanStored = []
      for (const p of stored) {
        const key = `${p.type || ''}|${p.city || ''}|${p.country || ''}|${(p.publicNote || '').trim().toLowerCase()}|${(p.title || '').trim().toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          cleanStored.push(p)
        }
      }
      if (cleanStored.length !== stored.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanStored))
      }
      return [...SEED_POSTS, ...cleanStored]
    } catch {
      return SEED_POSTS
    }
  })
  const [selectedLocationKey, setSelectedLocationKey] = useState(`${PUBLIC_LOCATION_STORIES[0].city}-${PUBLIC_LOCATION_STORIES[0].country}`)
  const [selectedTypes, setSelectedTypes] = useState(['postcard', 'spending', 'trip', 'journal'])
  const [note, setNote] = useState('The kind of trip we will keep talking about.')
  const [playing, setPlaying] = useState(true)
  const [rocketLaunching, setRocketLaunching] = useState(false)
  const [publishComplete, setPublishComplete] = useState(false)
  const [selectedPostcard3D, setSelectedPostcard3D] = useState(null)

  const selectedStory = PUBLIC_LOCATION_STORIES.find(story => `${story.city}-${story.country}` === selectedLocationKey) || PUBLIC_LOCATION_STORIES[0]
  const personalPosts = posts.filter(post => post.mine && `${post.city}-${post.country}` === selectedLocationKey)
  const currentMemories = useMemo(() => ({
    postcard: { title: `${city}, saved as a postcard`, excerpt: note || 'A favourite frame from our journey.' },
    spending: { title: `Our ${city} spending recap`, excerpt: `RM ${totalActual.toLocaleString()} spent for ${travellers} travellers · RM ${Math.abs(varianceAmount).toLocaleString()} ${varianceAmount >= 0 ? 'saved' : 'over budget'}.` },
    trip: { title: `${city} · ${departureDate} to ${returnDate}`, excerpt: `${Math.max(6, basket.length)} places remembered${basket.length ? `, including ${basket.slice(0, 2).map(item => item.title || item.name).join(' and ')}` : ''}.` },
    journal: { title: `Notes from ${city}`, excerpt: note || 'A few small moments from the road.' }
  }), [basket, city, departureDate, note, returnDate, totalActual, travellers, varianceAmount])

  const toggleType = type => setSelectedTypes(current => current.includes(type) ? current.filter(item => item !== type) : [...current, type])

  const handleRemovePersonalPost = (postId, noteText) => {
    setPosts(current => {
      const next = current.filter(p => {
        if (!p.mine) return true
        if (postId && p.id === postId) return false
        if (noteText && p.publicNote && p.publicNote.trim().toLowerCase() === noteText.trim().toLowerCase()) return false
        return true
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.filter(p => p.mine)))
      return next
    })
  }

  const publish = () => {
    if (!selectedTypes.length) return
    const now = Date.now()

    // Only attach publicNote to one post (journal or first selected) to avoid 4x duplication
    const newPosts = selectedTypes.map((type, index) => {
      const isNoteCarrier = type === 'journal' || (!selectedTypes.includes('journal') && index === 0)
      return {
        id: `mine-${now}-${type}`,
        type,
        city,
        country,
        lat: lat + index * 0.08,
        lng: lng + index * 0.08,
        author: 'You',
        title: currentMemories[type].title,
        excerpt: currentMemories[type].excerpt,
        publicNote: isNoteCarrier && note?.trim() ? note.trim() : undefined,
        image: type === 'postcard' ? selectedCity?.heroImage || selectedCity?.image || basket.find(item => item.image)?.image : undefined,
        time: 'Just now',
        mine: true
      }
    })

    // If publishing again for the same city, replace previous personal posts of the same types
    const existingOtherPosts = posts.filter(p => !(p.mine && p.city === city && p.country === country && selectedTypes.includes(p.type)))
    const next = [...newPosts, ...existingOtherPosts]

    setPosts(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.filter(post => post.mine)))
    onEarnCoins?.(5)
    setPublishComplete(true)
    setRocketLaunching(false)
    window.requestAnimationFrame(() => setRocketLaunching(true))
    window.setTimeout(() => setRocketLaunching(false), 1800)
  }

  if (mode === 'publish' && publishComplete) return (
    <section className="memory-world memory-publish-world memory-publish-celebration" aria-labelledby="publish-congratulations-title">
      {rocketLaunching && (
        <div className="publish-rocket-flight" aria-hidden="true">
          <span className="rocket-spark spark-one"/><span className="rocket-spark spark-two"/><span className="rocket-spark spark-three"/>
          <span className="rocket-trail"/><span className="rocket-craft"><Rocket size={34}/></span>
        </div>
      )}
      <div className="publish-congrats-card">
        <div className="celebration-burst" aria-hidden="true">{Array.from({length:8}).map((_,index) => <i key={index}/>)}</div>
        <span className="publish-complete-badge"><Check size={15}/> Published successfully</span>
        <div className="celebration-coin"><Coins size={44}/><span>+5</span></div>
        <h2 id="publish-congratulations-title">Congratulations!</h2>
        <p>You have published {selectedTypes.length} {selectedTypes.length === 1 ? 'memory' : 'memories'} from <strong>{city}</strong> and earned <strong>5 Trip Coins.</strong></p>
        <div className="celebration-balance"><span>New coin balance</span><strong><Coins size={18}/>{currentCoinBalance}</strong></div>
        <div className="celebration-actions">
          <button className="memory-publish-button" onClick={onOpenDashboardGlobe}><Globe2 size={16}/> View on Dashboard Globe</button>
          <button className="publish-again-button" onClick={() => setPublishComplete(false)}>Publish more memories</button>
        </div>
      </div>
    </section>
  )

  if (mode === 'publish') return (
    <section className="memory-world memory-publish-world" aria-labelledby="memory-world-title">
      {rocketLaunching && (
        <div className="publish-rocket-flight" aria-hidden="true">
          <span className="rocket-spark spark-one"/>
          <span className="rocket-spark spark-two"/>
          <span className="rocket-spark spark-three"/>
          <span className="rocket-trail"/>
          <span className="rocket-craft"><Rocket size={34}/></span>
        </div>
      )}
      <header className="memory-world-header">
        <div>
          <span className="memory-world-kicker"><Send size={15}/> Publish your memories</span>
          <h2 id="memory-world-title">Choose what you want to share.</h2>
          <p>Select your postcard, spending recap, past trip and trip journal, then add a public note for travellers who find {city}.</p>
        </div>
        <div className="memory-world-count"><MapPin size={17}/><strong>{city}</strong><span>{country}</span></div>
      </header>
      <div className="memory-publish-workspace">
        <aside className="memory-publish-panel">
          <div className="publish-panel-heading">
            <span className="publish-location-icon"><MapPin size={18}/></span>
            <div><h3>Publish from {city}</h3><p>Choose what appears at this location.</p></div>
          </div>
          <div className="memory-type-list">
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const Icon = meta.icon
              const checked = selectedTypes.includes(type)
              return (
                <button key={type} className={`memory-type-choice ${checked ? 'selected' : ''}`} onClick={() => toggleType(type)} aria-pressed={checked}>
                  <span className="memory-type-icon" style={{ '--memory-color': meta.color }}><Icon size={17}/></span>
                  <span><strong>{meta.label}</strong><small>{currentMemories[type].title}</small></span>
                  <span className="memory-choice-check">{checked && <Check size={14}/>}</span>
                </button>
              )
            })}
          </div>
          <label className="memory-note-field">
            <span>Public note</span>
            <textarea value={note} onChange={event => setNote(event.target.value)} maxLength={160} rows={3}/>
            <small>{note.length}/160</small>
          </label>
          <div className="publish-privacy"><Globe2 size={14}/><span>Visible to everyone on the public globe</span></div>
          <button className="memory-publish-button" onClick={publish} disabled={!selectedTypes.length}>
            <Send size={16}/> Publish {selectedTypes.length || ''} {selectedTypes.length === 1 ? 'memory' : 'memories'}
          </button>
        </aside>
      </div>
    </section>
  )

  return (
    <section className="memory-world public-memory-explorer" aria-labelledby="memory-world-title">
      <header className="memory-world-header">
        <div>
          <span className="memory-world-kicker"><Globe2 size={15}/> Public travel stories</span>
          <h2 id="memory-world-title">Travel the world through complete trip stories.</h2>
          <p>Select a location on the planet to read its postcards, full spending recap, past itinerary, journal and public notes.</p>
        </div>
        <div className="memory-world-count"><Users2 size={17}/><strong>{posts.length}</strong><span>public memories</span></div>
      </header>
      <nav className="public-location-filter" aria-label="Public story locations">
        {PUBLIC_LOCATION_STORIES.map(story => {
          const key = `${story.city}-${story.country}`
          return <button key={key} className={selectedLocationKey === key ? 'active' : ''} onClick={() => setSelectedLocationKey(key)}><MapPin size={13}/><span>{story.city}</span><small>{story.postcards.length} postcards</small></button>
        })}
      </nav>
      <div className="public-globe-blog-layout">
        <div className="memory-world-visual">
          <MemoryGlobe posts={posts} onSelect={setSelectedLocationKey} playing={playing} onTogglePlaying={() => setPlaying(value => !value)} />
        </div>
        <LocationBlog
          story={selectedStory}
          personalPosts={personalPosts}
          onRemovePersonalPost={handleRemovePersonalPost}
          onOpen3DPostcard={setSelectedPostcard3D}
        />
      </div>

      {selectedPostcard3D && (
        <LyraSpatialMemoryModal
          postcard={selectedPostcard3D}
          onClose={() => setSelectedPostcard3D(null)}
        />
      )}
    </section>
  )
}
