import React, { useState, useMemo } from 'react'
import {
  Train, MapPin, Search, ArrowRight, Sparkles,
  CheckCircle2, Share2, Clock, ArrowUpDown,
  Ticket, Compass, Check, Milestone, Copy, Navigation
} from 'lucide-react'
import {
  malaysiaTransitNetwork,
  landmarkStationMap,
  calculateExactTransitRoute
} from './data/malaysiaTransitData'

export default function StepMalaysiaTransit({
  selectedCity = 'Kuala Lumpur',
  durationDays = 3,
  onPrevStep,
  onNextStep
}) {
  const [searchOrigin, setSearchOrigin] = useState('KL Sentral (Transit Hub)')
  const [searchDestination, setSearchDestination] = useState('KLCC (Petronas Twin Towers)')
  const [activeRouteResult, setActiveRouteResult] = useState(() =>
    calculateExactTransitRoute('KL Sentral (Transit Hub)', 'KLCC (Petronas Twin Towers)')
  )
  const [copiedRoute, setCopiedRoute] = useState(false)
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestSuggestions, setShowDestSuggestions] = useState(false)

  // Popular pre-configured Malaysian travel routes (1-tap shortcuts)
  const popularTripRoutes = [
    {
      id: 'r1',
      title: 'KL Sentral ➔ KLCC Twin Towers',
      icon: '🗼',
      origin: 'KL Sentral (Transit Hub)',
      dest: 'KLCC (Petronas Twin Towers)',
      tag: 'LRT 5 · 12 mins'
    },
    {
      id: 'r2',
      title: 'Bukit Bintang ➔ TRX Mall',
      icon: '🛍️',
      origin: 'Bukit Bintang (Pavilion / Lot 10)',
      dest: 'Tun Razak Exchange (TRX Shopping Gallery)',
      tag: 'MRT 9 · 4 mins'
    },
    {
      id: 'r3',
      title: 'Pasar Seni ➔ Batu Caves',
      icon: '🛕',
      origin: 'Pasar Seni (Chinatown / Central Market)',
      dest: 'Batu Caves (Rainbow Stairs & Temple)',
      tag: 'KTM Komuter · 28 mins'
    },
    {
      id: 'r4',
      title: 'KLCC ➔ Pavilion Bukit Bintang',
      icon: '🚌',
      origin: 'KLCC (Suria Mall Gate)',
      dest: 'Pavilion Bukit Bintang (Main Entrance)',
      tag: 'Free GoKL Bus · 8 mins'
    },
    {
      id: 'r5',
      title: 'Komtar ➔ Batu Ferringhi Beach',
      icon: '🏖️',
      origin: 'Komtar Bus Terminal (Central Georgetown Hub)',
      dest: 'Batu Ferringhi Beachfront (Night Market / Resorts)',
      tag: 'Rapid 101 · 35 mins'
    }
  ]

  // Known stations and landmarks for friendly autocomplete
  const allKnownSpots = useMemo(() => {
    const list = []
    const seen = new Set()

    malaysiaTransitNetwork.lines.forEach(line => {
      line.stations.forEach(st => {
        const key = st.name.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          list.push({ name: st.name, subtitle: `${line.name} (${st.id})`, color: line.color })
        }
      })
    })

    Object.keys(landmarkStationMap).forEach(k => {
      const key = k.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ name: k, subtitle: 'Popular Landmark', color: '#F97316' })
      }
    })

    return list
  }, [])

  const originSuggestions = useMemo(() => {
    if (!searchOrigin.trim()) return []
    const q = searchOrigin.toLowerCase()
    return allKnownSpots.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5)
  }, [searchOrigin, allKnownSpots])

  const destSuggestions = useMemo(() => {
    if (!searchDestination.trim()) return []
    const q = searchDestination.toLowerCase()
    return allKnownSpots.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5)
  }, [searchDestination, allKnownSpots])

  const handlePlanRoute = (origin = searchOrigin, destination = searchDestination) => {
    const res = calculateExactTransitRoute(origin, destination)
    setActiveRouteResult(res)
  }

  const handleSelectQuickRoute = (r) => {
    setSearchOrigin(r.origin)
    setSearchDestination(r.dest)
    handlePlanRoute(r.origin, r.dest)
  }

  const handleSwapStations = () => {
    const prevOrigin = searchOrigin
    const prevDest = searchDestination
    setSearchOrigin(prevDest)
    setSearchDestination(prevOrigin)
    handlePlanRoute(prevDest, prevOrigin)
  }

  const handleCopyTransitGuide = () => {
    if (!activeRouteResult) return
    const text = [
      `🚆 *Transit Route: ${activeRouteResult.originName} ➔ ${activeRouteResult.destName}*`,
      `🚇 Line: ${activeRouteResult.line}`,
      `⏱️ Travel Time: ${activeRouteResult.durationMins} mins (${activeRouteResult.stopsCount} stops)`,
      `💳 Fare: ${activeRouteResult.tngFare} (Free with MyCity Pass)`,
      '',
      `🧭 *Directions:*`,
      ...activeRouteResult.steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      `💡 Next train arrives every 3-5 mins.`
    ].join('\n')

    navigator.clipboard?.writeText(text)
    setCopiedRoute(true)
    setTimeout(() => setCopiedRoute(false), 2500)
  }

  return (
    <div className="transit-simplified-root fade-in">
      {/* 1. CLEAN HEADER */}
      <div className="transit-simple-header">
        <div className="transit-header-pill">
          <Train size={14} />
          <span>Local Transit Wayfinder</span>
        </div>
        <h2 className="transit-simple-title">
          Getting around {typeof selectedCity === 'string' ? selectedCity : selectedCity?.city || 'Malaysia'}
        </h2>
        <p className="transit-simple-sub">
          Instant point-to-point route directions, train line interchanges, travel times, and fare info.
        </p>
      </div>

      {/* 2. 1-TAP POPULAR TRIP SHORTCUTS */}
      <div className="transit-quick-shortcuts">
        <span className="shortcuts-label">Popular Hops:</span>
        <div className="shortcuts-scroll-row">
          {popularTripRoutes.map(r => {
            const isSelected = searchOrigin === r.origin && searchDestination === r.dest
            return (
              <button
                key={r.id}
                className={`shortcut-chip ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectQuickRoute(r)}
              >
                <span className="chip-emoji">{r.icon}</span>
                <span className="chip-title">{r.title}</span>
                <span className="chip-tag">{r.tag}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. POINT-TO-POINT SEARCH BOX */}
      <div className="transit-search-card">
        <div className="transit-inputs-row">
          {/* Origin Input */}
          <div className="transit-input-container">
            <label className="input-field-label">
              <MapPin size={13} className="text-emerald" />
              <span>Where are you starting from?</span>
            </label>
            <div className="transit-field-wrapper">
              <input
                type="text"
                value={searchOrigin}
                onChange={e => {
                  setSearchOrigin(e.target.value)
                  setShowOriginSuggestions(true)
                }}
                onFocus={() => setShowOriginSuggestions(true)}
                placeholder="e.g. KL Sentral, Bukit Bintang..."
                className="transit-clean-input"
              />
            </div>

            {showOriginSuggestions && originSuggestions.length > 0 && (
              <div className="transit-suggestions-dropdown fade-in">
                {originSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    className="suggestion-item"
                    onClick={() => {
                      setSearchOrigin(s.name)
                      setShowOriginSuggestions(false)
                      handlePlanRoute(s.name, searchDestination)
                    }}
                  >
                    <MapPin size={13} className="text-emerald" />
                    <div className="suggestion-text">
                      <strong>{s.name}</strong>
                      <span>{s.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <button
            className="btn-swap-clean"
            onClick={handleSwapStations}
            title="Swap Origin and Destination"
          >
            <ArrowUpDown size={16} />
          </button>

          {/* Destination Input */}
          <div className="transit-input-container">
            <label className="input-field-label">
              <Compass size={13} className="text-orange" />
              <span>Where do you want to go?</span>
            </label>
            <div className="transit-field-wrapper">
              <input
                type="text"
                value={searchDestination}
                onChange={e => {
                  setSearchDestination(e.target.value)
                  setShowDestSuggestions(true)
                }}
                onFocus={() => setShowDestSuggestions(true)}
                placeholder="e.g. KLCC Twin Towers, Batu Caves..."
                className="transit-clean-input"
              />
            </div>

            {showDestSuggestions && destSuggestions.length > 0 && (
              <div className="transit-suggestions-dropdown fade-in">
                {destSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    className="suggestion-item"
                    onClick={() => {
                      setSearchDestination(s.name)
                      setShowDestSuggestions(false)
                      handlePlanRoute(searchOrigin, s.name)
                    }}
                  >
                    <Compass size={13} className="text-orange" />
                    <div className="suggestion-text">
                      <strong>{s.name}</strong>
                      <span>{s.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Find Button */}
          <button
            className="btn-find-transit-route"
            onClick={() => {
              setShowOriginSuggestions(false)
              setShowDestSuggestions(false)
              handlePlanRoute(searchOrigin, searchDestination)
            }}
          >
            <Search size={16} />
            <span>Find Route</span>
          </button>
        </div>
      </div>

      {/* 4. ROUTE RESULT CARD */}
      {activeRouteResult && (
        <div className="transit-result-card fade-in">
          {/* Card Top: Line name & Share */}
          <div className="result-top-bar">
            <div className="line-identity">
              <span
                className="result-line-code"
                style={{ backgroundColor: activeRouteResult.lineColor || '#0284C7', color: activeRouteResult.textColor || '#fff' }}
              >
                {activeRouteResult.lineCode}
              </span>
              <div className="line-title-group">
                <strong className="result-line-name">{activeRouteResult.line}</strong>
                {activeRouteResult.direction && (
                  <span className="result-direction-tag">Towards {activeRouteResult.direction}</span>
                )}
              </div>
            </div>

            <button className="btn-share-transit-route" onClick={handleCopyTransitGuide}>
              {copiedRoute ? <CheckCircle2 size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copiedRoute ? 'Copied to Clipboard!' : 'Share Directions'}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="result-metrics-grid">
            <div className="metric-box">
              <span className="m-label">Travel Time</span>
              <strong className="m-val text-orange">~{activeRouteResult.durationMins} mins</strong>
            </div>
            <div className="metric-box">
              <span className="m-label">Stops</span>
              <strong className="m-val">{activeRouteResult.stopsCount} stops</strong>
            </div>
            <div className="metric-box">
              <span className="m-label">Touch 'n Go Fare</span>
              <strong className="m-val text-emerald">{activeRouteResult.tngFare}</strong>
            </div>
            <div className="metric-box">
              <span className="m-label">Frequency</span>
              <strong className="m-val">Every 3–5 mins</strong>
            </div>
          </div>

          {/* Intermediate Station Dots (if available) */}
          {activeRouteResult.intermediateStations && activeRouteResult.intermediateStations.length > 0 && (
            <div className="stations-path-container">
              <span className="path-title">
                <Milestone size={13} className="text-orange" />
                <span>Station Flow ({activeRouteResult.intermediateStations.length} stops)</span>
              </span>
              <div className="stations-path-scroll">
                {activeRouteResult.intermediateStations.map((st, sIdx) => {
                  const isFirst = sIdx === 0
                  const isLast = sIdx === activeRouteResult.intermediateStations.length - 1
                  return (
                    <div key={st.id || sIdx} className={`station-flow-node ${isFirst ? 'origin' : ''} ${isLast ? 'dest' : ''}`}>
                      <div
                        className="node-bullet"
                        style={{ backgroundColor: isFirst || isLast ? (activeRouteResult.lineColor || '#0284C7') : '#CBD5E1' }}
                      />
                      <span className="node-label">{st.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step-by-Step Directions */}
          <div className="route-steps-box">
            <span className="steps-title">
              <Navigation size={14} className="text-orange" />
              <span>Step-by-Step Instructions</span>
            </span>
            <div className="steps-ordered-list">
              {activeRouteResult.steps.map((step, idx) => (
                <div key={idx} className="step-row-item">
                  <span className="step-number-circle">{idx + 1}</span>
                  <p className="step-text-content">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. HELPFUL TRAVELER TIP BANNER */}
      <div className="transit-pass-tip-banner">
        <div className="tip-icon-circle">
          <Ticket size={18} />
        </div>
        <div className="tip-text-content">
          <strong>Money-Saving Tourist Tip:</strong>
          <p>
            Get the <strong>MyCity Pass for RM 5.00/day</strong> at any station customer service counter for unlimited rides on all LRT, MRT, Monorail & BRT. Or simply tap any standard physical Touch 'n Go card at the fare gates.
          </p>
        </div>
      </div>

      {/* 6. BOTTOM STEP ACTIONS */}
      <div className="step-bottom-bar">
        <button className="step-back-btn" onClick={onPrevStep}>
          Back to Expense Splitter
        </button>
        <button className="step-next-primary-btn" onClick={onNextStep}>
          Proceed to Plan B Contingency <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
