import React, { useState } from 'react'
import {
  MapPin, Calendar, Users, User, Heart, Users2, Sparkles,
  Check, ArrowRight, Sliders, Coffee, Compass, Utensils,
  ShieldCheck, Zap, Plus, Trash2
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
  onNextStep
}) {
  const [newMemberName, setNewMemberName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Party presets
  const partyPresets = [
    { id: 'solo', label: 'Solo Explorer', icon: User, defaultCount: 1, desc: 'Maximum flexibility' },
    { id: 'couple', label: 'Couple / Romantic', icon: Heart, defaultCount: 2, desc: 'Scenic & romantic' },
    { id: 'family', label: 'Family with Kids', icon: Users2, defaultCount: 4, desc: 'Kid-friendly & relaxed' },
    { id: 'friends', label: 'Friends Squad', icon: Users, defaultCount: 4, desc: 'Activities & dining' }
  ]

  // Vibe tags
  const vibeOptions = [
    { id: 'foodie', label: '🍜 Local Food', desc: 'Must-try dishes & street eats' },
    { id: 'culture', label: '🏛️ Heritage & Culture', desc: 'Landmarks & museums' },
    { id: 'nature', label: '🌿 Nature & Views', desc: 'Parks, viewpoints & sea' },
    { id: 'adventure', label: '⚡ Thrills & Theme Parks', desc: 'Outdoor & adventures' },
    { id: 'shopping', label: '🛍️ Markets & Malls', desc: 'Boutiques & night markets' },
    { id: 'relaxed', label: '☕ Chill & Cafes', desc: 'Slow mornings & cafe hopping' }
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

  return (
    <div className="container step-setup-clean-container fade-in">
      {/* SECTION TITLE */}
      <div className="setup-clean-heading-row">
        <div>
          <h1 className="step-clean-title">Where & How are you travelling?</h1>
          <p className="step-clean-subtitle">
            Configure your destination, dates, party type, and style for a seamless trip.
          </p>
        </div>
        <div className="setup-quick-summary-pill">
          <MapPin size={14} className="text-cyan" />
          <span>{selectedCity.city}, {selectedCountry.country}</span>
          <span className="pill-divider">·</span>
          <span>{durationDays} Days</span>
          <span className="pill-divider">·</span>
          <span>{travellers} Pax</span>
        </div>
      </div>

      {/* 2-COLUMN MAIN SETUP LAYOUT */}
      <div className="setup-clean-grid">
        {/* LEFT COLUMN: DESTINATION & DATES */}
        <div className="setup-clean-col">
          {/* CARD 1: DESTINATION SELECTOR */}
          <div className="clean-card">
            <div className="clean-card-header">
              <div className="clean-card-title-wrap">
                <MapPin size={18} className="text-cyan" />
                <h2>1. Choose Destination</h2>
              </div>
              <span className="clean-badge">{selectedCountry.flag} {selectedCountry.country}</span>
            </div>

            {/* Country Selector Pills */}
            <div className="country-pills-row">
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
            <div className="city-cards-grid">
              {filteredPlaces.map(place => {
                const isSelected = selectedCity.city === place.city
                return (
                  <div
                    key={place.id || place.city}
                    className={`city-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectCity(place, selectedCountry)}
                  >
                    <div className="city-card-img-wrap">
                      <img src={place.image} alt={place.city} className="city-card-img" />
                      <div className="city-card-tag">{place.tag}</div>
                      {isSelected && (
                        <div className="city-selected-indicator">
                          <Check size={13} />
                        </div>
                      )}
                    </div>
                    <div className="city-card-details">
                      <div className="city-name">{place.city}</div>
                      <div className="city-sub">{place.state || selectedCountry.country}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CARD 2: DATES & DURATION */}
          <div className="clean-card">
            <div className="clean-card-header">
              <div className="clean-card-title-wrap">
                <Calendar size={18} className="text-cyan" />
                <h2>2. Travel Dates & Duration</h2>
              </div>
              <span className="clean-badge">{durationDays} Days / {Math.max(1, durationDays - 1)} Nights</span>
            </div>

            <div className="date-fields-grid">
              <div className="date-field-box">
                <label>Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={e => onDepartureDateChange(e.target.value)}
                  className="clean-date-input"
                />
              </div>
              <div className="date-field-box">
                <label>Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => onReturnDateChange(e.target.value)}
                  className="clean-date-input"
                />
              </div>
            </div>

            {/* Quick Duration Chips */}
            <div className="quick-dur-row">
              <span className="quick-dur-caption">Quick Set:</span>
              {[3, 4, 5, 7, 10].map(days => (
                <button
                  key={days}
                  className={`dur-pill-btn ${durationDays === days ? 'active' : ''}`}
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
        </div>

        {/* RIGHT COLUMN: PARTY, VIBE & SQUAD */}
        <div className="setup-clean-col">
          {/* CARD 3: TRAVEL PARTY */}
          <div className="clean-card">
            <div className="clean-card-header">
              <div className="clean-card-title-wrap">
                <Users size={18} className="text-cyan" />
                <h2>3. Travel Party & Travellers</h2>
              </div>
              <div className="pax-stepper">
                <button
                  className="pax-stepper-btn"
                  disabled={travellers <= 1}
                  onClick={() => setTravellers(Math.max(1, travellers - 1))}
                >
                  -
                </button>
                <span className="pax-display">{travellers} Pax</span>
                <button
                  className="pax-stepper-btn"
                  onClick={() => setTravellers(travellers + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="party-pills-grid">
              {partyPresets.map(p => {
                const Icon = p.icon
                const isSelected = travelParty === p.id
                return (
                  <button
                    key={p.id}
                    className={`party-pill-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => onPartyChange(p.id)}
                  >
                    <Icon size={16} />
                    <span className="party-pill-label">{p.label}</span>
                    {isSelected && <Check size={14} className="text-cyan" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* CARD 4: TRIP VIBE & PACE */}
          <div className="clean-card">
            <div className="clean-card-header">
              <div className="clean-card-title-wrap">
                <Sparkles size={18} className="text-cyan" />
                <h2>4. Trip Vibes & Pacing</h2>
              </div>
              <span className="clean-badge">{(groupPreferences.vibes || []).length} Selected</span>
            </div>

            {/* Vibe Chips */}
            <div className="vibe-chips-wrap">
              {vibeOptions.map(v => {
                const isSelected = (groupPreferences.vibes || []).includes(v.id)
                return (
                  <button
                    key={v.id}
                    className={`vibe-chip-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleVibe(v.id)}
                  >
                    {isSelected ? '✓ ' : ''}{v.label}
                  </button>
                )
              })}
            </div>

            {/* Pacing Buttons */}
            <div className="pacing-row">
              <span className="pacing-label">Daily Pace:</span>
              <div className="pacing-buttons-group">
                {[
                  { id: 'relaxed', label: '☕ Relaxed' },
                  { id: 'moderate', label: '⚖️ Balanced' },
                  { id: 'packed', label: '🚀 Action-Packed' }
                ].map(p => (
                  <button
                    key={p.id}
                    className={`pacing-btn ${travelPace === p.id ? 'active' : ''}`}
                    onClick={() => setTravelPace(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Chips */}
            <div className="dietary-row">
              <span className="pacing-label">Dietary:</span>
              <div className="dietary-chips-group">
                {dietaryOptions.map(diet => {
                  const isChecked = (groupPreferences.dietary || []).includes(diet)
                  return (
                    <button
                      key={diet}
                      className={`diet-chip-btn ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleDietary(diet)}
                    >
                      {isChecked ? '✓ ' : '+ '}{diet}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CARD 5: SQUAD COLLABORATION (IF GROUP) */}
          {travelParty !== 'solo' && (
            <div className="clean-card">
              <div className="clean-card-header">
                <div className="clean-card-title-wrap">
                  <ShieldCheck size={18} className="text-emerald" />
                  <h2>5. Squad Members ({members.length})</h2>
                </div>
                <span className="clean-badge success">Synced</span>
              </div>

              <div className="squad-members-row">
                {members.map((m, idx) => (
                  <div key={m.id} className="squad-member-chip">
                    <span className="member-avatar-emoji">{m.avatar}</span>
                    <span className="member-name-text">{m.name}</span>
                    {idx > 0 && (
                      <button
                        className="btn-member-remove"
                        onClick={() => handleRemoveMember(m.id)}
                        title="Remove member"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddMember} className="squad-add-form">
                <input
                  type="text"
                  placeholder="Add friend's name..."
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="squad-add-input"
                />
                <button type="submit" className="squad-add-btn">
                  <Plus size={15} /> Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM STEP PROCEED BAR */}
      <div className="step-bottom-bar">
        <div className="step-summary-text">
          Ready to plan: <strong>{selectedCity.city}, {selectedCountry.country}</strong> · {durationDays} Days · {travellers} Pax ({travelParty})
        </div>
        <button className="step-next-primary-btn" onClick={onNextStep}>
          Continue to Step 2: Budget <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
