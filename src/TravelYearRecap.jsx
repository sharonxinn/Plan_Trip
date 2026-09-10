import React, { useMemo, useRef, useState, useEffect } from 'react'
import {
  ArrowUpRight, Camera, X, Award, Compass, Calendar, MapPin,
  Users, DollarSign, Share2, Check, ArrowRight, ArrowLeft
} from 'lucide-react'
import './travel-year-recap.css'

const KEY = 'plantrip-year-recap-v1'
const PLACES = [
  { name: 'Kuala Lumpur', country: 'Malaysia', visits: 5, spend: 3458, image: '/images/klcc_friends_evening.jpg', tag: 'Top City · Skyline & Cafes' },
  { name: 'George Town', country: 'Malaysia', visits: 4, spend: 1980, image: '/images/penang_mural_friends.jpg', tag: 'Heritage · Food & Murals' },
  { name: 'Singapore', country: 'Singapore', visits: 3, spend: 2840, image: '/images/trip_friends_supper.jpg', tag: 'Architecture & Late Dinners' },
  { name: 'Bangkok', country: 'Thailand', visits: 2, spend: 2690, image: '/images/bangkok_watarun_friends.jpg', tag: 'Temples & River Cruises' },
  { name: 'Malacca', country: 'Malaysia', visits: 1, spend: 760, image: '/images/neighbourhood_street_walk.jpg', tag: 'Cobblestones & History' }
]

const CARDS = [
  { title: 'Blue hour, best company.', place: 'Kuala Lumpur, Malaysia', image: '/images/klcc_friends_evening.jpg', caption: 'The lights came on. Nobody was ready to leave.', saves: 128 },
  { title: 'A little lost in the lanes.', place: 'George Town, Malaysia', image: '/images/penang_mural_friends.jpg', caption: 'One mural, a dozen photos, and our favourite afternoon.', saves: 96 },
  { title: 'Meet me by the river.', place: 'Bangkok, Thailand', image: '/images/bangkok_watarun_friends.jpg', caption: 'The last light over Wat Arun was worth slowing down for.', saves: 74 }
]

const money = value => `RM ${Number(value || 0).toLocaleString('en-MY', { maximumFractionDigits: 0 })}`

