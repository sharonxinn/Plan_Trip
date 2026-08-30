import React, { useState } from 'react'
import {
  Clock, MapPin, Navigation, ExternalLink, Share2, Copy,
  Check, Car, Sparkles, RefreshCw, Calendar, Utensils,
  Coffee, ShieldCheck, Flame, ArrowRight, Download
} from 'lucide-react'

export default function SmartRouteTimeline({
  smartItinerary,
  destination,
  onReopenWizard,
  onAddToBasket
}) {
  if (!smartItinerary || !smartItinerary.days || smartItinerary.days.length === 0) {
    return null
  }

  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false)

  const cityName = destination?.city || 'Ipoh'
  const countryName = destination?.country || 'Malaysia'
  const activeDay = smartItinerary.days[activeDayIndex] || smartItinerary.days[0]

  // Copy WhatsApp Run-sheet for current day or entire trip
  const handleCopyWhatsApp = () => {
    let msg = `🌴 *${cityName}, ${countryName} Smart Route Itinerary!* 🚗\n`
    msg += `📍 *Starting Hub:* ${smartItinerary.startingPoint?.name || cityName}\n`
    msg += `📅 *Total Days:* ${smartItinerary.totalDays} Days · ${smartItinerary.totalSpotsScheduled} Spots · Total ${smartItinerary.totalEstimatedKm} km (Optimized No-Backtrack)\n\n`

    smartItinerary.days.forEach(day => {
      msg += `📌 *${day.title}* (${day.dayTotalKm} km)\n`
      day.spots.forEach(s => {
        const icon = s.type === 'restaurant' ? '🍽️' : s.category?.includes('Cafe') ? '☕' : s.type === 'start_hub' ? '🚩' : '🏛️'
        msg += `  ${icon} *${s.arriveTime || s.timeSlot}* - ${s.name}\n`
        if (s.transitToNextMinutes > 0 && s.transitToNextKm > 0) {
          msg += `     └── 🚗 Drive ${s.transitToNextMinutes} mins (${s.transitToNextKm} km)\n`
        }
      })
      if (day.googleMapsMultiStopUrl) {
        msg += `  🗺️ Google Maps Navigation: ${day.googleMapsMultiStopUrl}\n`
      }
      msg += `\n`
    })

    navigator.clipboard.writeText(msg)
    setCopiedWhatsApp(true)
    setTimeout(() => setCopiedWhatsApp(false), 2500)
  }

  return (
    <div className="smart-route-timeline-container fade-in">
      {/* HEADER BANNER */}
      <div className="timeline-hero-header">
        <div className="hero-left-info">
          <div className="route-badge-row">
            <span className="route-smart-badge">⚡ Smart Route Generated</span>
            <span className="route-dist-badge">🚗 Total {smartItinerary.totalEstimatedKm} km (No Backtrack)</span>
            <span className="route-hub-badge">🚩 Start: {smartItinerary.startingPoint?.name || 'Central Hub'}</span>
          </div>
          <h2 className="timeline-main-title">
            {cityName} {smartItinerary.totalDays}-Day Optimized Smart Schedule
          </h2>
          <p className="timeline-main-subtitle">
            Every spot sequenced by nearest-neighbor GPS coordinates and dining/activity opening windows.
          </p>
        </div>

        <div className="hero-action-buttons">
          <button className="btn-timeline-action" onClick={handleCopyWhatsApp}>
            {copiedWhatsApp ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            <span>{copiedWhatsApp ? 'Copied WhatsApp!' : 'Copy WhatsApp Plan'}</span>
          </button>
          <button className="btn-timeline-action highlight" onClick={onReopenWizard}>
            <RefreshCw size={16} />
            <span>Re-Generate Route</span>
          </button>
        </div>
      </div>

      {/* DAY TABS BAR */}
      <div className="timeline-day-tabs-bar">
        {smartItinerary.days.map((day, idx) => (
          <button
            key={day.dayNumber}
            className={`timeline-day-tab ${activeDayIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveDayIndex(idx)}
          >
            <div className="day-tab-num">Day {day.dayNumber}</div>
            <div className="day-tab-meta">{day.spots.length} stops · {day.dayTotalKm} km</div>
          </button>
        ))}
      </div>

      {/* ACTIVE DAY TIMELINE VIEW */}
      <div className="timeline-day-content">
        {/* DAY SUMMARY & GOOGLE MAPS NAVIGATION DEEP-LINK */}
        <div className="day-summary-banner">
          <div className="day-summary-text">
            <h3>{activeDay.title}</h3>
            <span>{activeDay.spots.length} curated stops sequenced for minimal driving and 0 back-tracking.</span>
          </div>

          {activeDay.googleMapsMultiStopUrl && (
            <a
              href={activeDay.googleMapsMultiStopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-google-maps-route"
            >
              <Navigation size={16} />
              <span>Open Day {activeDay.dayNumber} Route in Google Maps</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* TIMELINE SPOTS STREAM */}
        <div className="timeline-stream-wrap">
          {activeDay.spots.map((spot, spotIdx) => {
            const isStart = spot.type === 'start_hub'
            const isDining = spot.type === 'restaurant' || spot.category?.includes('Dining') || spot.cuisine || spot.category?.includes('Cafe')

            return (
              <div key={spot.id || spotIdx} className="timeline-step-block">
                {/* STEP CARD */}
                <div className={`timeline-spot-card ${isStart ? 'start-hub' : isDining ? 'dining-spot' : 'sight-spot'}`}>
                  {/* Left Column: Sequence Number & Time Slot */}
                  <div className="spot-time-col">
                    <span className="step-number-circle">{spot.stepNumber || '🚩'}</span>
                    <span className="spot-clock-text">{spot.arriveTime || spot.timeSlot}</span>
                    {spot.stayDurationMins && (
                      <span className="stay-duration-tag">~{spot.stayDurationMins} mins</span>
                    )}
                  </div>

                  {/* Middle Column: Spot Info */}
                  <div className="spot-details-col">
                    <div className="spot-title-row">
                      <h4 className="spot-name-text">{spot.name}</h4>
                      {spot.suggestedBy && (
                        <span className="suggested-by-pill">
                          👤 Suggested by {spot.suggestedBy}
                        </span>
                      )}
                    </div>

                    <div className="spot-category-row">
                      <span className="spot-cat-pill">{spot.category || spot.type}</span>
                      {spot.rating && (
                        <span className="spot-rating-pill">★ {typeof spot.rating === 'number' ? spot.rating.toFixed(1) : spot.rating}</span>
                      )}
                      {spot.priceRange && (
                        <span className="spot-price-pill">{spot.priceRange}</span>
                      )}
                    </div>

                    {spot.notes && (
                      <p className="spot-notes-text">{spot.notes}</p>
                    )}
                    {spot.description && (
                      <p className="spot-desc-text">{spot.description}</p>
                    )}
                  </div>

                  {/* Right Column: Thumbnail */}
                  {spot.image && (
                    <div
                      className="spot-thumbnail"
                      style={{ backgroundImage: `url(${spot.image})` }}
                    />
                  )}
                </div>

                {/* TRANSIT CONNECTOR LINE & DRIVING DISTANCE */}
                {spot.transitToNextMinutes > 0 && (
                  <div className="transit-connector-row">
                    <div className="transit-line" />
                    <div className="transit-pill-badge">
                      <Car size={13} />
                      <span>Drive {spot.transitToNextMinutes} mins · {spot.transitToNextKm} km (Smooth Route)</span>
                    </div>
                    <div className="transit-line" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
