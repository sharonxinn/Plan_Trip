import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Camera, Sparkles, Share2, Download, Copy,
  MapPin, Calendar, Heart, MessageCircle, RefreshCw,
  Image as ImageIcon, Upload, Check, Wand2, Type,
  Palette, Compass, CheckCircle2, ChevronRight, Award,
  Flame, Sun, CloudRain, Star, X, ArrowLeft
} from 'lucide-react'

// Custom Instagram Icon SVG
function Instagram({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

// Preset Slogan Categories
const SLOGAN_PRESETS = {
  vibes: [
    'Living my best life in paradise! ✨🌴',
    'Collecting moments, not things. 📸✈️',
    'Escape the ordinary, discover the extraordinary. 🗺️',
    'Chasing sunsets and unforgettable memories. 🌅💫',
    'Found my new favorite corner of the world. 🌍💖'
  ],
  food: [
    '99% Local Food, 1% Human. 🍜🔥',
    'Diet starts tomorrow, food trip starts NOW! 😋🥢',
    'Aromatic White Coffee in my veins. ☕✨',
    'Happiness is a warm plate of local cuisine. 🦐🍲',
    'Eating my way through every street market! 🥟🍢'
  ],
  culture: [
    'Lost in the limestone caves and heritage alleys. 🏛️🌿',
    'History whispered in every cobblestone street. 🏮✨',
    'In awe of the ancient rainforests & majestic sights. 🦧🌳',
    'Where tradition meets modern wonder. 🕌💫',
    'Treasured heritage and timeless stories. 📜✨'
  ],
  squad: [
    'Good vibes and unforgettable squad adventures! 👯‍♂️🎉',
    'Friends who travel together, stay together! 🚗💨',
    'Making memories we will talk about for decades. 🥂✨',
    'Best travel crew in the world! 🌟🙌'
  ]
}

// 5 Aesthetic Postcard Themes
const THEMES = [
  {
    id: 'glass-dark',
    name: 'Cyber Sapphire',
    tag: 'Modern Glass',
    accent: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, #070d18 0%, #0f2744 50%, #030712 100%)',
    textColor: '#ffffff',
    subColor: '#94a3b8'
  },
  {
    id: 'vintage-airmail',
    name: 'Vintage Airmail',
    tag: 'Classic Postcard',
    accent: '#dc2626',
    bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    textColor: '#1e293b',
    subColor: '#64748b'
  },
  {
    id: 'polaroid',
    name: 'Polaroid Instant',
    tag: 'Retro Film',
    accent: '#f59e0b',
    bgGradient: '#ffffff',
    textColor: '#0f172a',
    subColor: '#475569'
  },
  {
    id: 'vogue-magazine',
    name: 'Editorial Vogue',
    tag: 'Chic Aesthetic',
    accent: '#f43f5e',
    bgGradient: '#0a0a0a',
    textColor: '#ffffff',
    subColor: '#cbd5e1'
  },
  {
    id: 'cute-pastel',
    name: 'Sweet Pastel',
    tag: 'Kawaii Vibe',
    accent: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #fbcfe8 0%, #ede9fe 50%, #bae6fd 100%)',
    textColor: '#1e1b4b',
    subColor: '#4338ca'
  }
]

// Photo Filters
const PHOTO_FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'warm', label: 'Warm Sun 🌅', css: 'sepia(0.2) saturate(1.3) brightness(1.05)' },
  { id: 'vintage', label: 'Vintage 🎞️', css: 'sepia(0.4) contrast(1.1) brightness(0.95)' },
  { id: 'cinematic', label: 'Teal & Orange 🎨', css: 'contrast(1.2) saturate(1.25) hue-rotate(-10deg)' },
  { id: 'vivid', label: 'Vivid Glow ✨', css: 'saturate(1.45) contrast(1.1) brightness(1.05)' }
]

// Stamp Badges
const STAMPS = [
  { id: 'passport', label: '🛂 PASSPORT CONTROL - ENTRY PERMIT' },
  { id: 'google', label: '⭐ 4.9 GOOGLE REVIEW VERIFIED' },
  { id: 'explorer', label: '🧭 VERIFIED EXPLORER CHECK-IN' },
  { id: 'foodie', label: '🔥 TOP FOODIE MUST-EAT SPOT' },
  { id: 'memory', label: '💖 FOREVER TRAVEL MEMORY' }
]

