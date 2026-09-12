import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  MapPin, Calendar, Users, Clock, Compass, Volume2, VolumeX,
  Play, Pause, Bookmark, Check, BookOpen, Navigation, ExternalLink,
  X, Heart, Flame, Lightbulb, Camera, Share2, ArrowRight,
  Train, DollarSign, Sun, Eye, Layers
} from 'lucide-react'
import './travel-story-spotlight.css'

// Curated traveler intelligence for featured destinations
const PLACE_INTEL_DIRECTORY = {
  'petronas twin towers & klcc park': {
    vibe: 'Skyline & Architecture',
    timeOfDay: 'Blue Hour · 7:15 PM',
    weather: '29°C · Clear & Warm',
    duration: '1.5 – 2.5 hours',
    cost: 'Free park & mall · RM 80 skybridge',
    transit: 'Kelana Jaya LRT to KLCC Station (KJ10). Direct air-conditioned tunnel to Suria KLCC.',
    photoTip: 'Position camera at the fountain rim in KLCC Park at 7:15 PM for reflections of the illuminated towers.',
    crowdLevel: 'Popular · Best before 10 AM or after 8:30 PM',
    tags: ['Landmark', 'Photography', 'Night Lights', 'City Walk'],
    soundscapeType: 'city'
  },
  'suria klcc': {
    vibe: 'Skyline & Architecture',
    timeOfDay: 'Blue Hour · 7:15 PM',
    weather: '29°C · Clear & Warm',
    duration: '1.5 – 2.5 hours',
    cost: 'Free park & mall · RM 80 skybridge',
    transit: 'Kelana Jaya LRT to KLCC Station (KJ10). Direct air-conditioned tunnel to Suria KLCC.',
    photoTip: 'Position camera at the fountain rim in KLCC Park at 7:15 PM for reflections of the illuminated towers.',
    crowdLevel: 'Popular · Best before 10 AM or after 8:30 PM',
    tags: ['Landmark', 'Photography', 'Night Lights', 'City Walk'],
    soundscapeType: 'city'
  },
  'batu caves': {
    vibe: 'Heritage & Sacred Heights',
    timeOfDay: 'Early Morning · 7:45 AM',
    weather: '26°C · Morning Fresh',
    duration: '2.0 – 3.0 hours',
    cost: 'Free admission to main cave',
    transit: 'KTM Komuter train directly from KL Sentral to Batu Caves Station (30 min ride).',
    photoTip: 'Climb half-way up the 272 rainbow steps and shoot looking back down toward the golden Murugan statue.',
    crowdLevel: 'Busy by 10 AM · Arrive by 8 AM for cool breeze and uncrowded stairs',
    tags: ['Heritage', 'Limestone Cave', 'Morning Climb', 'Culture'],
    soundscapeType: 'temple'
  },
  'jalan alor & city centre': {
    vibe: 'Street Food & Night Market',
    timeOfDay: 'Supper Time · 9:30 PM',
    weather: '28°C · Lively Night',
    duration: '1.5 – 2.0 hours',
    cost: 'RM 25 – 45 per person',
    transit: 'MRT Sungai Buloh-Kajang Line to Bukit Bintang Station (Exit Changkat). 5 min walk.',
    photoTip: 'Stand at the neon sign entrance under the red lanterns for vivid street action shots.',
    crowdLevel: 'Peak vibrancy 8 PM - 11 PM · Fast table turnover',
    tags: ['Street Food', 'Supper', 'Night Market', 'Local Eats'],
    soundscapeType: 'market'
  },
  'heritage avenue & arts quarter': {
    vibe: 'Heritage Arts & Boutiques',
    timeOfDay: 'Mid Morning · 10:30 AM',
    weather: '28°C · Sunny',
    duration: '2.0 – 2.5 hours',
    cost: 'Free walking · Souvenirs RM 20+',
    transit: 'LRT Kelana Jaya Line to Pasar Seni Station. 3 min sheltered walk.',
    photoTip: 'Capture the restored art-deco colonial shophouses along Jalan Hang Kasturi.',
    crowdLevel: 'Relaxed & Walkable all day',
    tags: ['Crafts', 'Art Deco', 'Colonial Heritage', 'Coffee Stops'],
    soundscapeType: 'cafe'
  },
  'the exchange trx sky park': {
    vibe: 'Modern Rooftop Oasis',
    timeOfDay: 'Sunset · 6:30 PM',
    weather: '28°C · Sunset Breeze',
    duration: '1.5 hours',
    cost: 'Free public rooftop park',
    transit: 'Direct MRT link via TRX Interchange Station (MRT Putrajaya & Kajang lines).',
    photoTip: 'Shoot from the elevated boardwalk facing the TRX 106 skyscraper at golden hour.',
    crowdLevel: 'Moderate · Spacious rooftop lawns',
    tags: ['Rooftop Park', 'Skyline', 'Architecture', 'Sunset Walk'],
    soundscapeType: 'city'
  },
  'armenian street': {
    vibe: 'Street Murals & Heritage Core',
    timeOfDay: 'Morning · 9:00 AM',
    weather: '27°C · Sea Breeze',
    duration: '2.0 hours',
    cost: 'Free outdoor street gallery',
    transit: 'George Town CAT free shuttle bus to Lebuh Carnarvon stop or easy walk from jetty.',
    photoTip: 'Take photos with the "Kids on a Bicycle" mural in soft morning light before queues form.',
    crowdLevel: 'Popular mid-day · Very peaceful before 9:30 AM',
    tags: ['Murals', 'UNESCO Heritage', 'Cafe Hopping', 'History'],
    soundscapeType: 'cafe'
  },
  'chew jetty': {
    vibe: 'Wooden Stilt Clan Houses',
    timeOfDay: 'Late Afternoon · 5:30 PM',
    weather: '29°C · Coastal Breeze',
    duration: '1.0 – 1.5 hours',
    cost: 'Free public walkway',
    transit: 'Short walk from Weld Quay Ferry Terminal or central George Town.',
    photoTip: 'Walk to the end of the wooden pier at sunset for open ocean reflections and passing boats.',
    crowdLevel: 'Moderate · Please walk respectfully as residents live here',
    tags: ['Waterfront', 'Clan Jetty', 'Sunset', 'Culture'],
    soundscapeType: 'coastal'
  },
  'senso-ji asakusa': {
    vibe: 'Historic Courtyard & Lanterns',
    timeOfDay: 'Early Morning · 8:00 AM',
    weather: '21°C · Crisp Air',
    duration: '2.0 hours',
    cost: 'Free temple grounds admission',
    transit: 'Tokyo Metro Ginza Line or Toei Asakusa Line to Asakusa Station (Exit 1).',
    photoTip: 'Frame the huge red Kaminarimon lantern with the pagoda in the background.',
    crowdLevel: 'Busy by 10 AM · Early morning offers serene quiet',
    tags: ['Historic Temple', 'Incense', 'Tradition', 'Morning Walk'],
    soundscapeType: 'temple'
  },
  'shibuya crossing': {
    vibe: 'High-Energy Urban Pulse',
    timeOfDay: 'Evening · 8:15 PM',
    weather: '22°C · Neon Glow',
    duration: '1.0 hour',
    cost: 'Free street crossing',
    transit: 'JR Yamanote Line to Shibuya Station (Hachiko Exit).',
    photoTip: 'Head to the second floor of Tsutaya / Starbucks for the elevated scramble view.',
    crowdLevel: 'Peak crowd 6 PM - 10 PM · Constant exciting energy',
    tags: ['Tokyo Icon', 'Scramble', 'Neon', 'City Life'],
    soundscapeType: 'city'
  }
}

