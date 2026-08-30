import React, { useState, useEffect } from 'react'
import {
  Sparkles, Calendar, Clock, MapPin, Check, ArrowRight,
  ArrowLeft, Sliders, ShieldCheck, Zap, X, Star, Utensils
} from 'lucide-react'
import { generateSmartItinerary } from './utils/routeOptimizer'

export default function SmartRouteWizard({
  isOpen,
  onClose,
  destination,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  durationDays,
  bucketList = [],
  onGeneratedRoute
}) {
  if (!isOpen) return null

  const cityName = destination?.city || 'Penang'
  const countryName = destination?.country || 'Malaysia'

  // Wizard Sub-Step: 1 | 2 | 3
  const [wizardStep, setWizardStep] = useState(1)

  // Step 2: Confirmed Spots Configuration
  const [selectedSpotsConfig, setSelectedSpotsConfig] = useState(() => {
    return bucketList.map(item => ({
      ...item,
      confirmed: true,
      isMustVisit: true,
      assignedDay: 'auto' // 'auto' | '1' | '2' | '3' ...
    }))
  })

  // Synchronize when bucketList or modal opens
  useEffect(() => {
    if (bucketList && bucketList.length > 0) {
      setSelectedSpotsConfig(bucketList.map(item => ({
        ...item,
        confirmed: true,
        isMustVisit: item.isMustVisit ?? true,
        assignedDay: item.assignedDay || 'auto'
      })))
    }
  }, [bucketList, isOpen])

  // Step 3: Starting Point & Arrival Time
  const defaultHubs = {
    'Ipoh': { name: 'Ipoh Railway Station', lat: 4.5975, lng: 101.0734 },
    'Penang': { name: 'Penang Sentral / Georgetown Ferry Hub', lat: 5.4164, lng: 100.3327 },
    'Kuala Lumpur': { name: 'KL Sentral / KLIA Terminal 1', lat: 3.1343, lng: 101.6865 },
    'Tokyo': { name: 'Tokyo Station / Haneda Airport', lat: 35.6812, lng: 139.7671 },
    'Bangkok': { name: 'Suvarnabhumi Airport / Siam Center', lat: 13.7563, lng: 100.5018 }
  }

  const defaultHub = (cityName && defaultHubs[cityName]) || (cityName && Object.keys(defaultHubs).find(k => cityName.includes(k)) && defaultHubs[Object.keys(defaultHubs).find(k => cityName.includes(k))]) || {
    name: `${cityName} Central Station / Arrival Hub`,
    lat: destination?.lat || 5.4164,
    lng: destination?.lng || 100.3327
  }

  const [startingPointName, setStartingPointName] = useState(defaultHub.name)
  const [arrivalTimeStr, setArrivalTimeStr] = useState('10:00 AM')
  const [pace, setPace] = useState('balanced') // 'relaxed' | 'balanced' | 'packed'
  const [isGenerating, setIsGenerating] = useState(false)

  // Synchronize starting point when destination changes
  useEffect(() => {
    setStartingPointName(defaultHub.name)
  }, [destination?.city])

  // Toggle Spot Confirmation
  const toggleSpotConfirmed = (id) => {
    setSelectedSpotsConfig(prev => prev.map(s => s.id === id ? { ...s, confirmed: !s.confirmed } : s))
  }

  // Toggle Must-Visit
  const toggleMustVisit = (id) => {
    setSelectedSpotsConfig(prev => prev.map(s => s.id === id ? { ...s, isMustVisit: !s.isMustVisit } : s))
  }

  // Change Assigned Day
  const handleAssignDay = (id, dayVal) => {
    setSelectedSpotsConfig(prev => prev.map(s => s.id === id ? { ...s, assignedDay: dayVal } : s))
  }

  // 1-Click AI Auto Assign
  const handleAIAutoAssign = () => {
    const days = Math.max(1, durationDays)
    setSelectedSpotsConfig(prev => prev.map((s, idx) => ({
      ...s,
      confirmed: true,
      assignedDay: ((idx % days) + 1).toString()
    })))
  }

  // Generate Smart Route Execution
  const handleExecuteGeneration = () => {
    setIsGenerating(true)
    const confirmedItems = selectedSpotsConfig.filter(s => s.confirmed)

    setTimeout(() => {
      const result = generateSmartItinerary({
        durationDays,
        startingPoint: {
          name: startingPointName,
          lat: destination?.lat || defaultHub.lat,
          lng: destination?.lng || defaultHub.lng
        },
        arrivalTimeStr,
        confirmedItems,
        pace
      })

      onGeneratedRoute(result)
      setIsGenerating(false)
      onClose()
    }, 700)
  }

  return (
    <div className="smart-wizard-backdrop" onClick={onClose}>
      <div className="smart-wizard-modal" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="wizard-header-row">
          <div className="wizard-title-group">
            <div className="wizard-icon-badge">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="wizard-modal-title">⚡ Generate Smart Route</h2>
              <p className="wizard-subtitle">
                3-Step non-backtracking route optimization for {cityName}, {countryName}
              </p>
            </div>
          </div>
          <button className="wizard-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 3-STEP PROGRESS STEPPER */}
        <div className="wizard-stepper-bar">
          <div className={`wizard-step-node ${wizardStep >= 1 ? 'active' : ''} ${wizardStep === 1 ? 'current' : ''}`}>
            <span className="step-badge">1</span>
            <span className="step-title">Dates & Duration</span>
          </div>
          <div className="wizard-step-line" />
          <div className={`wizard-step-node ${wizardStep >= 2 ? 'active' : ''} ${wizardStep === 2 ? 'current' : ''}`}>
            <span className="step-badge">2</span>
            <span className="step-title">Confirm Bucket List</span>
          </div>
          <div className="wizard-step-line" />
          <div className={`wizard-step-node ${wizardStep >= 3 ? 'active' : ''} ${wizardStep === 3 ? 'current' : ''}`}>
            <span className="step-badge">3</span>
            <span className="step-title">Start Hub & Time</span>
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="wizard-body-content">
          {/* ================= STEP 1: DATES & DURATION ================= */}
          {wizardStep === 1 && (
            <div className="wizard-step-panel fade-in">
              <h3 className="panel-section-title">📅 Step 1: Input Travel Dates & Duration</h3>
              <p className="panel-section-desc">
                Select your departure and return dates. The engine will balance daily paces automatically.
              </p>

              <div className="dates-inputs-grid">
                <div className="date-input-box">
                  <label>Departure Date</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={e => onDepartureDateChange(e.target.value)}
                    className="wizard-date-input"
                  />
                </div>
                <div className="date-input-box">
                  <label>Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => onReturnDateChange(e.target.value)}
                    className="wizard-date-input"
                  />
                </div>
              </div>

              <div className="duration-highlight-card">
                <div className="duration-pill">
                  <strong>{durationDays} Days · {Math.max(1, durationDays - 1)} Nights ({durationDays}D{Math.max(1, durationDays - 1)}N)</strong>
                </div>
                <span>✨ Destination: <strong>{cityName}, {countryName}</strong></span>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CONFIRM & ASSIGN BUCKET LIST ================= */}
          {wizardStep === 2 && (
            <div className="wizard-step-panel fade-in">
              <div className="panel-header-flex">
                <div>
                  <h3 className="panel-section-title">📍 Step 2: Confirm Places Dropped in Chat</h3>
                  <p className="panel-section-desc">
                    Check off which spots are Must-Visit, assign specific days, or click AI Auto-Assign.
                  </p>
                </div>
                <button className="btn-ai-auto-assign" onClick={handleAIAutoAssign}>
                  <Sparkles size={14} /> AI Auto-Assign
                </button>
              </div>

              <div className="wizard-spots-list">
                {selectedSpotsConfig.map(spot => (
                  <div key={spot.id} className={`wizard-spot-row ${spot.confirmed ? 'confirmed' : 'unconfirmed'}`}>
                    <label className="spot-checkbox-label">
                      <input
                        type="checkbox"
                        checked={spot.confirmed}
                        onChange={() => toggleSpotConfirmed(spot.id)}
                        className="spot-checkbox"
                      />
                      <div className="spot-info-col">
                        <div className="spot-title-line">
                          <strong>{spot.name}</strong>
                          {spot.suggestedBy && (
                            <span className="spot-suggester-tag">👤 {spot.suggestedBy}</span>
                          )}
                        </div>
                        <span className="spot-cat-text">{spot.category || spot.type}</span>
                      </div>
                    </label>

                    {spot.confirmed && (
                      <div className="spot-controls-group">
                        <button
                          type="button"
                          className={`btn-must-visit-toggle ${spot.isMustVisit ? 'active' : ''}`}
                          onClick={() => toggleMustVisit(spot.id)}
                          title="Mark as Must-Visit"
                        >
                          <Star size={13} fill={spot.isMustVisit ? '#f59e0b' : 'none'} color={spot.isMustVisit ? '#f59e0b' : '#94a3b8'} />
                          <span>{spot.isMustVisit ? 'Must-Visit ⭐' : 'Optional'}</span>
                        </button>

                        <select
                          value={spot.assignedDay}
                          onChange={e => handleAssignDay(spot.id, e.target.value)}
                          className="spot-day-select"
                        >
                          <option value="auto">🤖 AI Auto-Assign</option>
                          {Array.from({ length: durationDays }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d.toString()}>Day {d}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 3: STARTING POINT & ARRIVAL TIME ================= */}
          {wizardStep === 3 && (
            <div className="wizard-step-panel fade-in">
              <h3 className="panel-section-title">🚀 Step 3: Starting Point Hub & Arrival Time</h3>
              <p className="panel-section-desc">
                The engine will optimize sequence from this hub with zero backtracking and synchronized opening hours!
              </p>

              <div className="form-group-field">
                <label>Starting Point / Arrival Hub</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="text-cyan input-icon" />
                  <input
                    type="text"
                    value={startingPointName}
                    onChange={e => setStartingPointName(e.target.value)}
                    placeholder={`e.g. ${cityName} Railway Station, Airport, or Hotel...`}
                    className="wizard-text-input"
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-field">
                  <label>Day 1 Arrival / Start Time</label>
                  <div className="input-with-icon">
                    <Clock size={16} className="text-amber input-icon" />
                    <select
                      value={arrivalTimeStr}
                      onChange={e => setArrivalTimeStr(e.target.value)}
                      className="wizard-select"
                    >
                      <option value="08:00 AM">08:00 AM (Early Bird Morning)</option>
                      <option value="09:00 AM">09:00 AM (Standard Morning)</option>
                      <option value="10:00 AM">10:00 AM (Recommended 10:00 AM)</option>
                      <option value="11:30 AM">11:30 AM (Pre-Lunch Arrival)</option>
                      <option value="01:30 PM">01:30 PM (Afternoon Arrival)</option>
                      <option value="03:30 PM">03:30 PM (Late Afternoon Check-In)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-field">
                  <label>Trip Pace</label>
                  <div className="input-with-icon">
                    <Sliders size={16} className="text-cyan input-icon" />
                    <select
                      value={pace}
                      onChange={e => setPace(e.target.value)}
                      className="wizard-select"
                    >
                      <option value="relaxed">☕ Relaxed (2-3 spots/day)</option>
                      <option value="balanced">⚡ Balanced (4 spots/day)</option>
                      <option value="packed">🚀 Packed (5-6 spots/day)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="smart-optimizer-summary-box">
                <div className="summary-icon-title">
                  <Zap size={18} className="text-cyan" />
                  <strong>Smart Routing Engine Ready:</strong>
                </div>
                <ul>
                  <li>✅ Nearest-Neighbor spatial distance sequencing (zero backtracking).</li>
                  <li>✅ Synchronized meal and activity time slots (Breakfast ➔ Morning Sights ➔ Lunch ➔ Cafe/Indoor ➔ Sunset ➔ Dinner).</li>
                  <li>✅ 1-Click Multi-Stop Google Maps navigation deep links!</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="wizard-footer-row">
          {wizardStep > 1 ? (
            <button className="btn-wizard-back" onClick={() => setWizardStep(prev => prev - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button className="btn-wizard-cancel" onClick={onClose}>
              Cancel
            </button>
          )}

          {wizardStep < 3 ? (
            <button className="btn-wizard-next" onClick={() => setWizardStep(prev => prev + 1)}>
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn-wizard-generate-execute"
              onClick={handleExecuteGeneration}
              disabled={isGenerating}
            >
              {isGenerating ? <Zap size={16} className="spin" /> : <Sparkles size={16} />}
              {isGenerating ? 'Calculating Optimal Route...' : '⚡ Generate Smart Route'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