export default function PostcardCheckinPage({
  selectedCity,
  basket = [],
  initialSpot = null,
  onBackToExplore,
  travellers = 2,
  travelParty = 'family'
}) {
  // Available check-in spots
  const availableSpots = useMemo(() => {
    const list = []
    if (selectedCity?.attractions) {
      selectedCity.attractions.forEach(a => list.push({ ...a, source: 'Attraction' }))
    }
    if (selectedCity?.restaurants) {
      selectedCity.restaurants.forEach(r => list.push({ ...r, source: 'Dining' }))
    }
    if (basket && basket.length > 0) {
      basket.forEach(b => {
        if (!list.some(item => item.name === b.name)) {
          list.push({ ...b, source: 'Basket' })
        }
      })
    }
    return list
  }, [selectedCity, basket])

  // Selected Spot
  const [selectedSpot, setSelectedSpot] = useState(() => {
    if (initialSpot) return initialSpot
    if (availableSpots.length > 0) return availableSpots[0]
    return {
      name: `${selectedCity?.city || 'Kuala Lumpur'} Landmark`,
      address: `${selectedCity?.city || 'Kuala Lumpur'}, Malaysia`,
      rating: 4.9,
      reviewsCount: 24500,
      image: selectedCity?.heroImage || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=80'
    }
  })

  // Postcard Customization States
  const [customLocationName, setCustomLocationName] = useState(selectedSpot?.name || '')
  const [customAddress, setCustomAddress] = useState(selectedSpot?.address || `${selectedCity?.city || 'Kuala Lumpur'}`)
  const [selectedTheme, setSelectedTheme] = useState('glass-dark')
  const [sloganCategory, setSloganCategory] = useState('vibes')
  const [sloganText, setSloganText] = useState('Living my best life in paradise! ✨🌴')
  const [authorTag, setAuthorTag] = useState('@travel_explorer')
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0])
  const [temperature, setTemperature] = useState('29°C')
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [selectedStamp, setSelectedStamp] = useState('passport')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [exportSuccessMsg, setExportSuccessMsg] = useState('')
  const [postcardModalOpen, setPostcardModalOpen] = useState(false)
  const [generatedDataUrl, setGeneratedDataUrl] = useState(null)

  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Sync selectedSpot changes
  useEffect(() => {
    if (selectedSpot) {
      setCustomLocationName(selectedSpot.name)
      if (selectedSpot.address) setCustomAddress(selectedSpot.address)
      if (selectedSpot.image) setUploadedImage(null)
    }
  }, [selectedSpot])

  // Active Photo URL
  const activePhotoUrl = uploadedImage || selectedSpot?.image || selectedCity?.heroImage || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=80'

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Random Slogan Pick
  const handlePickRandomSlogan = () => {
    const list = SLOGAN_PRESETS[sloganCategory] || SLOGAN_PRESETS.vibes
    const random = list[Math.floor(Math.random() * list.length)]
    setSloganText(random)
  }

  // 1-Click AI Randomize All (Spot, Slogan, Theme, Stamp)
  const handleRandomizeAll = () => {
    if (availableSpots.length > 0) {
      const randomSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)]
      setSelectedSpot(randomSpot)
    }
    const cats = Object.keys(SLOGAN_PRESETS)
    const randomCat = cats[Math.floor(Math.random() * cats.length)]
    setSloganCategory(randomCat)
    const slogans = SLOGAN_PRESETS[randomCat]
    setSloganText(slogans[Math.floor(Math.random() * slogans.length)])

    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)].id
    setSelectedTheme(randomTheme)

    const randomStamp = STAMPS[Math.floor(Math.random() * STAMPS.length)].id
    setSelectedStamp(randomStamp)

    setExportSuccessMsg('🎲 AI Random Postcard created! Check the preview.')
    setTimeout(() => setExportSuccessMsg(''), 3000)
  }

  // Helper: Draw Aspect Cover on Canvas
  const drawAspectCover = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height
    const targetRatio = w / h
    let sx, sy, sw, sh

    if (imgRatio > targetRatio) {
      sh = img.height
      sw = img.height * targetRatio
      sx = (img.width - sw) / 2
      sy = 0
    } else {
      sw = img.width
      sh = img.width / targetRatio
      sx = 0
      sy = (img.height - sh) / 2
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  }

  // Helper: Draw Rounded Rect
  const drawRoundedRect = (ctx, x, y, width, height, radius, fill, stroke) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    if (fill) ctx.fill()
    if (stroke) ctx.stroke()
  }

  // Helper: Wrap Text on Canvas
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let currY = y

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currY)
        line = words[n] + ' '
        currY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currY)
  }

  // Draw Postcard onto Canvas (1080 x 1920 high-res Instagram Story)
  const renderCanvasPostcard = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current || document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const width = 1080
      const height = 1920
      canvas.width = width
      canvas.height = height

      const theme = THEMES.find(t => t.id === selectedTheme) || THEMES[0]

      // 1. Background
      if (theme.id === 'glass-dark') {
        const grad = ctx.createLinearGradient(0, 0, width, height)
        grad.addColorStop(0, '#030814')
        grad.addColorStop(0.3, '#0c1a30')
        grad.addColorStop(0.7, '#07101f')
        grad.addColorStop(1, '#02050b')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      } else if (theme.id === 'vintage-airmail') {
        ctx.fillStyle = '#faf5e8'
        ctx.fillRect(0, 0, width, height)

        const stripeSize = 40
        ctx.save()
        for (let i = 0; i < width + height; i += stripeSize * 2) {
          ctx.fillStyle = '#ef4444'
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i + stripeSize, 0)
          ctx.lineTo(0, i + stripeSize)
          ctx.lineTo(0, i)
          ctx.fill()

          ctx.fillStyle = '#2563eb'
          ctx.beginPath()
          ctx.moveTo(i + stripeSize, 0)
          ctx.lineTo(i + stripeSize * 2, 0)
          ctx.lineTo(0, i + stripeSize * 2)
          ctx.lineTo(0, i + stripeSize)
          ctx.fill()
        }
        ctx.restore()
        ctx.fillStyle = '#faf5e8'
        ctx.fillRect(24, 24, width - 48, height - 48)
      } else if (theme.id === 'polaroid') {
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, width, height)
      } else if (theme.id === 'vogue-magazine') {
        ctx.fillStyle = '#050505'
        ctx.fillRect(0, 0, width, height)
      } else if (theme.id === 'cute-pastel') {
        const grad = ctx.createLinearGradient(0, 0, width, height)
        grad.addColorStop(0, '#fbcfe8')
        grad.addColorStop(0.5, '#ede9fe')
        grad.addColorStop(1, '#bae6fd')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      }

      // 2. Load and Draw Main Photo
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.save()

        if (theme.id === 'glass-dark') {
          const photoX = 60
          const photoY = 180
          const photoW = 960
          const photoH = 1050
          const radius = 40

          ctx.beginPath()
          ctx.moveTo(photoX + radius, photoY)
          ctx.lineTo(photoX + photoW - radius, photoY)
          ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + radius)
          ctx.lineTo(photoX + photoW, photoY + photoH - radius)
          ctx.quadraticCurveTo(photoX + photoW, photoY + photoH, photoX + photoW - radius, photoY + photoH)
          ctx.lineTo(photoX + radius, photoY + photoH)
          ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - radius)
          ctx.lineTo(photoX, photoY + radius)
          ctx.quadraticCurveTo(photoX, photoY, photoX + radius, photoY)
          ctx.closePath()
          ctx.clip()

          drawAspectCover(ctx, img, photoX, photoY, photoW, photoH)
          ctx.restore()

          // Glass overlay
          const ovGrad = ctx.createLinearGradient(60, 1000, 60, 1230)
          ovGrad.addColorStop(0, 'rgba(3, 8, 20, 0)')
          ovGrad.addColorStop(1, 'rgba(3, 8, 20, 0.95)')
          ctx.fillStyle = ovGrad
          ctx.fillRect(60, 950, 960, 280)

          // Top Header Branding
          ctx.fillStyle = '#38bdf8'
          ctx.font = 'bold 36px Outfit, sans-serif'
          ctx.fillText('PLANTRIP TRAVEL POSTCARD', 60, 120)

          ctx.fillStyle = '#94a3b8'
          ctx.font = '28px "Plus Jakarta Sans", sans-serif'
          ctx.fillText(`${selectedCity?.city || 'Kuala Lumpur'}, ${selectedCity?.country || 'Malaysia'} · LIVE CHECK-IN`, 60, 155)

          // Weather & Date Tag top right
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
          drawRoundedRect(ctx, width - 360, 80, 300, 65, 20, true, false)
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif'
          ctx.fillText(`📅 ${travelDate} · ${temperature}`, width - 340, 122)

          // Slogan & Info Glass Box Bottom
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
          ctx.lineWidth = 3
          drawRoundedRect(ctx, 60, 1280, 960, 560, 36, true, true)

          // Slogan Text
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 54px Outfit, sans-serif'
          wrapText(ctx, `“${sloganText}”`, 110, 1380, 860, 68)

          // Spot Name & Location
          ctx.fillStyle = '#38bdf8'
          ctx.font = 'bold 44px Outfit, sans-serif'
          ctx.fillText(`📍 ${customLocationName}`, 110, 1600)

          ctx.fillStyle = '#94a3b8'
          ctx.font = '30px "Plus Jakarta Sans", sans-serif'
          ctx.fillText(customAddress, 110, 1650)

          // Stamp badge
          const stampObj = STAMPS.find(s => s.id === selectedStamp) || STAMPS[0]
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 2
          drawRoundedRect(ctx, 110, 1700, 480, 60, 30, true, true)
          ctx.fillStyle = '#38bdf8'
          ctx.font = 'bold 24px Outfit, sans-serif'
          ctx.fillText(stampObj.label, 135, 1738)

          // Author Tag bottom right
          ctx.fillStyle = '#f8fafc'
          ctx.font = 'bold 32px Outfit, sans-serif'
          ctx.fillText(authorTag, width - 380, 1740)

          ctx.fillStyle = '#64748b'
          ctx.font = '24px "Plus Jakarta Sans", sans-serif'
          ctx.fillText('STORY BY PLANTRIP AI', width - 380, 1775)
        } else if (theme.id === 'vintage-airmail') {
          const photoX = 80
          const photoY = 160
          const photoW = 920
          const photoH = 960
          drawAspectCover(ctx, img, photoX, photoY, photoW, photoH)

          ctx.fillStyle = '#dc2626'
          drawRoundedRect(ctx, width - 260, 180, 160, 190, 8, true, false)
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 22px Outfit, sans-serif'
          ctx.fillText('POSTAGE', width - 235, 220)
          ctx.fillText('AIRMAIL', width - 235, 250)
          ctx.font = 'bold 36px Outfit, sans-serif'
          ctx.fillText('RM 2.50', width - 245, 330)

          ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)'
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.arc(width - 340, 270, 75, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'
          ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif'
          ctx.fillText(selectedCity?.city?.toUpperCase() || 'KUALA LUMPUR', width - 400, 260)
          ctx.fillText(travelDate, width - 380, 290)

          ctx.fillStyle = '#1e293b'
          ctx.font = 'italic bold 52px Georgia, serif'
          wrapText(ctx, `“${sloganText}”`, 100, 1220, 880, 68)

          ctx.fillStyle = '#dc2626'
          ctx.font = 'bold 42px Outfit, sans-serif'
          ctx.fillText(`📍 ${customLocationName}`, 100, 1460)

          ctx.fillStyle = '#475569'
          ctx.font = '30px Georgia, serif'
          ctx.fillText(`Recorded in ${customAddress} · ${temperature}`, 100, 1520)

          ctx.strokeStyle = '#cbd5e1'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(100, 1580)
          ctx.lineTo(width - 100, 1580)
          ctx.stroke()

          ctx.fillStyle = '#1e293b'
          ctx.font = 'bold 32px Georgia, serif'
          ctx.fillText(`From: ${authorTag}`, 100, 1660)
          ctx.fillText(`To: Instagram Story World ✨`, 100, 1720)
        } else if (theme.id === 'polaroid') {
          const cardX = 80
          const cardY = 120
          const cardW = 920
          const cardH = 1680

          ctx.fillStyle = '#ffffff'
          drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 20, true, false)

          const photoX = 130
          const photoY = 170
          const photoW = 820
          const photoH = 1080
          drawAspectCover(ctx, img, photoX, photoY, photoW, photoH)

          ctx.fillStyle = '#0f172a'
          ctx.font = 'bold 50px "Comic Sans MS", "Outfit", cursive, sans-serif'
          wrapText(ctx, sloganText, 140, 1370, 800, 64)

          ctx.fillStyle = '#f59e0b'
          ctx.font = 'bold 44px Outfit, sans-serif'
          ctx.fillText(`📍 ${customLocationName}`, 140, 1560)

          ctx.fillStyle = '#64748b'
          ctx.font = '30px "Plus Jakarta Sans", sans-serif'
          ctx.fillText(`${customAddress} · ${travelDate}`, 140, 1620)

          ctx.fillStyle = '#0f172a'
          ctx.font = 'bold 36px Outfit, sans-serif'
          ctx.fillText(`✨ ${authorTag}`, width - 420, 1720)
        } else {
          const photoX = 60
          const photoY = 120
          const photoW = 960
          const photoH = 1200
          drawAspectCover(ctx, img, photoX, photoY, photoW, photoH)

          ctx.fillStyle = theme.textColor
          ctx.font = '900 84px "Times New Roman", Georgia, serif'
          ctx.fillText('TRAVELER', 80, 220)

          ctx.fillStyle = theme.textColor
          ctx.font = 'bold 52px Outfit, sans-serif'
          wrapText(ctx, `“${sloganText}”`, 80, 1450, 920, 68)

          ctx.fillStyle = theme.accent
          ctx.font = 'bold 44px Outfit, sans-serif'
          ctx.fillText(`📍 ${customLocationName}`, 80, 1650)

          ctx.fillStyle = theme.subColor
          ctx.font = '30px "Plus Jakarta Sans", sans-serif'
          ctx.fillText(`${customAddress} · ${travelDate} · ${authorTag}`, 80, 1710)
        }

        resolve(canvas)
      }

      img.onerror = () => {
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(80, 180, 920, 1000)
        resolve(canvas)
      }

      img.src = activePhotoUrl
    })
  }

  // 0. Primary Action: Generate Postcard & Open Modal Showcase
  const handleGeneratePostcard = async () => {
    setIsGenerating(true)
    const canvas = await renderCanvasPostcard()
    const dataUrl = canvas.toDataURL('image/png', 1.0)
    setGeneratedDataUrl(dataUrl)
    setIsGenerating(false)
    setPostcardModalOpen(true)
    setExportSuccessMsg('✨ E-Postcard Generated Successfully!')
    setTimeout(() => setExportSuccessMsg(''), 4000)
  }

  // 1. Download HD Postcard
  const handleDownloadHD = async () => {
    setIsGenerating(true)
    const canvas = await renderCanvasPostcard()
    const link = document.createElement('a')
    link.download = `PlanTrip_Postcard_${customLocationName.replace(/\s+/g, '_')}_${travelDate}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
    setIsGenerating(false)
    setExportSuccessMsg('✅ HD Story Postcard Downloaded! Ready to upload to Instagram.')
    setTimeout(() => setExportSuccessMsg(''), 4000)
  }

  // 2. Share directly to Instagram Story
  const handleShareInstagramStory = async () => {
    setIsGenerating(true)
    const canvas = await renderCanvasPostcard()

    canvas.toBlob(async (blob) => {
      if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'story.png', { type: 'image/png' })] })) {
        try {
          const file = new File([blob], `PlanTrip_${customLocationName}.png`, { type: 'image/png' })
          await navigator.share({
            title: `📍 Check-in at ${customLocationName}!`,
            text: `${sloganText} #PlanTrip #${customLocationName.replace(/\s+/g, '')} #TravelMalaysia`,
            files: [file]
          })
          setIsGenerating(false)
          setExportSuccessMsg('🎉 Successfully shared to Instagram Story!')
          setTimeout(() => setExportSuccessMsg(''), 4000)
          return
        } catch (_err) {}
      }

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setExportSuccessMsg('📋 Postcard copied to clipboard! Opening Instagram...')
        } else {
          const link = document.createElement('a')
          link.download = `PlanTrip_IG_Story.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          setExportSuccessMsg('📥 Story downloaded! Opening Instagram...')
        }
      } catch (_e) {}

      setIsGenerating(false)
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank')
      }, 800)
    }, 'image/png', 1.0)
  }

  // 3. Copy Image to Clipboard
  const handleCopyClipboard = async () => {
    setIsGenerating(true)
    const canvas = await renderCanvasPostcard()
    canvas.toBlob(async (blob) => {
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setExportSuccessMsg('📋 Postcard image copied! You can paste directly into IG Story Stickers.')
        } else {
          setExportSuccessMsg('⚠️ Clipboard direct copy not supported on this browser. Click Download instead!')
        }
      } catch (_e) {
        setExportSuccessMsg('⚠️ Please use Download HD button for this browser.')
      }
      setIsGenerating(false)
      setTimeout(() => setExportSuccessMsg(''), 4000)
    })
  }

  return (
    <div className="postcard-page-container">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="container postcard-layout-grid">
        {/* =========================================================================
            LEFT COLUMN: INTERACTIVE POSTCARD CONTROLS & CHECK-IN CUSTOMIZER
            ========================================================================= */}
        <div className="postcard-controls-panel">
          {/* Header Banner */}
          <div className="postcard-panel-header">
            <div className="panel-tag-row">
              <span className="pill-badge-hot">📸 Live Check-in</span>
              <span className="pill-badge-sub">Instagram Story Creator</span>
              {onBackToExplore && (
                <button className="btn-back-link" onClick={onBackToExplore}>
                  <ArrowLeft size={13} />
                  <span>Back to Explore</span>
                </button>
              )}
            </div>
            <h2>E-Postcard Studio</h2>
            <p>Check-in at verified spots, customize travel slogans, and export high-res 9:16 Instagram Stories!</p>
          </div>

          {exportSuccessMsg && (
            <div className="success-toast-banner">
              <span>{exportSuccessMsg}</span>
            </div>
          )}

          {/* STEP 1: CHOOSE CHECK-IN SPOT */}
          <div className="studio-card-section">
            <div className="section-title-row">
              <span className="step-badge">1</span>
              <h3>Choose Check-in Spot</h3>
            </div>

            {/* Spots Selector Carousel */}
            <div className="spots-picker-row">
              {availableSpots.slice(0, 8).map((spot, idx) => {
                const isSelected = selectedSpot?.name === spot.name
                return (
                  <button
                    key={spot.id || idx}
                    className={`spot-chip-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <span className="chip-img-thumb" style={{ backgroundImage: `url(${spot.image})` }} />
                    <span className="chip-name">{spot.name}</span>
                    {isSelected && <Check size={12} className="chip-check" />}
                  </button>
                )
              })}
            </div>

            {/* Custom Location Inputs */}
            <div className="custom-input-grid">
              <div className="form-group">
                <label>Location / Spot Title</label>
                <div className="input-with-icon">
                  <MapPin size={15} />
                  <input
                    type="text"
                    value={customLocationName}
                    onChange={e => setCustomLocationName(e.target.value)}
                    placeholder="e.g. Petronas Twin Towers, Kek Lok Tong..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address / City Region</label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={e => setCustomAddress(e.target.value)}
                  placeholder="e.g. Kuala Lumpur, Malaysia"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: PHOTO SELECTION & FILTERS */}
          <div className="studio-card-section">
            <div className="section-title-row">
              <span className="step-badge">2</span>
              <h3>Photo & Visual Filter</h3>
            </div>

            <div className="photo-actions-row">
              <button
                className="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>Upload My Own Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />

              {uploadedImage && (
                <button
                  className="btn-reset-photo"
                  onClick={() => setUploadedImage(null)}
                  title="Reset to spot preset photo"
                >
                  <X size={14} />
                  <span>Use Default Spot Photo</span>
                </button>
              )}
            </div>

            {/* Filter selection pills */}
            <div className="filter-pills-row">
              {PHOTO_FILTERS.map(f => (
                <button
                  key={f.id}
                  className={`filter-pill ${selectedFilter === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: SLOGAN & TRAVEL QUOTE GENERATOR */}
          <div className="studio-card-section">
            <div className="section-title-row">
              <div className="flex-title">
                <span className="step-badge">3</span>
                <h3>Travel Slogan & Caption</h3>
              </div>
              <button className="btn-random-slogan" onClick={handlePickRandomSlogan}>
                <Wand2 size={13} />
                <span>AI Random Slogan</span>
              </button>
            </div>

            {/* Slogan Category Tabs */}
            <div className="slogan-cat-tabs">
              {[
                { id: 'vibes', label: '🌴 Travel Vibes' },
                { id: 'food', label: '🍜 Foodie' },
                { id: 'culture', label: '🏛️ Culture' },
                { id: 'squad', label: '👯 Squad' }
              ].map(cat => (
                <button
                  key={cat.id}
                  className={`slogan-tab-btn ${sloganCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setSloganCategory(cat.id)
                    const list = SLOGAN_PRESETS[cat.id]
                    setSloganText(list[0])
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Slogan Presets Grid */}
            <div className="slogan-presets-list">
              {(SLOGAN_PRESETS[sloganCategory] || []).map((s, idx) => (
                <button
                  key={idx}
                  className={`slogan-item-pill ${sloganText === s ? 'active' : ''}`}
                  onClick={() => setSloganText(s)}
                >
                  <span>{s}</span>
                </button>
              ))}
            </div>

            {/* Custom Slogan Textarea */}
            <div className="form-group mt-3">
              <label>Edit Your Custom Slogan</label>
              <textarea
                className="slogan-custom-textarea"
                rows="2"
                value={sloganText}
                onChange={e => setSloganText(e.target.value)}
                maxLength={120}
                placeholder="Write your personal travel quote here..."
              />
            </div>
          </div>

          {/* STEP 4: THEME, STAMP & METADATA */}
          <div className="studio-card-section">
            <div className="section-title-row">
              <span className="step-badge">4</span>
              <h3>Postcard Theme & Stamps</h3>
            </div>

            {/* Themes Grid */}
            <div className="themes-selector-grid">
              {THEMES.map(th => {
                const isSelected = selectedTheme === th.id
                return (
                  <button
                    key={th.id}
                    className={`theme-card-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedTheme(th.id)}
                  >
                    <div className="theme-color-dot" style={{ background: th.accent }} />
                    <div className="theme-meta">
                      <strong>{th.name}</strong>
                      <small>{th.tag}</small>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Stamp Badges */}
            <div className="form-group mt-3">
              <label>Passport Stamp Badge</label>
              <div className="stamps-scroll-row">
                {STAMPS.map(st => (
                  <button
                    key={st.id}
                    className={`stamp-chip ${selectedStamp === st.id ? 'active' : ''}`}
                    onClick={() => setSelectedStamp(st.id)}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Author Handle & Date */}
            <div className="meta-inputs-row">
              <div className="form-group">
                <label>Instagram Handle / Author</label>
                <input
                  type="text"
                  value={authorTag}
                  onChange={e => setAuthorTag(e.target.value)}
                  placeholder="@your_instagram_handle"
                />
              </div>

              <div className="form-group">
                <label>Date Stamp</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={e => setTravelDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* PROMINENT PRIMARY GENERATE POSTCARD BUTTON BOX */}
          <div className="studio-generate-action-box">
            <button
              className="btn-main-generate-postcard"
              onClick={handleGeneratePostcard}
              disabled={isGenerating}
            >
              <Sparkles size={22} className="sparkle-spin" />
              <span>{isGenerating ? 'Rendering HD Postcard...' : '✨ Generate Postcard'}</span>
            </button>

            <div className="generate-quick-row">
              <button
                className="btn-generate-sub"
                onClick={handleShareInstagramStory}
                disabled={isGenerating}
              >
                <Instagram size={16} />
                <span>Share to IG Story</span>
              </button>

              <button
                className="btn-generate-sub"
                onClick={handleDownloadHD}
                disabled={isGenerating}
              >
                <Download size={16} />
                <span>Download HD</span>
              </button>

              <button
                className="btn-generate-sub-random"
                onClick={handleRandomizeAll}
                title="AI Randomize Spot, Slogan & Theme"
              >
                <Wand2 size={15} />
                <span>AI Randomize</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: REAL-TIME 9:16 INSTAGRAM STORY LIVE PREVIEW & EXPORT
            ========================================================================= */}
        <div className="postcard-preview-panel">
          <div className="preview-sticky-wrap">
            <div className="preview-header-bar">
              <div className="preview-title">
                <Instagram size={18} className="text-pink" />
                <span>Instagram Story 9:16 Preview</span>
              </div>
              <span className="live-render-tag">1080 × 1920 HD</span>
            </div>

            {/* 9:16 INSTAGRAM STORY CANVAS FRAME */}
            <div className={`ig-story-frame theme-${selectedTheme}`}>
              <div className="story-content-wrapper">
                {/* Background Layer */}
                <div
                  className="story-bg-layer"
                  style={{
                    backgroundImage: selectedTheme === 'polaroid' ? 'none' : `url(${activePhotoUrl})`,
                    filter: PHOTO_FILTERS.find(f => f.id === selectedFilter)?.css || 'none'
                  }}
                />

                <div className="story-overlay-gradient" />

                {/* Top Status Bar in Story */}
                <div className="story-top-badge-row">
                  <div className="story-brand-tag">
                    <span className="dot-live" />
                    <strong>PLANTRIP AI</strong>
                  </div>
                  <div className="story-date-weather">
                    <span>📅 {travelDate}</span>
                    <span>·</span>
                    <span>{temperature}</span>
                  </div>
                </div>

                {/* Theme-Specific Inner Content */}
                {selectedTheme === 'polaroid' ? (
                  <div className="polaroid-inner-card">
                    <div
                      className="polaroid-photo-box"
                      style={{
                        backgroundImage: `url(${activePhotoUrl})`,
                        filter: PHOTO_FILTERS.find(f => f.id === selectedFilter)?.css || 'none'
                      }}
                    />
                    <div className="polaroid-caption-area">
                      <p className="polaroid-quote">“{sloganText}”</p>
                      <h4 className="polaroid-spot">📍 {customLocationName}</h4>
                      <div className="polaroid-footer">
                        <small>{customAddress}</small>
                        <span className="polaroid-author">{authorTag}</span>
                      </div>
                    </div>
                  </div>
                ) : selectedTheme === 'vintage-airmail' ? (
                  <div className="airmail-inner-card">
                    <div className="airmail-stamp-badge">
                      <span className="stamp-text">AIRMAIL</span>
                      <span className="stamp-val">RM 2.50</span>
                    </div>
                    <div className="airmail-postmark">
                      <span>{selectedCity?.city?.toUpperCase() || 'KUALA LUMPUR'}</span>
                      <small>{travelDate}</small>
                    </div>
                    <div className="airmail-bottom-box">
                      <p className="airmail-slogan">“{sloganText}”</p>
                      <h3 className="airmail-location">📍 {customLocationName}</h3>
                      <small className="airmail-addr">{customAddress}</small>
                      <div className="airmail-to-from">
                        <span>From: {authorTag}</span>
                        <span>To: Instagram World ✈️</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-modern-inner">
                    <div className="glass-bottom-card">
                      <span className="stamp-pill-active">
                        <Award size={13} />
                        {STAMPS.find(s => s.id === selectedStamp)?.label || '⭐ GOOGLE APPROVED'}
                      </span>

                      <h3 className="glass-slogan-text">“{sloganText}”</h3>

                      <div className="glass-spot-info">
                        <div className="spot-headline">
                          <MapPin size={18} className="text-cyan" />
                          <h4>{customLocationName}</h4>
                        </div>
                        <p className="spot-address-text">{customAddress}</p>
                      </div>

                      <div className="glass-card-footer">
                        <div className="author-badge">
                          <span className="author-dot" />
                          <span>{authorTag}</span>
                        </div>
                        <span className="footer-tagline">STORY BY PLANTRIP AI</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION EXPORT BUTTONS */}
            <div className="postcard-export-actions">
              <button
                className="btn-share-instagram-primary"
                onClick={handleGeneratePostcard}
                disabled={isGenerating}
              >
                <Sparkles size={18} />
                <span>{isGenerating ? 'Rendering Story...' : '✨ Generate & Preview Postcard'}</span>
              </button>

              <div className="export-secondary-row">
                <button
                  className="btn-action-secondary"
                  onClick={handleShareInstagramStory}
                  disabled={isGenerating}
                >
                  <Instagram size={15} />
                  <span>Share to Story</span>
                </button>

                <button
                  className="btn-action-secondary"
                  onClick={handleDownloadHD}
                  disabled={isGenerating}
                >
                  <Download size={15} />
                  <span>Download HD</span>
                </button>

                <button
                  className="btn-action-secondary"
                  onClick={handleCopyClipboard}
                  disabled={isGenerating}
                >
                  <Copy size={15} />
                  <span>Copy Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FULLSCREEN POSTCARD SHOWCASE MODAL
          ========================================================================= */}
      {postcardModalOpen && (
        <div className="modal-backdrop-blur" onClick={() => setPostcardModalOpen(false)}>
          <div className="postcard-showcase-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setPostcardModalOpen(false)}>
              <X size={18} />
            </button>

            <div className="modal-header-tag">
              <Sparkles size={18} className="text-cyan" />
              <h3>Your E-Postcard is Ready!</h3>
            </div>

            <p className="modal-sub-desc">
              Your 1080 × 1920 Instagram Story digital postcard for <strong>{customLocationName}</strong> is generated and ready to share!
            </p>

            {/* Rendered Preview Image */}
            <div className="modal-postcard-preview">
              {generatedDataUrl && (
                <img
                  src={generatedDataUrl}
                  alt="Generated Postcard"
                  className="modal-rendered-img"
                />
              )}
            </div>

            {/* Modal Actions */}
            <div className="modal-postcard-actions">
              <button
                className="btn-modal-instagram-share"
                onClick={handleShareInstagramStory}
              >
                <Instagram size={18} />
                <span>📲 Share to Instagram Story</span>
              </button>

              <div className="modal-sub-actions-row">
                <button
                  className="btn-modal-action"
                  onClick={handleDownloadHD}
                >
                  <Download size={16} />
                  <span>Download 1080x1920 HD</span>
                </button>

                <button
                  className="btn-modal-action"
                  onClick={handleCopyClipboard}
                >
                  <Copy size={16} />
                  <span>Copy Image</span>
                </button>

                <button
                  className="btn-modal-action"
                  onClick={() => {
                    const text = `Check out my travel postcard at ${customLocationName}! ${sloganText}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Share to WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
