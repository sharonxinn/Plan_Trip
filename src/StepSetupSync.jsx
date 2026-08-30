import React, { useState } from 'react'
import {
  MapPin, Calendar, Users, User, Heart, Users2, Sparkles,
  Check, ArrowRight, Sliders, Coffee, Compass, Utensils,
  ShieldCheck, Zap, Vote, HelpCircle, AlertCircle, Plus, Trash2
} from 'lucide-react'

export default function StepSetupSync({
  selectedCountry,
  selectedCity,
  onSelectCountry,
  onSelectCity,
  countriesData,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  durationDays,
  travelParty,
  onPartyChange,
  travellers,
  setTravellers,
  budgetTier,
  setBudgetTier,
  travelPace,
  setTravelPace,
  groupPreferences,
  setGroupPreferences,
  members,
  setMembers,
  bucketListCount = 0,
  onOpenLinkCollector,
  onOpenSmartRouteWizard,
  onNextStep
}) {
  const [activeSubTab, setActiveSubTab] = useState('basics') // 'basics' | 'group-poll' | 'vibe'
  const [newMemberName, setNewMemberName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Party presets
  const partyPresets = [
    { id: 'solo', label: 'Solo Explorer', icon: User, defaultCount: 1, desc: 'Maximum freedom & fast planning' },
    { id: 'couple', label: 'Couple / Romantic', icon: Heart, defaultCount: 2, desc: 'Scenic spots, romantic dining & sunsets' },
    { id: 'family', label: 'Family with Kids', icon: Users2, defaultCount: 4, desc: 'Kid-friendly, relaxed pacing & safety' },
    { id: 'friends', label: 'Friends Squad', icon: Users, defaultCount: 4, desc: 'Activities, group dining & nightlife' }
  ]

  // Vibe tags
  const vibeOptions = [
    { id: 'foodie', label: '🍜 Food & Street Eats', icon: Utensils, desc: 'Must-try local dishes & cafes' },
    { id: 'culture', label: '🏛️ Heritage & Culture', icon: Compass, desc: 'Museums, temples & landmarks' },
    { id: 'nature', label: '🌿 Nature & Scenic Views', icon: Sparkles, desc: 'Parks, viewpoints & beaches' },
    { id: 'adventure', label: '⚡ Thrills & Theme Parks', icon: Zap, desc: 'Rides, outdoor activities & sports' },
    { id: 'shopping', label: '🛍️ Shopping & Markets', icon: Sliders, desc: 'Night markets, boutiques & malls' },
    { id: 'relaxed', label: '☕ Chill & Cafe Hopping', icon: Coffee, desc: 'Low stress, slow morning walks' }
  ]

  // Dietary options
  const dietaryOptions = ['Halal Friendly', 'Vegetarian', 'Vegan', 'No Seafood', 'No Pork', 'Gluten Free']

  // Handle vibe toggle
  const toggleVibe = vibeId => {
    setGroupPreferences(prev => {
      const vibes = prev.vibes || []
      const updated = vibes.includes(vibeId)
        ? vibes.filter(v => v !== vibeId)
        : [...vibes, vibeId]
      return { ...prev, vibes: updated }
    })
  }

  // Handle dietary toggle
  const toggleDietary = diet => {
    setGroupPreferences(prev => {
      const dietary = prev.dietary || []
      const updated = dietary.includes(diet)
        ? dietary.filter(d => d !== diet)
        : [...dietary, diet]
      return { ...prev, dietary: updated }
    })
  }

  // Add member
  const handleAddMember = e => {
    e.preventDefault()
    if (!newMemberName.trim()) return
    const newM = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      avatar: ['🧑', '👩', '👱‍♂️', '👩‍🦰', '🧔'][members.length % 5],
      votedVibes: ['foodie', 'relaxed'],
      dietary: 'None',
      budgetRange: 'Balanced'
    }
    setMembers([...members, newM])
    setTravellers(members.length + 1)
    setNewMemberName('')
  }

  // Remove member
  const handleRemoveMember = id => {
    if (members.length <= 1) return
    const updated = members.filter(m => m.id !== id)
    setMembers(updated)
    setTravellers(updated.length)
  }

  // Filter destinations
  const filteredPlaces = (selectedCountry?.places || []).filter(p =>
    !searchQuery || p.city.toLowerCase().includes(searchQuery.toLowerCase()) || p.tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate consensus alignment score
  const alignmentScore = travelParty === 'solo' ? 100 : 94

  return (
    <div className="step-setup-sync-container fade-in">
      {/* Step Header Banner */}
      <div className="step-hero-card">
        <div className="step-badge-row">
          <span className="step-pill-number">Step 1 of 6</span>
          <span className="step-pill-tag">✈️ Trip Setup & Group Sync</span>
          {travelParty === 'solo' ? (
            <span className="step-mode-pill solo">⚡ Solo Explorer Mode</span>
          ) : (
            <span className="step-mode-pill group">👥 Group Squad Mode ({members.length} synced)</span>
          )}
        </div>

        <h1 className="step-main-title">
          Where & How are you travelling?
        </h1>
        <p className="step-subtitle">
          Start by picking your destination and dates. For groups, sync preferences upfront to prevent travel debates and build an itinerary everyone loves.
        </p>

        {/* Sub Navigation Tabs */}
        <div className="sub-tab-group">
          <button
            className={`sub-tab-btn ${activeSubTab === 'basics' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('basics')}
          >
            <MapPin size={16} />
            1. Destination & Dates
          </button>
          <button
            className={`sub-tab-btn ${activeSubTab === 'vibe' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('vibe')}
          >
            <Sparkles size={16} />
            2. Trip Style & Pace
          </button>
          {travelParty !== 'solo' && (
            <button
              className={`sub-tab-btn ${activeSubTab === 'group-poll' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('group-poll')}
            >
              <Vote size={16} />
              3. Group Sync & Poll ({alignmentScore}% Match)
            </button>
          )}
        </div>
      </div>

      {/* SUB TAB 1: BASICS (DESTINATION & DATES & PARTY) */}
      {activeSubTab === 'basics' && (
        <div className="setup-grid">
          {/* Left Column: Destination Selector */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <MapPin className="text-cyan" size={20} />
                <h3>Choose Destination</h3>
              </div>
              <span className="badge-highlight">{selectedCity.city}, {selectedCountry.country}</span>
            </div>

            {/* Country Selector Pills */}
            <div className="country-pills-scroll">
              {countriesData.map(c => (
                <button
                  key={c.code}
                  className={`country-pill-btn ${selectedCountry.code === c.code ? 'active' : ''}`}
                  onClick={() => onSelectCountry(c)}
                >
                  <span className="country-flag">{c.flag}</span>
                  <span className="country-name">{c.country}</span>
                </button>
              ))}
            </div>

            {/* City Grid */}
            <div className="city-selector-grid">
              {filteredPlaces.map(place => {
                const isSelected = selectedCity.city === place.city
                return (
                  <div
                    key={place.id || place.city}
                    className={`city-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectCity(place, selectedCountry)}
                  >
                    <img src={place.image} alt={place.city} className="city-card-img" />
                    <div className="city-card-overlay">
                      <div className="city-card-tag">{place.tag}</div>
                      <div className="city-card-name">{place.city}</div>
                      <div className="city-card-sub">{place.state || selectedCountry.country}</div>
                    </div>
                    {isSelected && (
                      <div className="selected-check-badge">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Travel Party & Dates */}
          <div className="setup-card-stack">
            {/* Travel Party Type */}
            <div className="setup-card">
              <div className="card-header-row">
                <div className="card-icon-title">
                  <Users className="text-cyan" size={20} />
                  <h3>Travel Party</h3>
                </div>
                <span className="badge-counter">{travellers} {travellers === 1 ? 'Person' : 'People'}</span>
              </div>

              <div className="party-presets-grid">
                {partyPresets.map(p => {
                  const Icon = p.icon
                  const isSelected = travelParty === p.id
                  return (
                    <button
                      key={p.id}
                      className={`party-preset-card ${isSelected ? 'active' : ''}`}
                      onClick={() => onPartyChange(p.id)}
                    >
                      <div className="preset-icon-wrap">
                        <Icon size={20} />
                      </div>
                      <div className="preset-info">
                        <div className="preset-label">{p.label}</div>
                        <div className="preset-desc">{p.desc}</div>
                      </div>
                      {isSelected && <Check size={16} className="text-cyan preset-check" />}
                    </button>
                  )
                })}
              </div>

              {/* Number of travellers adjustment */}
              <div className="travellers-stepper-row">
                <span className="stepper-label">Total Travellers:</span>
                <div className="stepper-controls">
                  <button
                    className="step-circle-btn"
                    disabled={travellers <= 1}
                    onClick={() => setTravellers(Math.max(1, travellers - 1))}
                  >
                    -
                  </button>
                  <span className="step-count-display">{travellers} Pax</span>
                  <button
                    className="step-circle-btn"
                    onClick={() => setTravellers(travellers + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Travel Dates & Duration */}
            <div className="setup-card">
              <div className="card-header-row">
                <div className="card-icon-title">
                  <Calendar className="text-cyan" size={20} />
                  <h3>Dates & Duration</h3>
                </div>
                <span className="badge-duration">{durationDays} Days / {Math.max(1, durationDays - 1)} Nights</span>
              </div>

              <div className="date-inputs-row">
                <div className="date-input-field">
                  <label>Departure Date</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={e => onDepartureDateChange(e.target.value)}
                    className="custom-date-input"
                  />
                </div>
                <div className="date-input-field">
                  <label>Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => onReturnDateChange(e.target.value)}
                    className="custom-date-input"
                  />
                </div>
              </div>

              {/* Quick duration presets */}
              <div className="quick-duration-chips">
                <span className="quick-dur-label">Quick Set:</span>
                {[3, 4, 5, 7, 10].map(days => (
                  <button
                    key={days}
                    className={`dur-chip-btn ${durationDays === days ? 'active' : ''}`}
                    onClick={() => {
                      const d1 = new Date(departureDate)
                      const d2 = new Date(d1.getTime() + days * 86400000)
                      onReturnDateChange(d2.toISOString().split('T')[0])
                    }}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* 群聊自动收藏 & 智能行程生成器 Launch Card */}
            <div className="setup-card link-collector-promo-card">
              <div className="card-header-row">
                <div className="card-icon-title">
                  <Sparkles className="text-cyan" size={20} />
                  <h3>群聊自动收藏 & 一键生成行程</h3>
                </div>
                <span className="badge-highlight">{bucketListCount || 5} Spots Collected</span>
              </div>
              <p className="promo-desc-text">
                丢 Google Maps 链接或粘贴整段 WhatsApp 聊天记录，App 自动提取存入心愿单，一键生成不走回头路的优化行程！
              </p>
              <div className="promo-buttons-row">
                <button
                  type="button"
                  className="btn-promo-collector"
                  onClick={onOpenLinkCollector}
                >
                  🔗 打开群聊收藏 (Link Collector)
                </button>
                <button
                  type="button"
                  className="btn-promo-smart-route"
                  onClick={onOpenSmartRouteWizard}
                >
                  ⚡ 一键生成智能行程 (Smart Route)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: VIBE & PACE */}
      {activeSubTab === 'vibe' && (
        <div className="setup-vibe-container">
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Sparkles className="text-cyan" size={20} />
                <h3>Trip Vibes & Focus Areas</h3>
              </div>
              <span className="badge-highlight">{(groupPreferences.vibes || []).length} Selected</span>
            </div>
            <p className="section-note">
              Select all styles that fit this trip. The AI itinerary builder will weight attractions and dining according to your selection.
            </p>

            <div className="vibes-grid">
              {vibeOptions.map(v => {
                const isSelected = (groupPreferences.vibes || []).includes(v.id)
                return (
                  <button
                    key={v.id}
                    className={`vibe-card ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleVibe(v.id)}
                  >
                    <div className="vibe-title-row">
                      <span className="vibe-label">{v.label}</span>
                      {isSelected && <Check size={16} className="text-cyan" />}
                    </div>
                    <p className="vibe-desc">{v.desc}</p>
                  </button>
                )
              })}
            </div>

            {/* Travel Pace Selector */}
            <div className="pace-section">
              <h4>Daily Travel Pace</h4>
              <div className="pace-options-row">
                {[
                  { id: 'relaxed', label: '☕ Relaxed & Slow', desc: '2-3 spots/day, sleep in, ample cafe breaks' },
                  { id: 'moderate', label: '⚖️ Balanced Pace', desc: '4-5 spots/day, good mix of sights & rest' },
                  { id: 'packed', label: '🚀 Action Packed', desc: '6+ spots/day, maximize every hour' }
                ].map(p => (
                  <button
                    key={p.id}
                    className={`pace-card ${travelPace === p.id ? 'active' : ''}`}
                    onClick={() => setTravelPace(p.id)}
                  >
                    <div className="pace-title">{p.label}</div>
                    <div className="pace-desc">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="dietary-section">
              <h4>Dietary & Dining Preferences</h4>
              <div className="dietary-chips-wrap">
                {dietaryOptions.map(diet => {
                  const isChecked = (groupPreferences.dietary || []).includes(diet)
                  return (
                    <button
                      key={diet}
                      className={`dietary-chip ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleDietary(diet)}
                    >
                      {isChecked ? '✓ ' : '+ '} {diet}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: GROUP SYNC & POLL */}
      {activeSubTab === 'group-poll' && travelParty !== 'solo' && (
        <div className="setup-card group-poll-container">
          <div className="card-header-row">
            <div className="card-icon-title">
              <Vote className="text-cyan" size={20} />
              <h3>Group Squad Preferences Sync</h3>
            </div>
            <div className="consensus-badge">
              <Sparkles size={14} className="text-amber" />
              <span>{alignmentScore}% Squad Alignment</span>
            </div>
          </div>
          <p className="section-note">
            Add your fellow travellers and sync their preferences upfront so no one is unhappy with the schedule!
          </p>

          {/* Members List */}
          <div className="members-poll-list">
            {members.map((m, idx) => (
              <div key={m.id} className="member-poll-card">
                <div className="member-avatar-col">
                  <span className="member-avatar">{m.avatar}</span>
                </div>
                <div className="member-poll-info">
                  <div className="member-name-row">
                    <strong>{m.name}</strong>
                    {idx === 0 && <span className="organizer-tag">Trip Lead</span>}
                  </div>
                  <div className="member-tags-row">
                    <span className="poll-tag">🍜 Foodie</span>
                    <span className="poll-tag">🏛️ Culture</span>
                    <span className="poll-tag budget">💰 Balanced Tier</span>
                    {m.dietary && m.dietary !== 'None' && (
                      <span className="poll-tag diet">🥗 {m.dietary}</span>
                    )}
                  </div>
                </div>
                <div className="member-status-col">
                  <span className="synced-badge">
                    <Check size={12} /> Synced
                  </span>
                  {idx > 0 && (
                    <button
                      className="remove-member-btn"
                      onClick={() => handleRemoveMember(m.id)}
                      title="Remove member"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Member Input */}
          <form onSubmit={handleAddMember} className="add-member-form">
            <input
              type="text"
              placeholder="Add friend's name (e.g. Pei Shan, Marcus, Vicky)..."
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              className="add-member-input"
            />
            <button type="submit" className="add-member-btn">
              <Plus size={16} /> Add to Squad
            </button>
          </form>

          {/* Consensus Summary Box */}
          <div className="consensus-summary-box">
            <div className="summary-title-row">
              <ShieldCheck className="text-emerald" size={18} />
              <strong>Squad Consensus Summary</strong>
            </div>
            <p>
              Your group unanimously agrees on <strong>Top Local Food</strong> & <strong>Scenic Spots</strong> with a <strong>{travelPace} pace</strong>. Budget expectations are fully aligned at the <strong>Balanced ($$)</strong> tier.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Step Actions */}
      <div className="step-bottom-bar">
        <div className="step-summary-text">
          Selected: <strong>{selectedCity.city}, {selectedCountry.country}</strong> · {durationDays} Days · {travellers} Pax ({travelParty})
        </div>
        <button className="step-next-primary-btn" onClick={onNextStep}>
          Proceed to Step 2: Smart Budget <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
