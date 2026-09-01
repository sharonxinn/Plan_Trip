import React, { useState } from 'react'
import {
  Zap, CloudRain, AlertTriangle, Clock, BatteryCharging,
  DollarSign, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw,
  Check, Sparkles, MapPin, Coffee, Compass, PhoneCall, Share2
} from 'lucide-react'

export default function StepPlanBStudio({
  destination,
  travellers,
  travelParty,
  departureDate,
  returnDate,
  durationDays,
  budgetAmount,
  basket = [],
  onApplyPlanB,
  onNextStep,
  onPrevStep
}) {
  const cityName = destination?.city || 'Kuala Lumpur'
  const countryName = destination?.country || 'Malaysia'

  // Active scenario: 'rain' | 'closed' | 'delayed' | 'tired' | 'budget'
  const [selectedScenario, setSelectedScenario] = useState('rain')
  const [isApplying, setIsApplying] = useState(false)
  const [appliedSuccess, setAppliedSuccess] = useState(false)
  const [customDisruption, setCustomDisruption] = useState('')
  const [copiedEmergencyMsg, setCopiedEmergencyMsg] = useState(false)
  const [customSolution, setCustomSolution] = useState(null)
  const [isSolvingCustom, setIsSolvingCustom] = useState(false)
  const [copiedCustomMsg, setCopiedCustomMsg] = useState(false)
  const [customAppliedToast, setCustomAppliedToast] = useState(false)

  // Handle Custom AI Contingency Generation
  const handleGenerateCustomEmergencyFix = async () => {
    if (!customDisruption.trim()) return
    setIsSolvingCustom(true)
    try {
      const res = await fetch('/api/ai/emergency-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: customDisruption.trim(),
          city: cityName,
          country: countryName,
          party: travelParty,
          durationDays,
          budgetAmount
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.solution) {
          setCustomSolution(data.solution)
        }
      }
    } catch (_err) {
      // Offline fallback NLP resolver
      const s = customDisruption.toLowerCase()
      setCustomSolution({
        title: `Custom Contingency: ${customDisruption.slice(0, 35)} in ${cityName}`,
        urgency: s.includes('passport') || s.includes('medical') ? 'High' : 'Moderate',
        summary: `Tailored real-time contingency plan for ${cityName}, ${countryName}.`,
        immediateActions: [
          `Head to nearest air-conditioned lounge or concierge in ${cityName}.`,
          `Address immediate mitigation for "${customDisruption}".`,
          `Notify squad members of temporary 45-min schedule adjustment.`,
          `Resume with low-stress dining near your hotel.`
        ],
        itineraryReroute: `Auto-pause current day schedule by 45 mins. Soften walking pace in ${cityName}.`,
        localSafetyResource: `${cityName} Tourist Information Center`,
        hotline: '📞 999 / 112 (Emergency Assistance)',
        whatsappBroadcastTemplate: `💡 [Squad Contingency Update]\nHandling "${customDisruption}" in ${cityName}. Schedule shifted by 45 mins, all good!`
      })
    } finally {
      setIsSolvingCustom(false)
    }
  }

  // Copy Custom Solution to WhatsApp
  const handleCopyCustomBroadcast = () => {
    if (!customSolution) return
    navigator.clipboard.writeText(customSolution.whatsappBroadcastTemplate)
    setCopiedCustomMsg(true)
    setTimeout(() => setCopiedCustomMsg(false), 2500)
  }

  // Apply Custom Solution to Itinerary
  const handleApplyCustomSolution = () => {
    if (onApplyPlanB) {
      onApplyPlanB({
        title: customSolution.title,
        desc: customSolution.summary
      })
    }
    setCustomAppliedToast(true)
    setTimeout(() => setCustomAppliedToast(false), 3000)
  }

  // Scenario presets definition
  const scenarios = [
    {
      id: 'rain',
      icon: CloudRain,
      title: 'Sudden Heavy Rain / Storm',
      badge: 'Weather Alert',
      color: 'blue',
      desc: 'Outdoor parks, walking streets and viewpoints are rained out.',
      impact: '3 Outdoor spots affected',
      solutionSummary: 'Instantly swaps outdoor walking with premier indoor museums, aquariums & covered artisan cafes within 1km.'
    },
    {
      id: 'closed',
      icon: AlertTriangle,
      title: 'Attraction Closed / Overbooked',
      badge: 'Venue Hiccup',
      color: 'amber',
      desc: 'Key planned landmark is unexpectedly closed for private event or tickets sold out.',
      impact: 'Morning schedule stalled',
      solutionSummary: 'Replaces with top-rated nearby alternative with matching cultural vibe and zero wait time.'
    },
    {
      id: 'delayed',
      icon: Clock,
      title: 'Flight Delayed / Heavy Traffic',
      badge: 'Transit Jam',
      color: 'purple',
      desc: 'Landed 2.5 hours late or stuck in major peak hour highway traffic.',
      impact: 'Day 1 afternoon missed',
      solutionSummary: 'Smart Schedule Compressor: reflows Day 1, trims lowest-priority spot, and extends sunset dining.'
    },
    {
      id: 'tired',
      icon: BatteryCharging,
      title: 'Travel Fatigue / Low Energy',
      badge: 'Pace Relaxer',
      color: 'emerald',
      desc: 'Group or kids are exhausted after long flights and intense morning walking.',
      impact: 'Energy level: 20%',
      solutionSummary: 'Swaps intense walking for high-tea cafe lounge, traditional spa wellness, or relaxing scenic river cruise.'
    },
    {
      id: 'budget',
      icon: DollarSign,
      title: 'Budget Alert / Squeeze',
      badge: 'Cost Saver',
      color: 'rose',
      desc: 'Spent more on shopping or flights, need to shave 20% off daily meals and tickets.',
      impact: 'Over budget by RM 350',
      solutionSummary: 'Swaps pricey dining for Michelin Bib Gourmand night market stalls & free scenic architectural landmarks.'
    }
  ]

  // Real Dynamic Destination-Aware Contingency Diffs
  const dynamicDiffs = React.useMemo(() => {
    const cityAttractions = destination?.attractions || []
    const cityRestaurants = destination?.restaurants || []
    
    // Find outdoor vs indoor spots from destination data
    const outdoorSpot = cityAttractions.find(a => a.category?.includes('Nature') || a.category?.includes('Parks') || a.category?.includes('Outdoor') || a.category?.includes('Landmark')) || cityAttractions[0] || { name: `${cityName} Landmark Park`, category: 'Outdoor' }
    const indoorSpot = cityAttractions.find(a => a.category?.includes('Museum') || a.category?.includes('Cultural') || a.category?.includes('Aquarium') || a.category?.includes('Art') || a.name !== outdoorSpot.name) || cityAttractions[1] || { name: `${cityName} National Museum & Gallery`, category: 'Indoor Museum' }
    const backupIndoor2 = cityAttractions[2] || { name: `${cityName} Discovery Centre`, category: 'Indoor Attraction' }
    
    const primeRest = cityRestaurants[0] || { name: `${cityName} Heritage Dining Room`, cuisine: 'Local', priceTier: '$$$' }
    const casualRest = cityRestaurants[1] || { name: `${cityName} Famous Hawker Arcade`, cuisine: 'Local Street Food', priceTier: '$' }
    const dinnerRest = cityRestaurants[2] || { name: `${cityName} Sunset Lounge`, cuisine: 'Fusion', priceTier: '$$' }

    return {
      rain: {
        originalDay: `Day 2 · ${cityName} Outdoor Exploration`,
        planA: [
          { time: '09:30 AM', title: outdoorSpot.name || `${cityName} Outdoor Heritage Walk`, type: outdoorSpot.category || 'Outdoor Landmark', tag: 'Rain Risk ⚠️' },
          { time: '01:00 PM', title: 'Open-Air Food Street Stalls', type: 'Outdoor Dining', tag: 'Exposed Seating ⚠️' },
          { time: '03:30 PM', title: cityAttractions[3]?.name || `${cityName} Scenic Park & Garden`, type: 'Outdoor Park', tag: 'Rain Risk ⚠️' }
        ],
        planB: [
          { time: '09:30 AM', title: indoorSpot.name || `${cityName} Arts Museum & Heritage Gallery`, type: 'Indoor Cultural', tag: '✅ 100% Covered & Dry', isSwap: true },
          { time: '01:00 PM', title: casualRest.name || `${cityName} Covered Food Arcade`, type: 'Covered Dining', tag: '✅ Air-Conditioned', isSwap: true },
          { time: '03:30 PM', title: backupIndoor2.name || `${cityName} Science & Aquarium Center`, type: 'Indoor Attraction', tag: '✅ Underground Link', isSwap: true }
        ],
        benefit: `Zero wet clothes, seamless indoor transit in ${cityName}, 0 minutes lost to rain.`
      },
      closed: {
        originalDay: `Day 1 · ${cityName} Hallmark Highlights`,
        planA: [
          { time: '10:00 AM', title: `${outdoorSpot.name} (Overbooked / Closed)`, type: 'Observation & Sight', tag: '❌ Sold Out Today' },
          { time: '02:00 PM', title: `${indoorSpot.name}`, type: 'Sightseeing', tag: 'Regular' }
        ],
        planB: [
          { time: '10:00 AM', title: backupIndoor2.name || `${cityName} Sky View Panorama Deck`, type: 'Observation Deck', tag: '✅ Instant Mobile QR Entry', isSwap: true },
          { time: '02:00 PM', title: indoorSpot.name || `${cityName} Cultural Square`, type: 'Sightseeing', tag: '✅ Confirmed & Open' }
        ],
        benefit: `Instant alternative booked nearby in ${cityName} with zero wait time.`
      },
      delayed: {
        originalDay: `Day 1 · Arrival & Check-In`,
        planA: [
          { time: '02:00 PM', title: 'Check into Hotel', type: 'Hotel', tag: 'Delayed' },
          { time: '03:30 PM', title: outdoorSpot.name, type: 'Activity', tag: '❌ Missed Opening Slot' },
          { time: '06:00 PM', title: 'Rushed Dinner', type: 'Dining', tag: 'Stressful' }
        ],
        planB: [
          { time: '04:30 PM', title: 'Express Hotel Check-In & Refresh', type: 'Hotel', tag: '✅ Rescheduled', isSwap: true },
          { time: '06:00 PM', title: dinnerRest.name || `${cityName} Sunset Dining Lounge`, type: 'Dining & Sunset View', tag: '✅ Merged & Relaxed', isSwap: true },
          { time: '08:30 PM', title: `${cityName} Night Market Promenade & Live Music`, type: 'Evening', tag: '✅ Extended Evening', isSwap: true }
        ],
        benefit: `Eliminates arrival rush, turns transit delay into a relaxed evening in ${cityName}.`
      },
      tired: {
        originalDay: `Day 3 · ${cityName} Exploration`,
        planA: [
          { time: '09:00 AM', title: 'High-Pace 15,000 Step Heritage Walking Tour', type: 'Intense Walking', tag: 'Exhausting' },
          { time: '02:00 PM', title: 'Multi-Site Hiking & Viewpoint Climb', type: 'Physical Activity', tag: 'High Fatigue' }
        ],
        planB: [
          { time: '10:30 AM', title: `${cityName} Scenic Tram Ride & Heritage Cafe`, type: 'Scenic & Low Effort', tag: '✅ 0 Steps Strenuous', isSwap: true },
          { time: '02:30 PM', title: `Traditional Wellness Spa & Reflexology Lounge`, type: 'Wellness Recovery', tag: '✅ Full Recharge', isSwap: true }
        ],
        benefit: 'Prevents travel burnout, restores energy for the evening.'
      },
      budget: {
        originalDay: `Day 2 · Dining & Activities`,
        planA: [
          { time: '01:00 PM', title: `Upscale Hotel Buffet at ${primeRest.name}`, type: 'Buffet', tag: 'RM 180 / pax' },
          { time: '07:30 PM', title: `Fine Dining Gourmet Experience`, type: 'Fine Dining', tag: 'RM 320 / pax' }
        ],
        planB: [
          { time: '01:00 PM', title: `Michelin Guide Bib Gourmand: ${casualRest.name}`, type: 'Authentic Local', tag: '✅ RM 20 / pax (Saved 88%)', isSwap: true },
          { time: '07:30 PM', title: `${cityName} Legendary Street Food & Satay Night Bazaar`, type: 'Food Trail', tag: '✅ RM 35 / pax (Top Rated 4.8★)', isSwap: true }
        ],
        benefit: `Saves over 80% on meals while tasting ${cityName}'s most authentic world-famous gastronomy.`
      }
    }
  }, [destination, cityName])

  const currentDiff = dynamicDiffs[selectedScenario] || dynamicDiffs.rain

  // Apply Plan B
  const handleApply = () => {
    setIsApplying(true)
    setTimeout(() => {
      setIsApplying(false)
      setAppliedSuccess(true)
      if (onApplyPlanB) onApplyPlanB(selectedScenario, currentDiff.planB)
      setTimeout(() => setAppliedSuccess(false), 4000)
    }, 800)
  }

  // Copy Emergency Squad Broadcast
  const handleCopyBroadcast = () => {
    const text = `🚨 PlanTrip Smart Update (${cityName})\nScenario: ${scenarios.find(s => s.id === selectedScenario)?.title}\nWe just updated our itinerary with Plan B! New schedule:\n${currentDiff.planB.map(p => `• ${p.time}: ${p.title} (${p.tag})`).join('\n')}\nRelax, everything is sorted with zero stress! 😎`
    navigator.clipboard.writeText(text)
    setCopiedEmergencyMsg(true)
    setTimeout(() => setCopiedEmergencyMsg(false), 2500)
  }

  return (
    <div className="container step-planb-clean-container fade-in">
      {/* SECTION TITLE & SCENARIOS */}
      <div className="setup-clean-heading-row">
        <div>
          <h1 className="step-clean-title">Plan B Contingency Studio</h1>
          <p className="step-clean-subtitle">
            Sudden rain, venue closure, or fatigue? 1-click swap your affected spots with zero stress.
          </p>
        </div>
      </div>

      {/* Scenario Pills */}
      <div className="scenarios-pills-row">
        {scenarios.map(s => {
          const Icon = s.icon
          const isSelected = selectedScenario === s.id
          return (
            <button
              key={s.id}
              className={`scenario-pill-btn ${isSelected ? 'active' : ''} ${s.color}`}
              onClick={() => {
                setSelectedScenario(s.id)
                setAppliedSuccess(false)
              }}
            >
              <Icon size={15} />
              <span className="scenario-btn-text">{s.title}</span>
            </button>
          )
        })}
      </div>

      {/* Main Diff & Actions Grid */}
      <div className="planb-main-grid">
        {/* Left Column: Side-by-Side Comparison (Plan A vs Plan B) */}
        <div className="setup-card planb-diff-card">
          <div className="card-header-row">
            <div className="card-icon-title">
              <RefreshCw className="text-cyan" size={20} />
              <h3>Real-Time Schedule Comparison</h3>
            </div>
            <span className="badge-highlight">{currentDiff.originalDay}</span>
          </div>

          <div className="diff-columns-wrapper">
            {/* Column Plan A (Disrupted) */}
            <div className="diff-col plan-a-col">
              <div className="diff-col-header plan-a">
                <span className="plan-tag-badge error">Plan A (Disrupted)</span>
                <span className="col-status-text">Problem Detected</span>
              </div>
              <div className="diff-items-list">
                {currentDiff.planA.map((item, idx) => (
                  <div key={idx} className="diff-item-tile plan-a-tile">
                    <div className="item-time-row">
                      <span className="time-badge">{item.time}</span>
                      <span className="problem-tag">{item.tag}</span>
                    </div>
                    <div className="item-title">{item.title}</div>
                    <div className="item-type">{item.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Transform Arrow */}
            <div className="diff-transform-indicator">
              <div className="transform-circle">
                <Zap size={18} className="text-cyan" />
              </div>
              <span className="transform-label">AI Re-route</span>
            </div>

            {/* Column Plan B (Optimized) */}
            <div className="diff-col plan-b-col">
              <div className="diff-col-header plan-b">
                <span className="plan-tag-badge success">Plan B (Smart Solution)</span>
                <span className="col-status-text text-emerald">Zero-Stress Optimized</span>
              </div>
              <div className="diff-items-list">
                {currentDiff.planB.map((item, idx) => (
                  <div key={idx} className="diff-item-tile plan-b-tile">
                    <div className="item-time-row">
                      <span className="time-badge success">{item.time}</span>
                      <span className="success-tag">{item.tag}</span>
                    </div>
                    <div className="item-title">{item.title}</div>
                    <div className="item-type">{item.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Benefit Summary */}
          <div className="planb-benefit-card">
            <div className="benefit-header">
              <ShieldCheck className="text-emerald" size={18} />
              <strong>Why This Plan B Works:</strong>
            </div>
            <p>{currentDiff.benefit}</p>
          </div>

          {/* Apply Plan B Button */}
          <div className="planb-actions-row">
            <button
              className={`apply-planb-btn ${appliedSuccess ? 'success' : ''}`}
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <RefreshCw size={18} className="spin" /> Optimizing Schedule...
                </>
              ) : appliedSuccess ? (
                <>
                  <Check size={18} /> Plan B Successfully Applied to Itinerary!
                </>
              ) : (
                <>
                  <Zap size={18} /> 1-Click Apply Plan B to My Trip
                </>
              )}
            </button>

            <button className="broadcast-squad-btn" onClick={handleCopyBroadcast}>
              {copiedEmergencyMsg ? <Check size={16} /> : <Share2 size={16} />}
              {copiedEmergencyMsg ? 'Copied WhatsApp Broadcast!' : 'Notify Squad via WhatsApp'}
            </button>
          </div>
        </div>

        {/* Right Column: Custom Disruption Helper & Local Safety Hotlines */}
        <div className="setup-card-stack">
          {/* Custom Disruption AI Assistant */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Sparkles className="text-cyan" size={20} />
                <h3>Custom Hiccup Solver</h3>
              </div>
              <span className="badge-highlight">AI Emergency Assistant</span>
            </div>

            <p className="section-note">
              Faced with something else? Type your situation below for an instant custom contingency solution:
            </p>

            <div className="custom-input-box">
              <textarea
                placeholder="e.g. Lost passport, kids crying for food at 3 PM, sudden sprained ankle in city center, phone battery dead..."
                value={customDisruption}
                onChange={e => setCustomDisruption(e.target.value)}
                className="custom-disruption-textarea"
                rows={3}
              />
              <button
                className="solve-custom-btn"
                disabled={!customDisruption.trim() || isSolvingCustom}
                onClick={handleGenerateCustomEmergencyFix}
              >
                {isSolvingCustom ? (
                  <>
                    <RefreshCw size={16} className="spin" /> Generating Tailored Contingency Plan...
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Generate Custom Emergency Fix
                  </>
                )}
              </button>
            </div>

            {/* Generated Custom AI Emergency Solution Card */}
            {customSolution && (
              <div className="custom-solution-result-card fade-in">
                <div className="solution-card-header">
                  <div className="solution-title-row">
                    <h4>{customSolution.title}</h4>
                    <span className={`urgency-badge ${customSolution.urgency?.toLowerCase()}`}>
                      🚨 {customSolution.urgency} Urgency
                    </span>
                  </div>
                  <p className="solution-summary-text">{customSolution.summary}</p>
                </div>

                {/* Immediate Sequential Action Checklist */}
                <div className="solution-steps-section">
                  <h5>⚡ Immediate Action Steps (First 15-30 Mins):</h5>
                  <div className="solution-checklist">
                    {customSolution.immediateActions?.map((step, idx) => (
                      <div key={idx} className="solution-checklist-item">
                        <span className="step-num-badge">{idx + 1}</span>
                        <span className="step-text">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itinerary Reroute Adjustment */}
                {customSolution.itineraryReroute && (
                  <div className="solution-reroute-box">
                    <div className="reroute-title-line">
                      <Compass size={15} className="text-cyan" />
                      <strong>Itinerary Adjustment:</strong>
                    </div>
                    <p>{customSolution.itineraryReroute}</p>
                  </div>
                )}

                {/* Emergency Contact Hub */}
                <div className="solution-contact-bar">
                  <div className="contact-resource-name">
                    <MapPin size={14} className="text-cyan" />
                    <span>{customSolution.localSafetyResource}</span>
                  </div>
                  <div className="contact-hotline-tag">{customSolution.hotline}</div>
                </div>

                {/* Action Buttons */}
                <div className="solution-actions-row">
                  <button
                    type="button"
                    className="btn-apply-custom-fix"
                    onClick={handleApplyCustomSolution}
                  >
                    <Zap size={15} />
                    {customAppliedToast ? '✅ Applied to Day Itinerary!' : 'Apply Contingency to Itinerary'}
                  </button>

                  <button
                    type="button"
                    className="btn-copy-custom-wa"
                    onClick={handleCopyCustomBroadcast}
                  >
                    {copiedCustomMsg ? <Check size={15} /> : <Share2 size={15} />}
                    {copiedCustomMsg ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Broadcast'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Local Emergency Hotlines & Peace of Mind */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <PhoneCall className="text-cyan" size={20} />
                <h3>Local Emergency Safety Card</h3>
              </div>
              <span className="badge-highlight">{cityName}, {countryName}</span>
            </div>

            <div className="emergency-hotlines-list">
              <div className="hotline-item">
                <div className="hotline-name">Police & Tourist Assistance</div>
                <div className="hotline-number">📞 999 / 112 (Toll Free)</div>
              </div>
              <div className="hotline-item">
                <div className="hotline-name">Medical & Ambulance Emergency</div>
                <div className="hotline-number">📞 999 (National Dispatch)</div>
              </div>
              <div className="hotline-item">
                <div className="hotline-name">Grab / Taxi 24/7 Support</div>
                <div className="hotline-number">🚗 In-App Emergency Button</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Step Actions */}
      <div className="step-bottom-bar">
        <button className="step-back-btn" onClick={onPrevStep}>
          <ArrowLeft size={18} /> Back to Step 3: Discover & Schedule
        </button>
        <div className="step-summary-text">
          Contingency Mode: <strong>{scenarios.find(s => s.id === selectedScenario)?.title}</strong> Ready
        </div>
        <button className="step-next-primary-btn" onClick={onNextStep}>
          Proceed to Step 5: Group Room <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