// Fallback generator for any custom place
function resolvePlaceIntel(placeKey, postcard) {
  const normalizedKey = (placeKey || '').toLowerCase().trim()
  if (PLACE_INTEL_DIRECTORY[normalizedKey]) {
    return PLACE_INTEL_DIRECTORY[normalizedKey]
  }
  // Check partial matches
  for (const [key, data] of Object.entries(PLACE_INTEL_DIRECTORY)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return data
    }
  }
  return {
    vibe: 'Must-Visit Destination',
    timeOfDay: 'Golden Hour · 6:00 PM',
    weather: '28°C · Pleasant',
    duration: '1.5 – 2.0 hours',
    cost: 'Local explorer pricing',
    transit: `Easy access via local transit in ${postcard?.city || 'the city centre'}.`,
    photoTip: 'Capture the landmark framed by local architecture during late afternoon light.',
    crowdLevel: 'Moderate all week',
    tags: ['Exploration', 'Travel Memory', 'Culture', 'Local Favourite'],
    soundscapeType: 'city'
  }
}

export default function TravelStorySpotlightModal({
  postcard,
  onClose,
  onAddToTrip
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [addedToTrip, setAddedToTrip] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [photoInspect, setPhotoInspect] = useState(false)
  const [activeTab, setActiveTab] = useState('guide') // 'guide' | 'journal' | 'map'
  
  // Interactive reaction counters
  const storageReactionKey = `spotlight-reactions-${(postcard?.title || 'place').replace(/\s+/g, '-').toLowerCase()}`
  const [reactions, setReactions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageReactionKey) || '{}')
      return {
        love: saved.love || 24,
        fire: saved.fire || 18,
        tip: saved.tip || 12,
        camera: saved.camera || 31
      }
    } catch {
      return { love: 24, fire: 18, tip: 12, camera: 31 }
    }
  })
  const [userReacted, setUserReacted] = useState({})

  const intel = useMemo(() => {
    return resolvePlaceIntel(postcard?.place || postcard?.title, postcard)
  }, [postcard])

  // ==========================================================================
  // AMBIENT TRAVEL SOUNDSCAPE (Using Web Audio API - Zero External Network Lag)
  // ==========================================================================
  const audioContextRef = useRef(null)
  const gainNodeRef = useRef(null)
  const oscillatorRefs = useRef([])

  const toggleSoundscape = () => {
    if (isPlayingAudio) {
      // Stop
      try {
        oscillatorRefs.current.forEach(osc => osc.stop?.())
        oscillatorRefs.current = []
        if (audioContextRef.current) {
          audioContextRef.current.close?.()
          audioContextRef.current = null
        }
      } catch (e) {
        console.log('Audio stop:', e)
      }
      setIsPlayingAudio(false)
    } else {
      // Start soothing atmospheric soundscape
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()
        audioContextRef.current = ctx

        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(0.08, ctx.currentTime)
        masterGain.connect(ctx.destination)
        gainNodeRef.current = masterGain

        // Create pink noise atmospheric breeze
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.96900 * b2 + white * 0.1538520
          b3 = 0.86650 * b3 + white * 0.3104856
          b4 = 0.55000 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.0168980
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
          b6 = white * 0.115926
        }

        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        // Soft low-pass filter for ambient breeze
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(420, ctx.currentTime)

        whiteNoise.connect(filter)
        filter.connect(masterGain)
        whiteNoise.start()
        oscillatorRefs.current.push(whiteNoise)

        // Gentle harmonic chord (peaceful travel ambiance)
        const notes = intel.soundscapeType === 'temple' ? [220, 330, 440] : [261.63, 329.63, 392.00]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const oscGain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, ctx.currentTime)
          oscGain.gain.setValueAtTime(0.012 / (idx + 1), ctx.currentTime)

          osc.connect(oscGain)
          oscGain.connect(masterGain)
          osc.start()
          oscillatorRefs.current.push(osc)
        })

        setIsPlayingAudio(true)
      } catch (err) {
        console.warn('Web Audio Soundscape init notice:', err)
      }
    }
  }

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      try {
        oscillatorRefs.current.forEach(osc => osc.stop?.())
        if (audioContextRef.current) audioContextRef.current.close?.()
      } catch {}
    }
  }, [])

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Handle emoji reactions
  const triggerReaction = (type) => {
    if (userReacted[type]) return
    const next = { ...reactions, [type]: (reactions[type] || 0) + 1 }
    setReactions(next)
    setUserReacted(prev => ({ ...prev, [type]: true }))
    try {
      localStorage.setItem(storageReactionKey, JSON.stringify(next))
    } catch {}
  }

  // Handle Add to My Trip
  const handleAddToTrip = () => {
    setAddedToTrip(true)
    onAddToTrip?.({
      title: postcard?.title,
      place: postcard?.place || postcard?.title,
      city: postcard?.city,
      country: postcard?.country,
      image: postcard?.image,
      duration: intel.duration,
      notes: postcard?.note || postcard?.publicNote || postcard?.excerpt
    })
    setTimeout(() => setAddedToTrip(false), 3000)
  }

  // Share action
  const handleShare = () => {
    const shareText = `Check out ${postcard?.title} in ${postcard?.city} on Roamly!`
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Google Maps navigation link
  const mapsSearchQuery = encodeURIComponent(`${postcard?.place || postcard?.title}, ${postcard?.city || ''}`)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsSearchQuery}`
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${mapsSearchQuery}&t=m&z=15&output=embed`

  return (
    <div className="travel-spotlight-backdrop" role="dialog" aria-modal="true" aria-labelledby="spotlight-title">
      <div className="travel-spotlight-dialog">
        
        {/* TOP BAR / CONTROLS */}
        <div className="spotlight-dialog-topbar">
          <div className="spotlight-location-tag">
            <MapPin size={14} className="tag-pin-icon" />
            <span>{postcard?.city || 'Featured Destination'}, {postcard?.country || 'World'}</span>
          </div>

          <div className="spotlight-top-actions">
            {/* Ambient Soundscape Toggle */}
            <button
              type="button"
              className={`spotlight-sound-btn ${isPlayingAudio ? 'is-playing' : ''}`}
              onClick={toggleSoundscape}
              title={isPlayingAudio ? 'Pause ambient soundscape' : 'Listen to ambient travel soundscape'}
            >
              {isPlayingAudio ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="btn-label-text">{isPlayingAudio ? 'Ambiance On' : 'Play Ambiance'}</span>
              {isPlayingAudio && (
                <span className="audio-wave-bars">
                  <i /><i /><i />
                </span>
              )}
            </button>

            {/* Share Button */}
            <button
              type="button"
              className="spotlight-tool-btn"
              onClick={handleShare}
              title="Copy share link"
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              <span className="btn-label-text">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="spotlight-close-btn"
              onClick={onClose}
              title="Close (Esc)"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MAIN 2-COLUMN SPOTLIGHT CONTENT */}
        <div className="spotlight-main-grid">

          {/* LEFT COLUMN: CINEMATIC HERO PHOTOGRAPHY & REACTION BAR */}
          <div className="spotlight-hero-col">
            <div className="spotlight-photo-container">
              <img
                src={postcard?.image}
                alt={postcard?.title}
                className="spotlight-hero-img"
                onClick={() => setPhotoInspect(true)}
              />
              <div className="spotlight-photo-overlay" />

              {/* Badges on the photo */}
              <div className="photo-corner-badges">
                <span className="badge-vibe">{intel.vibe}</span>
                <span className="badge-weather">
                  <Sun size={12} />
                  <span>{intel.weather}</span>
                </span>
              </div>

              {/* Time of Day badge */}
              <div className="photo-time-badge">
                <Clock size={12} />
                <span>{intel.timeOfDay}</span>
              </div>

              {/* Photo Zoom Hint */}
              <button
                type="button"
                className="btn-inspect-photo"
                onClick={() => setPhotoInspect(true)}
                title="View full resolution photograph"
              >
                <Eye size={13} />
                <span className="btn-inspect-text-full">Inspect full photo</span>
                <span className="btn-inspect-text-short">Zoom</span>
              </button>
            </div>

            {/* Interactive Reactions Bar */}
            <div className="spotlight-reactions-bar">
              <span className="reactions-heading">Traveler Love:</span>
              <div className="reaction-buttons-group">
                <button
                  type="button"
                  className={`reaction-btn ${userReacted.love ? 'reacted' : ''}`}
                  onClick={() => triggerReaction('love')}
                  title="Loved this memory"
                >
                  <Heart size={16} />
                  <span className="count">{reactions.love}</span>
                </button>

                <button
                  type="button"
                  className={`reaction-btn ${userReacted.fire ? 'reacted' : ''}`}
                  onClick={() => triggerReaction('fire')}
                  title="Must visit place!"
                >
                  <Flame size={16} />
                  <span className="count">{reactions.fire}</span>
                </button>

                <button
                  type="button"
                  className={`reaction-btn ${userReacted.tip ? 'reacted' : ''}`}
                  onClick={() => triggerReaction('tip')}
                  title="Super useful tip"
                >
                  <Lightbulb size={16} />
                  <span className="count">{reactions.tip}</span>
                </button>

                <button
                  type="button"
                  className={`reaction-btn ${userReacted.camera ? 'reacted' : ''}`}
                  onClick={() => triggerReaction('camera')}
                  title="Great photography spot"
                >
                  <Camera size={16} />
                  <span className="count">{reactions.camera}</span>
                </button>
              </div>
            </div>

            {/* Memory Author Attribution */}
            <div className="spotlight-author-card">
              <div className="author-avatar-circle">
                {(postcard?.author || 'T').slice(0, 1)}
              </div>
              <div className="author-meta">
                <strong>Shared by {postcard?.author || 'Fellow Traveler'}</strong>
                <small>{postcard?.dates || 'Recent journey'} · {postcard?.city}, {postcard?.country}</small>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TRAVEL INTEL, TABS & ADD TO TRIP ACTION */}
          <div className="spotlight-details-col">
            
            {/* Destination Title & Landmark */}
            <div className="spotlight-heading-block">
              <h2 id="spotlight-title">{postcard?.title}</h2>
              <p className="spotlight-place-subtitle">
                <MapPin size={15} className="sub-pin" />
                <span>{postcard?.place || postcard?.city}</span>
              </p>
            </div>

            {/* Key Trip Stats Row */}
            <div className="spotlight-stats-strip">
              <div className="stat-pill">
                <Clock size={13} className="stat-icon" />
                <div>
                  <small>Duration</small>
                  <strong>{intel.duration}</strong>
                </div>
              </div>

              <div className="stat-pill">
                <DollarSign size={13} className="stat-icon" />
                <div>
                  <small>Est. Cost</small>
                  <strong>{intel.cost}</strong>
                </div>
              </div>

              <div className="stat-pill">
                <Users size={13} className="stat-icon" />
                <div>
                  <small>Crowds</small>
                  <strong>{intel.crowdLevel.split('·')[0]}</strong>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR: Guide / Journal / Map */}
            <div className="spotlight-nav-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                onClick={() => setActiveTab('guide')}
              >
                <Compass size={14} />
                <span className="tab-label-full">Traveler Guide</span>
                <span className="tab-label-short">Guide</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
                onClick={() => setActiveTab('journal')}
              >
                <BookOpen size={14} />
                <span className="tab-label-full">Travel Diary</span>
                <span className="tab-label-short">Diary</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => setActiveTab('map')}
              >
                <Navigation size={14} />
                <span className="tab-label-full">Map & Directions</span>
                <span className="tab-label-short">Map</span>
              </button>
            </div>

            {/* TAB 1: CURATED TRAVELER GUIDE */}
            {activeTab === 'guide' && (
              <div className="tab-pane-content guide-pane fade-in">
                {/* Transit Advice */}
                <div className="guide-intel-card">
                  <div className="intel-icon-box transit">
                    <Train size={16} />
                  </div>
                  <div className="intel-content">
                    <h4>How to Get There</h4>
                    <p>{intel.transit}</p>
                  </div>
                </div>

                {/* Photography Vantage Point */}
                <div className="guide-intel-card">
                  <div className="intel-icon-box photo">
                    <Camera size={16} />
                  </div>
                  <div className="intel-content">
                    <h4>Best Photo Angle & Timing</h4>
                    <p>{intel.photoTip}</p>
                  </div>
                </div>

                {/* Crowd Timing & Best Hours */}
                <div className="guide-intel-card">
                  <div className="intel-icon-box crowds">
                    <Clock size={16} />
                  </div>
                  <div className="intel-content">
                    <h4>Crowd Intelligence</h4>
                    <p>{intel.crowdLevel}</p>
                  </div>
                </div>

                {/* Tags Cloud */}
                <div className="spotlight-tags-list">
                  {intel.tags.map(tag => (
                    <span key={tag} className="spotlight-tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TRAVEL DIARY & STORY */}
            {activeTab === 'journal' && (
              <div className="tab-pane-content journal-pane fade-in">
                <blockquote className="journal-story-quote">
                  “{postcard?.note || postcard?.publicNote || postcard?.excerpt || 'A favorite frame from our journey. The light, the warmth of the locals, and the unforgettable memory of being there.'}”
                </blockquote>

                <div className="journal-reflection-box">
                  <h4>Traveler Notes</h4>
                  <p>
                    {postcard?.author || 'The travel crew'} spent an afternoon here taking photos, exploring the surrounding walkways, and discovering local favorites.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: REAL GOOGLE MAP & NAVIGATION */}
            {activeTab === 'map' && (
              <div className="tab-pane-content map-pane fade-in">
                <div className="embedded-map-frame">
                  <iframe
                    title={`Map of ${postcard?.place || postcard?.title}`}
                    src={googleMapEmbedUrl}
                    className="map-iframe"
                    loading="lazy"
                  />
                </div>
                <div className="map-actions-bar">
                  <span>Exact landmark location in {postcard?.city}</span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-google-maps-direct"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}

            {/* ACTION FOOTER: ADD TO MY TRIP */}
            <div className="spotlight-footer-actions">
              <button
                type="button"
                className={`btn-add-to-plan ${addedToTrip ? 'is-added' : ''}`}
                onClick={handleAddToTrip}
              >
                {addedToTrip ? <Check size={16} /> : <Bookmark size={16} />}
                <span className="btn-footer-text-full">{addedToTrip ? 'Saved to Your Trip!' : '+ Add Spot to My Trip Plan'}</span>
                <span className="btn-footer-text-short">{addedToTrip ? 'Saved' : '+ Add to Trip'}</span>
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-nav-directions"
                title="Open live Google Maps turn-by-turn directions"
              >
                <Navigation size={14} />
                <span>Navigate</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* FULL-SIZE PHOTO LIGHTBOX MODAL */}
      {photoInspect && (
        <div
          className="photo-inspect-lightbox"
          onClick={() => setPhotoInspect(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="inspect-content" onClick={e => e.stopPropagation()}>
            <img src={postcard?.image} alt={postcard?.title} className="inspect-img" />
            <div className="inspect-caption">
              <strong>{postcard?.title}</strong>
              <span>{postcard?.place || postcard?.city} · {postcard?.author}</span>
            </div>
            <button
              type="button"
              className="inspect-close-btn"
              onClick={() => setPhotoInspect(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