export default function TravelYearRecap({ onBack }) {
  const [trips] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(saved)
        ? saved.filter(t => t && typeof t.place === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && Number.isFinite(t.spend) && t.spend >= 0 && Array.isArray(t.friends))
        : []
    } catch {
      return []
    }
  })

  const [year, setYear] = useState(2025)
  const [activeChapter, setActiveChapter] = useState('all') // 'all' | 'places' | 'skyline' | 'squad' | 'postcards' | 'persona'
  const [hoveredPlaceIndex, setHoveredPlaceIndex] = useState(0)
  const [card, setCard] = useState(null)
  const [copiedShare, setCopiedShare] = useState(false)
  const dialog = useRef(null)

  useEffect(() => {
    if (card) dialog.current?.showModal()
  }, [card])

  const actual = trips.filter(t => t.date.startsWith(String(year)))
  const demo = actual.length === 0

  const { places, friends } = useMemo(() => {
    const current = trips.filter(t => t.date.startsWith(String(year)))
    if (!current.length) {
      return {
        places: PLACES,
        friends: [['Aina', 12], ['Daniel', 9], ['Sara', 6], ['Marcus', 4]]
      }
    }
    const locations = new Map(), people = new Map()
    current.forEach(t => {
      const key = t.place.trim().toLowerCase()
      const known = PLACES.find(p => p.name.toLowerCase() === key)
      const entry = locations.get(key) || {
        name: t.place,
        country: known?.country || 'Your trip',
        visits: 0,
        spend: 0,
        image: known?.image || '/images/trip_friends_supper.jpg',
        tag: known?.tag || 'Exploration'
      }
      entry.visits++
      entry.spend += t.spend
      locations.set(key, entry)
      new Set(t.friends).forEach(name => people.set(name, (people.get(name) || 0) + 1))
    })
    return {
      places: [...locations.values()].sort((a, b) => b.visits - a.visits).slice(0, 5),
      friends: [...people].sort((a, b) => b[1] - a[1]).slice(0, 4)
    }
  }, [trips, year])

  const total = demo ? PLACES.reduce((sum, p) => sum + p.spend, 0) : actual.reduce((sum, t) => sum + t.spend, 0)
  const visits = demo ? 15 : actual.length
  const maxSpend = Math.max(1, ...places.map(p => p.spend))

  // Archetype Persona determination
  const persona = useMemo(() => {
    const topPlace = places[0]?.name || 'Southeast Asia'
    return {
      title: 'The Urban Flâneur & Skyline Chaser',
      badge: '1-Year Milestone Explorer',
      description: `Your year was defined by blue-hour cityscapes, late-night hawker dinners, and lingering afternoon coffee stops in ${topPlace}. You collected memories over checklists.`,
      statHighlight: `${visits} Journeys · ${places.length} Cities · ${friends.length} Squad Members`
    }
  }, [places, visits, friends])

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2400)
  }

  return (
    <section className="rewind" aria-labelledby="rewind-title">

      {/* 1. CELEBRATORY MILESTONE HERO */}
      <header className="rewind-hero-marquee">
        <div className="rewind-confetti-field" aria-hidden="true">
          <span className="confetti-dot c1" />
          <span className="confetti-dot c2" />
          <span className="confetti-dot c3" />
          <span className="confetti-dot c4" />
          <span className="confetti-dot c5" />
          <span className="confetti-dot c6" />
        </div>

        <div className="rewind-hero-content">
          <div className="rewind-milestone-pill">
            <Award size={14} className="milestone-badge-icon" />
            <span>1-YEAR MILESTONE · RECAP {year}</span>
            <span className="milestone-ping-dot" />
          </div>

          <h2 id="rewind-title">
            365 Days of Roaming.<br />
            <span>Countless Frames.</span>
          </h2>

          <p className="rewind-hero-sub">
            From golden hour skyline towers to quiet morning alleyways. Here is the official replay of where your feet stepped and heart stayed.
          </p>

          {/* Quick Year Switcher & Share */}
          <div className="rewind-controls-bar">
            <div className="rewind-year-selector">
              <span className="selector-label">Recap Year:</span>
              <div className="year-pills-list">
                {[...new Set([2025, 2024, ...trips.map(t => Number(t.date.slice(0, 4)))])]
                  .sort((a, b) => b - a)
                  .map(y => (
                    <button
                      key={y}
                      type="button"
                      className={`year-pill-btn ${year === y ? 'active' : ''}`}
                      onClick={() => setYear(Number(y))}
                    >
                      {y}
                    </button>
                  ))}
              </div>
            </div>

            <div className="rewind-hero-actions">
              <button
                type="button"
                className="btn-share-recap"
                onClick={handleShare}
                title="Share your 1 Year Recap"
              >
                {copiedShare ? <Check size={14} /> : <Share2 size={14} />}
                <span>{copiedShare ? 'Link Copied!' : 'Share Recap'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Polaroid Showcase with Stamp */}
        <div className="rewind-hero-visual">
          <div className="hero-polaroid-frame">
            <img
              src="/images/penang_mural_friends.jpg"
              alt="Travelers posing together at a street mural"
              className="hero-polaroid-img"
            />
            <div className="polaroid-corner-stamp">
              <Award size={18} />
              <span>YEAR 1<br />EXPLORER</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FOUR KEY SUMMARY STATS CARDS */}
      <section className="rewind-summary-strip" aria-label="Key Travel Recap Numbers">
        <div className="summary-stat-card">
          <div className="stat-card-top">
            <DollarSign size={18} className="stat-icon" />
            <span className="stat-card-label">Total Investment</span>
          </div>
          <strong className="stat-card-number">{money(total)}</strong>
          <small className="stat-card-sub">Invested in memories & food</small>
          <div className="stat-card-shimmer" />
        </div>

        <div className="summary-stat-card">
          <div className="stat-card-top">
            <Compass size={18} className="stat-icon" />
            <span className="stat-card-label">Journeys Completed</span>
          </div>
          <strong className="stat-card-number">{visits} Trips</strong>
          <small className="stat-card-sub">Stamps added to your passport</small>
          <div className="stat-card-shimmer" />
        </div>

        <div className="summary-stat-card">
          <div className="stat-card-top">
            <MapPin size={18} className="stat-icon" />
            <span className="stat-card-label">Top Coordinate</span>
          </div>
          <strong className="stat-card-number">{places[0]?.name || 'Kuala Lumpur'}</strong>
          <small className="stat-card-sub">{places[0]?.visits || 5} trips · Favorite hub</small>
          <div className="stat-card-shimmer" />
        </div>

        <div className="summary-stat-card">
          <div className="stat-card-top">
            <Users size={18} className="stat-icon" />
            <span className="stat-card-label">Top Companion</span>
          </div>
          <strong className="stat-card-number">{friends[0]?.[0] || 'Aina'}</strong>
          <small className="stat-card-sub">{friends[0]?.[1] || 12} trips travelled together</small>
          <div className="stat-card-shimmer" />
        </div>
      </section>

      {/* 3. CHAPTER NAVIGATION BAR */}
      <nav className="rewind-chapter-nav" aria-label="Recap chapters">
        <button
          type="button"
          className={`chapter-btn ${activeChapter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveChapter('all')}
        >
          <span>All Highlights</span>
        </button>
        <button
          type="button"
          className={`chapter-btn ${activeChapter === 'places' ? 'active' : ''}`}
          onClick={() => setActiveChapter('places')}
        >
          <MapPin size={13} />
          <span>Top Places</span>
        </button>
        <button
          type="button"
          className={`chapter-btn ${activeChapter === 'skyline' ? 'active' : ''}`}
          onClick={() => setActiveChapter('skyline')}
        >
          <DollarSign size={13} />
          <span>Budget Skyline</span>
        </button>
        <button
          type="button"
          className={`chapter-btn ${activeChapter === 'squad' ? 'active' : ''}`}
          onClick={() => setActiveChapter('squad')}
        >
          <Users size={13} />
          <span>Travel Squad</span>
        </button>
        <button
          type="button"
          className={`chapter-btn ${activeChapter === 'postcards' ? 'active' : ''}`}
          onClick={() => setActiveChapter('postcards')}
        >
          <Camera size={13} />
          <span>Top Postcards</span>
        </button>
        <button
          type="button"
          className={`chapter-btn ${activeChapter === 'persona' ? 'active' : ''}`}
          onClick={() => setActiveChapter('persona')}
        >
          <Award size={13} />
          <span>Explorer Archetype</span>
        </button>
      </nav>

      <div className="rewind-data-note">
        {demo
          ? 'Sample recap based on your community journey · Illustrative visits, spending, and travel companions.'
          : 'Your personalized recap calculated from your saved journeys · Currency in MYR.'}
      </div>

      {/* CHAPTER 1: TOP 5 DESTINATIONS RANKING */}
      {(activeChapter === 'all' || activeChapter === 'places') && (
        <section className="rewind-ranking fade-in" aria-labelledby="ranking-heading">
          <div className="rewind-section-heading">
            <div>
              <div className="section-pill-tag">DESTINATIONS ON REPEAT</div>
              <h3 id="ranking-heading">Your Top 5.<br />Where You Kept Returning.</h3>
            </div>
            <p>Some streets never get old. These were your most frequented coordinates this year.</p>
          </div>

          <div
            className="rewind-photo-bars"
            role="list"
            aria-label={`Places ranked by trips: ${places.map(p => `${p.name}, ${p.visits}`).join('; ')}`}
          >
            {places.map((p, i) => {
              const pct = Math.max(35, Math.min(100, (p.visits / (places[0]?.visits || 1)) * 100))
              return (
                <div className="rewind-place-row" key={p.name} role="listitem">
                  <span className="rewind-rank-badge">0{i + 1}</span>

                  <div className="rewind-place-bar" style={{ width: `${pct}%` }}>
                    <img src={p.image} alt={p.name} className="place-bar-bg" />
                    <div className="place-bar-text">
                      <strong>{p.name}</strong>
                      <small>{p.country} · {p.tag}</small>
                    </div>

                    <div className="place-bar-count">
                      <b>{p.visits}</b>
                      <small>{p.visits === 1 ? 'trip' : 'trips'}</small>
                    </div>
                  </div>

                  <div className="place-row-spend">
                    <span>{money(p.spend)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* CHAPTER 2: SPENDING SKYLINE (ARCHITECTURAL TOWERS) */}
      {(activeChapter === 'all' || activeChapter === 'skyline') && (
        <section className="rewind-spending fade-in" aria-labelledby="spending-heading">
          <div className="rewind-section-heading">
            <div>
              <div className="section-pill-tag">BUDGET ARCHITECTURE</div>
              <h3 id="spending-heading">Where the<br />Budget Went.</h3>
              <p>Actual expenditure mapped like a city skyline across your {visits} journeys.</p>
            </div>
            <div className="rewind-total-pill">
              <span className="total-label">Total Spend</span>
              <strong className="total-val">{money(total)}</strong>
              <small className="total-sub">Across {visits} adventures</small>
            </div>
          </div>

          {/* Interactive City Spotlight Callout */}
          <div className="skyline-spotlight-bar" aria-live="polite">
            <span className="spotlight-beacon-pulse" />
            <strong>{(places[hoveredPlaceIndex] || places[0])?.name}</strong>
            <span className="spotlight-divider">·</span>
            <span className="spotlight-money">{money((places[hoveredPlaceIndex] || places[0])?.spend)}</span>
            <span className="spotlight-divider">·</span>
            <span className="spotlight-trips">{(places[hoveredPlaceIndex] || places[0])?.visits} journeys</span>
            <span className="spotlight-divider">·</span>
            <span className="spotlight-pct-tag">
              {total > 0 ? Math.round(((places[hoveredPlaceIndex] || places[0])?.spend / total) * 100) : 0}% of budget
            </span>
          </div>

          <div className="rewind-skyline-container" aria-label="Spending per place in Malaysian ringgit">
            <div className="rewind-skyline">
              {places.map((p, i) => {
                const heightPct = Math.max(36, (p.spend / maxSpend) * 170)
                const isHovered = hoveredPlaceIndex === i
                return (
                  <div
                    className={`rewind-building ${isHovered ? 'is-active' : ''}`}
                    key={p.name}
                    onMouseEnter={() => setHoveredPlaceIndex(i)}
                    onFocus={() => setHoveredPlaceIndex(i)}
                    onClick={() => setHoveredPlaceIndex(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setHoveredPlaceIndex(i)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.name}: ${money(p.spend)}`}
                  >
                    <span className="building-spend-tag">{money(p.spend)}</span>

                    <div
                      className={`rewind-building-bar tower-style-${i % 3}`}
                      style={{ height: `${heightPct}px`, '--tower-delay': `${i * 90}ms` }}
                    >
                      <div className="tower-summit-beacon" />
                      <div className="tower-pillar-surface" />
                      <span className="tower-rank-num">0{i + 1}</span>
                    </div>

                    <strong className="building-name">{p.name}</strong>
                    <span className="building-pct">
                      {total > 0 ? Math.round((p.spend / total) * 100) : 0}% of spend
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="skyline-ground-line" />
          </div>
        </section>
      )}

      {/* CHAPTER 3: TRAVEL SQUAD & CREW ORBIT */}
      {(activeChapter === 'all' || activeChapter === 'squad') && (
        <section className="rewind-crew fade-in" aria-labelledby="crew-heading">
          <div className="rewind-crew-intro">
            <div className="section-pill-tag">TRAVEL COMPANIONS</div>
            <h3 id="crew-heading">Same Crew.<br />New Coordinates.</h3>
            <p>Travel is always better together. Here are the friends who shared your baggage claims and late dinners.</p>
          </div>

          <div className="rewind-friends-container">
            <ol className="rewind-friends">
              {friends.map(([name, count], i) => (
                <li key={name} className="friend-row">
                  <div className="friend-avatar-circle">
                    {name.slice(0, 1)}
                  </div>
                  <div className="friend-content">
                    <div className="friend-meta">
                      <strong>{name}</strong>
                      <span>{count} journeys ({Math.round((count / visits) * 100)}% of trips)</span>
                    </div>
                    <div className="friend-progress-track">
                      <span
                        className="friend-progress-fill"
                        style={{ width: `${(count / visits) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="friend-rank-tag">0{i + 1}</span>
                </li>
              ))}
              {!friends.length && (
                <li className="friend-empty-state">
                  <span>Add friends on your next journey to see them mapped here!</span>
                </li>
              )}
            </ol>
          </div>
        </section>
      )}

      {/* CHAPTER 4: TOP POSTCARDS */}
      {(activeChapter === 'all' || activeChapter === 'postcards') && (
        <section className="rewind-postcards fade-in" aria-labelledby="postcards-heading">
          <div className="rewind-section-heading">
            <div>
              <div className="section-pill-tag">FEATURED MEMORIES</div>
              <h3 id="postcards-heading">Top 3 Postcards.<br />Keep These Close.</h3>
            </div>
            <div className="postcards-icon-box">
              <Camera size={26} />
            </div>
          </div>
          <p className="rewind-gallery-note">
            Selected snapshots ranked by saves and moments remembered. Tap any card to inspect full frame.
          </p>

          <div className="rewind-card-stack">
            {CARDS.map((p, i) => (
              <button
                type="button"
                className={`rewind-postcard-card card-${i + 1}`}
                key={p.title}
                onClick={() => setCard(p)}
                aria-label={`Open postcard: ${p.title}`}
              >
                <div className="rewind-card-image-wrap">
                  <img src={p.image} alt={p.title} />
                  <span className="postcard-rank-badge">0{i + 1}</span>
                </div>
                <div className="rewind-card-info">
                  <strong>{p.title}</strong>
                  <span>{p.place}</span>
                  <small>
                    <span>{p.saves} saves</span>
                    <ArrowUpRight size={14} />
                  </small>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CHAPTER 5: TRAVELER ARCHETYPE PERSONA */}
      {(activeChapter === 'all' || activeChapter === 'persona') && (
        <section className="rewind-persona-section fade-in" aria-labelledby="persona-heading">
          <div className="persona-card-inner">
            <div className="persona-badge-header">
              <span className="persona-badge-pill">
                <Award size={14} />
                <span>OFFICIAL 1-YEAR TRAVEL PERSONA</span>
              </span>
              <span className="persona-year-stamp">{year} EDITION</span>
            </div>

            <h3 id="persona-heading" className="persona-title">
              {persona.title}
            </h3>

            <p className="persona-desc">
              {persona.description}
            </p>

            <div className="persona-highlights-row">
              <div className="persona-highlight-pill">
                <Compass size={14} />
                <span>{persona.statHighlight}</span>
              </div>
            </div>

            <div className="persona-signature-row">
              <div className="persona-seal">
                <div className="seal-circle">
                  <span>ROAMLY</span>
                  <strong>★ 1 YR ★</strong>
                  <span>VERIFIED</span>
                </div>
              </div>

              <div className="persona-cta-wrap">
                <button
                  type="button"
                  className="btn-persona-share"
                  onClick={handleShare}
                >
                  {copiedShare ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{copiedShare ? 'Certificate Link Copied!' : 'Share Milestone Persona'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER BAR */}
      <footer className="rewind-page-footer">
        <div>
          <strong>Roamly 1-Year Journey Celebration</strong>
          <span>Here’s to the next 365 days of unexpected turns and beautiful coordinates.</span>
        </div>
        {onBack && (
          <button type="button" className="btn-footer-back" onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Return to Globe</span>
          </button>
        )}
      </footer>

      {/* PHOTO LIGHTBOX MODAL */}
      <dialog
        className="rewind-lightbox"
        ref={dialog}
        onClose={() => setCard(null)}
        onClick={e => {
          if (e.target === e.currentTarget) dialog.current?.close()
        }}
      >
        {card && (
          <div className="lightbox-inner">
            <button
              type="button"
              className="lightbox-close"
              autoFocus
              onClick={() => dialog.current?.close()}
              aria-label="Close postcard"
            >
              <X size={18} />
            </button>
            <div className="lightbox-photo-wrap">
              <img src={card.image} alt={card.title} />
            </div>
            <div className="lightbox-details">
              <h3>{card.title}</h3>
              <p className="lightbox-place">{card.place}</p>
              <p className="lightbox-caption">“{card.caption}”</p>
            </div>
          </div>
        )}
      </dialog>

    </section>
  )
}
