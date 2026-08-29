import React, { useState, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Plane, Globe, Sparkles, ShoppingBag, ArrowRight, Search, MapPin,
  Compass, Utensils, BedDouble, Calendar, Users, ChevronRight, Menu, X, Check,
  Map, Layers, User, Heart, Users2, DollarSign, Zap, Coffee, SlidersHorizontal,
  Wand2, Edit3, Plus, Minus, MessageCircle, Share2
} from 'lucide-react'
import RealMapView from './RealMapView'
import AttractionsGrid from './AttractionsGrid'
import RestaurantsGrid from './RestaurantsGrid'
import TripBasketDrawer from './TripBasketDrawer'
import GroupChatDrawer from './GroupChatDrawer'
import ComparePage from './ComparePage'
import AIAgentPage from './AIAgentPage'
import PostcardCheckinPage from './PostcardCheckinPage'
import AppBottomNav from './AppBottomNav'
import InstallAppModal from './InstallAppModal'
import {
  Smartphone, Laptop, Download, ShieldCheck, Wifi, BatteryCharging,
  Sliders, Camera
} from 'lucide-react'
import { countriesData, popularDestinations } from './data/destinationsData'
import './styles.css'

function App() {
  // Navigation: 'explore' (1) | 'compare' (2) | 'ai' (3) | 'postcard' (4)
  const [currentPage, setCurrentPage] = useState('explore')
  const [postcardInitialSpot, setPostcardInitialSpot] = useState(null)

  // App View & Installation Mode
  const [appViewMode, setAppViewMode] = useState('responsive')
  const [installModalOpen, setInstallModalOpen] = useState(false)

  // Destination State
  const [selectedCountry, setSelectedCountry] = useState(countriesData[0]) // Malaysia
  const [selectedCity, setSelectedCity] = useState(countriesData[0].places[0]) // Kuala Lumpur
  const [destinations, setDestinations] = useState(popularDestinations)

  // Smart Trip Configuration Parameters (Fully Editable)
  const [departureDate, setDepartureDate] = useState('2026-09-15')
  const [returnDate, setReturnDate] = useState('2026-09-19')
  const [travelParty, setTravelParty] = useState('family') // 'solo' | 'couple' | 'family' | 'friends'
  const [travellers, setTravellers] = useState(4)
  const [budgetTier, setBudgetTier] = useState('balanced') // 'budget' | 'balanced' | 'premium' | 'luxury'
  const [budgetAmount, setBudgetAmount] = useState(3500)
  const [travelPace, setTravelPace] = useState('moderate') // 'relaxed' | 'moderate' | 'packed'

  // Header quick edit state
  const [isEditingHeaderBudget, setIsEditingHeaderBudget] = useState(false)

  // Search & Filtering
  const [countryFilterRegion, setCountryFilterRegion] = useState('All')
  const [placeSearchQuery, setPlaceSearchQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [attractions, setAttractions] = useState([])
  const [restaurants, setRestaurants] = useState([])

  // Basket & Logistics
  const [basket, setBasket] = useState([])
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [basketDrawerOpen, setBasketDrawerOpen] = useState(false)
  const [groupChatOpen, setGroupChatOpen] = useState(false)
  const [originAirport, setOriginAirport] = useState({ code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia' })

  // Calculate duration in days & nights
  const durationDays = useMemo(() => {
    const d1 = new Date(departureDate)
    const d2 = new Date(returnDate)
    const diffTime = Math.abs(d2 - d1)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays || 4)
  }, [departureDate, returnDate])

  // Helper to change duration by adding/subtracting days from departureDate
  const setDurationInDays = days => {
    const d1 = new Date(departureDate)
    const d2 = new Date(d1.getTime() + Math.max(1, days) * 86400000)
    setReturnDate(d2.toISOString().split('T')[0])
  }

  // Handle departure date change with auto-adjust of return date
  const handleDepartureDateChange = newDate => {
    setDepartureDate(newDate)
    const d1 = new Date(newDate)
    const d2 = new Date(returnDate)
    if (isNaN(d2.getTime()) || d2 <= d1) {
      const nextDate = new Date(d1.getTime() + 4 * 86400000)
      setReturnDate(nextDate.toISOString().split('T')[0])
    }
  }

  // Handle return date change with auto-adjust of departure date if needed
  const handleReturnDateChange = newDate => {
    const d1 = new Date(departureDate)
    const d2 = new Date(newDate)
    if (d2 <= d1) {
      const prevDate = new Date(d2.getTime() - 3 * 86400000)
      setDepartureDate(prevDate.toISOString().split('T')[0])
    }
    setReturnDate(newDate)
  }

  // Handle direct custom budget input
  const handleCustomBudgetChange = val => {
    const num = Math.max(100, Number(val) || 0)
    setBudgetAmount(num)
    if (num < 1800) setBudgetTier('budget')
    else if (num <= 4500) setBudgetTier('balanced')
    else if (num <= 8500) setBudgetTier('premium')
    else setBudgetTier('luxury')
  }

  // Party selector mapping
  const partyPresets = [
    { id: 'solo', label: 'Solo Trip', icon: User, defaultCount: 1, desc: 'Solo explorer & cafes' },
    { id: 'couple', label: 'Couple', icon: Heart, defaultCount: 2, desc: 'Romantic & scenic' },
    { id: 'family', label: 'Family with Kids', icon: Users2, defaultCount: 4, desc: 'Kid-friendly & relaxed' },
    { id: 'friends', label: 'Friends Group', icon: Users, defaultCount: 4, desc: 'Fun activities & food crawls' }
  ]

  const budgetPresets = [
    { id: 'budget', label: 'Budget ($)', amount: 1500 },
    { id: 'balanced', label: 'Balanced ($$)', amount: 3500 },
    { id: 'premium', label: 'Premium ($$$)', amount: 6500 },
    { id: 'luxury', label: 'Luxury ($$$$)', amount: 12000 }
  ]

  // Update travellers count when party changes
  const handlePartyChange = partyId => {
    setTravelParty(partyId)
    const found = partyPresets.find(p => p.id === partyId)
    if (found) setTravellers(found.defaultCount)
  }

  // Filter countries by region
  const filteredCountries = useMemo(() => {
    if (countryFilterRegion === 'All') return countriesData
    return countriesData.filter(c => c.region === countryFilterRegion || (countryFilterRegion === 'Middle East' && c.region.includes('Middle')))
  }, [countryFilterRegion])

  // Filter places inside the selected country
  const filteredPlacesInCountry = useMemo(() => {
    if (!placeSearchQuery.trim()) return selectedCountry.places
    const q = placeSearchQuery.toLowerCase().trim()
    return selectedCountry.places.filter(p =>
      p.city.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q) ||
      (p.state && p.state.toLowerCase().includes(q))
    )
  }, [selectedCountry, placeSearchQuery])

  // Fetch real attractions & restaurants when selectedCity changes
  useEffect(() => {
    if (!selectedCity) return

    // 1. Immediately seed static verified Hallmark spots from database (instant rendering, zero 0-spot delay)
    if (selectedCity.attractions && selectedCity.attractions.length > 0) {
      setAttractions(selectedCity.attractions)
    }
    if (selectedCity.restaurants && selectedCity.restaurants.length > 0) {
      setRestaurants(selectedCity.restaurants)
    }

    // 2. Fetch live augmented attractions and restaurants
    fetch(`/api/places/attractions?city=${encodeURIComponent(selectedCity.city)}`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setAttractions(data.data)
        }
      })
      .catch(() => {})

    fetch(`/api/places/restaurants?city=${encodeURIComponent(selectedCity.city)}`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setRestaurants(data.data)
        }
      })
      .catch(() => {})
  }, [selectedCity])

  // Search autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(() => {
      fetch(`/api/places/search?query=${encodeURIComponent(searchQuery.trim())}`)
        .then(res => res.json())
        .then(data => setSearchResults(data.data || []))
        .catch(() => {})
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Select Country
  const handleSelectCountry = country => {
    setSelectedCountry(country)
    setPlaceSearchQuery('')
    if (country.places && country.places.length > 0) {
      handleSelectCity(country.places[0], country)
    }
  }

  // Select Place/City
  const handleSelectCity = (place, parentCountry = null) => {
    const c = parentCountry || countriesData.find(c => c.places.some(p => p.id === place.id || p.city === place.city)) || selectedCountry
    setSelectedCountry(c)
    setSelectedCity({
      ...place,
      country: c.country,
      countryCode: c.code,
      flag: c.flag
    })
    setSearchQuery(place.city)
    setSearchOpen(false)
  }

  // Smart 1-Click Auto-Populate Basket based on Party & Budget
  const handleSmartAutoFill = () => {
    const topAttractions = attractions.slice(0, 3).map(a => ({ ...a, type: 'attraction' }))
    const topDining = restaurants.slice(0, 2).map(r => ({ ...r, type: 'restaurant' }))
    const newItems = [...topAttractions, ...topDining]

    setBasket(prev => {
      const merged = [...prev]
      newItems.forEach(item => {
        if (!merged.some(m => m.id === item.id)) merged.push(item)
      })
      return merged
    })
    setBasketDrawerOpen(true)
  }

  // Open Postcard Check-in Studio with preloaded spot
  const handleOpenPostcardWithSpot = spot => {
    setPostcardInitialSpot(spot)
    setCurrentPage('postcard')
  }

  // Basket Actions
  const addToBasket = item => {
    if (!basket.some(b => b.id === item.id)) {
      setBasket(prev => [...prev, item])
    }
  }

  const removeFromBasket = id => {
    setBasket(prev => prev.filter(item => item.id !== id))
  }

  const clearBasket = () => {
    setBasket([])
    setSelectedFlight(null)
    setSelectedHotel(null)
  }

  // Estimated Live Trip Cost Calculation
  const estimatedTotalCost = useMemo(() => {
    let sum = 0
    if (selectedFlight) sum += (selectedFlight.totalPrice || selectedFlight.price || 400)
    if (selectedHotel) sum += (selectedHotel.totalPrice || selectedHotel.price || 600)
    // Add estimated activity and dining budget
    basket.forEach(item => {
      if (item.type === 'attraction' || item.category) {
        sum += 35 * travellers
      } else {
        const tierCost = item.priceTier === '$' ? 18 : item.priceTier === '$$' ? 45 : item.priceTier === '$$$' ? 120 : 250
        sum += tierCost * travellers
      }
    })
    if (sum === 0) sum = (budgetAmount * 0.45)
    return Math.round(sum)
  }, [basket, selectedFlight, selectedHotel, travellers, budgetAmount])

  const costPerPerson = Math.round(estimatedTotalCost / Math.max(1, travellers))
  const totalBasketCount = basket.length + (selectedFlight ? 1 : 0) + (selectedHotel ? 1 : 0)

  return (
    <div className="app-root-wrapper">
      <div className="app-layout">
        {/* TOP HEADER */}
        <header className="global-header app-native-header">
          <div className="header-container">
            <div className="brand-group" onClick={() => setCurrentPage('explore')}>
                <div className="brand-logo-icon" style={{ width: 38, height: 38, flexShrink: 0 }}>
                  <Map size={18} />
                </div>
                <div className="brand-text">
                  <div className="brand-title-row">
                    <span className="brand-name">PlanTrip</span>
                    <span className="app-pill-badge">APP</span>
                  </div>
                  <span className="brand-tagline">Tailored Travel AI</span>
                </div>
              </div>

              {/* QUICK DESTINATION & DATES APP PILL */}
              <div className="header-dest-pill" onClick={() => setCurrentPage('explore')}>
                <MapPin size={13} className="text-cyan" />
                <span className="pill-dest-city">{selectedCity.city}</span>
                <span className="pill-dot">·</span>
                <span className="pill-dest-dur">{durationDays}D</span>
                <span className="pill-dot">·</span>
                <span className="pill-dest-party">{travellers} Pax</span>
              </div>

              {/* STEPPER NAVIGATION (HIDDEN ON NATIVE MOBILE, HANDLED BY BOTTOM NAV) */}
              <nav className="stepper-nav desktop-only">
                <button
                  className={`step-link ${currentPage === 'explore' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('explore')}
                >
                  <span className="step-num">1</span>
                  <span className="step-label">1. Discover & Pick Places</span>
                </button>

                <div className="step-arrow"><ChevronRight size={15} /></div>

                <button
                  className={`step-link ${currentPage === 'compare' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('compare')}
                >
                  <span className="step-num">2</span>
                  <span className="step-label">2. Compare Stays & Flights</span>
                </button>

                <div className="step-arrow"><ChevronRight size={15} /></div>

                <button
                  className={`step-link ${currentPage === 'ai' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('ai')}
                >
                  <span className="step-num">3</span>
                  <span className="step-label">3. AI Agent Itinerary Doc</span>
                </button>

                <div className="step-arrow"><ChevronRight size={15} /></div>

                <button
                  className={`step-link ${currentPage === 'postcard' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('postcard')}
                >
                  <span className="step-num">4</span>
                  <span className="step-label">4. 📸 Postcard & IG Story</span>
                </button>
              </nav>

              {/* HEADER RIGHT ACTIONS & EDITABLE LIVE BUDGET GAUGE */}
              <div className="header-actions">
                <div className="header-budget-indicator desktop-only" title="Click to edit total target budget">
                  <div className="budget-indicator-header">
                    <span className="budget-mini-label">Target Budget:</span>
                    <span className="edit-hint-icon"><Edit3 size={10} /></span>
                  </div>
                  <div className="header-budget-input-wrapper">
                    <span className="currency-prefix">RM</span>
                    <input
                      type="number"
                      className="header-budget-input"
                      value={budgetAmount}
                      onChange={e => handleCustomBudgetChange(e.target.value)}
                      step="100"
                      min="500"
                    />
                  </div>
                  <small className="budget-per-person">RM {Math.round(budgetAmount / Math.max(1, travellers)).toLocaleString()}/pax</small>
                </div>

                {/* POSTCARD / CHECK-IN QUICK BUTTON */}
                <button
                  className={`btn-group-chat-header ${currentPage === 'postcard' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('postcard')}
                  aria-label="Open Postcard & Check-in Studio"
                  title="Generate Digital Postcard & Share to Instagram Story"
                >
                  <Camera size={17} />
                  <span className="desktop-only">📸 Postcard</span>
                </button>

                {/* GROUP CHAT & WHATSAPP SYNC BUTTON */}
                <button
                  className="btn-group-chat-header"
                  onClick={() => setGroupChatOpen(true)}
                  aria-label="Open Group Chat & WhatsApp"
                >
                  <MessageCircle size={17} />
                  <span className="desktop-only">WhatsApp Hub</span>
                  <span className="chat-wishes-badge">Live</span>
                </button>

                <button
                  className="basket-btn-header"
                  onClick={() => setBasketDrawerOpen(true)}
                  aria-label="Open Trip Basket"
                >
                  <ShoppingBag size={17} />
                  <span className="desktop-only">Basket</span>
                  {totalBasketCount > 0 && (
                    <span className="basket-counter-badge">{totalBasketCount}</span>
                  )}
                </button>
              </div>
            </div>
          </header>

      {/* PAGE 1: DISCOVER, CONFIGURE & MAP */}
      {currentPage === 'explore' && (
        <main className="explore-page">
          {/* SMART TRIP CONFIGURATION BAR (FULLY EDITABLE DATES, BUDGET & PARTY) */}
          <section className="trip-config-bar-section">
            <div className="container">
              <div className="trip-config-card">
                <div className="config-grid">
                  {/* EDITABLE START & END TRAVEL DATES */}
                  <div className="config-item date-config">
                    <div className="config-label-row">
                      <label className="config-label">
                        <Calendar size={14} />
                        <span>Trip Dates ({durationDays} Days / {Math.max(1, durationDays - 1)} Nights)</span>
                      </label>
                      {/* Quick Duration Stepper */}
                      <div className="duration-stepper">
                        <button
                          className="btn-stepper"
                          onClick={() => adjustDurationStep(-1)}
                          title="Subtract 1 Day"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="stepper-count">{durationDays} Days</span>
                        <button
                          className="btn-stepper"
                          onClick={() => adjustDurationStep(1)}
                          title="Add 1 Day"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* DUAL DATE PICKERS: START DATE & END DATE */}
                    <div className="dual-date-pickers-grid">
                      {/* START DATE CARD */}
                      <div className="date-picker-card">
                        <div className="date-picker-sublabel">
                          <span>🛫 Start Date (Depart)</span>
                        </div>
                        <input
                          type="date"
                          className="interactive-date-input"
                          value={departureDate}
                          onChange={e => handleDepartureDateChange(e.target.value)}
                        />
                      </div>

                      {/* END DATE CARD */}
                      <div className="date-picker-card">
                        <div className="date-picker-sublabel">
                          <span>🛬 End Date (Return)</span>
                        </div>
                        <input
                          type="date"
                          className="interactive-date-input"
                          value={returnDate}
                          min={departureDate}
                          onChange={e => handleReturnDateChange(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Quick Duration Pills */}
                    <div className="quick-duration-pills">
                      {[3, 4, 5, 7, 10, 14].map(d => (
                        <button
                          key={d}
                          className={`dur-pill ${durationDays === d ? 'active' : ''}`}
                          onClick={() => setDurationInDays(d)}
                        >
                          {d} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* EDITABLE TRAVEL PARTY & TRAVELLERS COUNT */}
                  <div className="config-item party-config">
                    <div className="config-label-row">
                      <label className="config-label">
                        <Users size={14} />
                        <span>Who is Traveling?</span>
                      </label>
                      {/* Pax Stepper */}
                      <div className="duration-stepper">
                        <button
                          className="btn-stepper"
                          onClick={() => setTravellers(prev => Math.max(1, prev - 1))}
                          title="Decrease passengers"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="stepper-count">{travellers} Pax</span>
                        <button
                          className="btn-stepper"
                          onClick={() => setTravellers(prev => Math.min(16, prev + 1))}
                          title="Increase passengers"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="party-selector-pills">
                      {partyPresets.map(preset => {
                        const Icon = preset.icon
                        const isActive = travelParty === preset.id
                        return (
                          <button
                            key={preset.id}
                            className={`party-pill-btn ${isActive ? 'active' : ''}`}
                            onClick={() => handlePartyChange(preset.id)}
                            title={preset.desc}
                          >
                            <Icon size={14} />
                            <span>{preset.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* EDITABLE TARGET BUDGET & AMOUNT INPUT */}
                  <div className="config-item budget-config">
                    <div className="config-label-row">
                      <label className="config-label">
                        <DollarSign size={14} />
                        <span>Est. Trip Budget</span>
                      </label>
                      <small className="budget-pax-hint">
                        RM {Math.round(budgetAmount / Math.max(1, travellers)).toLocaleString()}/pax
                      </small>
                    </div>

                    {/* Editable Budget Input Box */}
                    <div className="custom-budget-input-box">
                      <span className="currency-label">RM</span>
                      <input
                        type="number"
                        className="budget-number-input"
                        value={budgetAmount}
                        onChange={e => handleCustomBudgetChange(e.target.value)}
                        step="100"
                        min="500"
                        placeholder="Enter budget..."
                      />
                    </div>

                    {/* Quick Budget Preset Pills */}
                    <div className="budget-selector-pills">
                      {budgetPresets.map(b => (
                        <button
                          key={b.id}
                          className={`budget-pill-btn ${budgetTier === b.id ? 'active' : ''}`}
                          onClick={() => {
                            setBudgetTier(b.id)
                            setBudgetAmount(b.amount)
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* EDITABLE TRAVEL PACE */}
                  <div className="config-item pace-config">
                    <label className="config-label">
                      <Zap size={14} />
                      <span>Trip Pace</span>
                    </label>
                    <div className="pace-selector-pills">
                      <button
                        className={`pace-pill-btn ${travelPace === 'relaxed' ? 'active' : ''}`}
                        onClick={() => setTravelPace('relaxed')}
                      >
                        🌴 Relaxed
                      </button>
                      <button
                        className={`pace-pill-btn ${travelPace === 'moderate' ? 'active' : ''}`}
                        onClick={() => setTravelPace('moderate')}
                      >
                        ⚖️ Balanced
                      </button>
                      <button
                        className={`pace-pill-btn ${travelPace === 'packed' ? 'active' : ''}`}
                        onClick={() => setTravelPace('packed')}
                      >
                        ⚡ Active
                      </button>
                    </div>
                  </div>
                </div>

                {/* SMART AUTO-RECOMMENDATION BANNER */}
                <div className="smart-autofill-row">
                  <div className="autofill-text">
                    <Sparkles size={16} className="sparkle-icon" />
                    <span>
                      Planning for <strong>{partyPresets.find(p => p.id === travelParty)?.label} ({travellers} pax)</strong> for <strong>{durationDays} Days</strong> with budget <strong>RM {budgetAmount.toLocaleString()}</strong>.
                    </span>
                  </div>
                  <button className="btn-smart-autofill" onClick={handleSmartAutoFill}>
                    <Wand2 size={15} />
                    <span>✨ Auto-Pick Best Spots for My Group</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* HERO SECTION WITH SEARCH & GOOGLE MAP */}
          <section className="hero-earth-section">
            <div className="hero-content">
              <h1 className="hero-main-title">
                Plan Your {selectedCity.city} Trip.<br />
                <span className="gradient-text">Tailored to Your Budget & Group.</span>
              </h1>
              <p className="hero-description">
                Explore destinations across Malaysia and worldwide. Pick attractions and dining arranged by Google Reviews, compare live transport and hotel rates, and generate your finalized itinerary document.
              </p>

              {/* SEARCH BAR */}
              <div className="hero-search-box">
                <div className="search-input-wrapper">
                  <MapPin size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search any place (e.g. Penang, Langkawi, Melaka, Semporna, Genting, Tokyo, Paris...)"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      setSearchOpen(true)
                    }}
                    onFocus={() => setSearchOpen(true)}
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery('')}>
                      <X size={16} />
                    </button>
                  )}
                </div>

                {searchOpen && searchResults.length > 0 && (
                  <div className="search-dropdown-menu">
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        className="search-item-btn"
                        onMouseDown={() => handleSelectCity(result)}
                      >
                        <MapPin size={16} />
                        <div>
                          <strong>{result.city}</strong>
                          <small>{result.country}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CURRENTLY FOCUSED DESTINATION CARD */}
              <div className="selected-city-banner">
                <div className="city-pill-info">
                  <span className="status-dot" />
                  <span>
                    Currently Focused: <strong>{selectedCity.city}</strong> ({selectedCountry.flag} {selectedCountry.country})
                  </span>
                </div>
                <button
                  className="btn-next-compare"
                  onClick={() => setCurrentPage('compare')}
                >
                  <span>Proceed to Flight & Hotel Comparison</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* REAL GOOGLE MAP CANVAS */}
            <div className="earth-canvas-col">
              <RealMapView
                destination={selectedCity}
                attractions={attractions}
                restaurants={restaurants}
                basket={basket}
                onAddToBasket={addToBasket}
                onRemoveFromBasket={removeFromBasket}
              />
            </div>
          </section>

          {/* TWO-STEP SELECTOR: 1. CHOOSE COUNTRY -> 2. CHOOSE DESTINATION */}
          <section className="container country-destination-selector-section">
            <div className="selector-container-card">
              {/* STEP 1: CHOOSE COUNTRY */}
              <div className="selector-step-block">
                <div className="selector-step-header">
                  <span className="step-circle">1</span>
                  <div>
                    <h3>Step 1: Choose a Country</h3>
                    <p>Select any country below to explore all its cities, islands, and regions.</p>
                  </div>
                </div>

                {/* Country Region Filter Tabs */}
                <div className="region-pills-row">
                  {['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Oceania'].map(reg => (
                    <button
                      key={reg}
                      className={`region-pill-filter ${countryFilterRegion === reg ? 'active' : ''}`}
                      onClick={() => setCountryFilterRegion(reg)}
                    >
                      {reg}
                    </button>
                  ))}
                </div>

                <div className="country-cards-scroll">
                  {filteredCountries.map(country => {
                    const isSelected = selectedCountry.code === country.code
                    return (
                      <button
                        key={country.code}
                        className={`country-select-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectCountry(country)}
                      >
                        <span className="country-flag">{country.flag}</span>
                        <span className="country-name">{country.country}</span>
                        <span className="country-places-count">({country.places.length} places)</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2: CHOOSE PLACE WITHIN THAT COUNTRY */}
              <div className="selector-step-block place-step-block">
                <div className="place-step-header-row">
                  <div className="selector-step-header">
                    <span className="step-circle accent">2</span>
                    <div>
                      <h3>Step 2: Choose Destination in {selectedCountry.flag} {selectedCountry.country}</h3>
                      <p>{selectedCountry.description}</p>
                    </div>
                  </div>

                  {/* Filter / Search within Country */}
                  <div className="place-search-mini">
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder={`Filter places in ${selectedCountry.country}...`}
                      value={placeSearchQuery}
                      onChange={e => setPlaceSearchQuery(e.target.value)}
                    />
                    {placeSearchQuery && (
                      <button onClick={() => setPlaceSearchQuery('')}><X size={14} /></button>
                    )}
                  </div>
                </div>

                <div className="places-in-country-grid">
                  {filteredPlacesInCountry.map(place => {
                    const isSelected = selectedCity.id === place.id || selectedCity.city === place.city
                    return (
                      <div
                        key={place.id}
                        className={`place-pick-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectCity(place, selectedCountry)}
                      >
                        <div
                          className="place-pick-thumb"
                          style={{ backgroundImage: `url(${place.heroImage})` }}
                        >
                          {isSelected && (
                            <span className="active-badge">
                              <Check size={13} /> Active
                            </span>
                          )}
                          <span className="place-tag-pill">{place.tag}</span>
                        </div>
                        <div className="place-pick-info">
                          <h4>{place.city}</h4>
                          <small>{place.state}</small>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ATTRACTIONS SECTION (ARRANGED BY GOOGLE REVIEWS & SMART TAILORING) */}
          <section className="container places-container">
            <AttractionsGrid
              city={selectedCity}
              attractions={attractions}
              basket={basket}
              travelParty={travelParty}
              budgetTier={budgetTier}
              durationDays={durationDays}
              travellers={travellers}
              onAddToBasket={addToBasket}
              onRemoveFromBasket={removeFromBasket}
              onOpenPostcard={handleOpenPostcardWithSpot}
            />
          </section>

          {/* RESTAURANTS SECTION (ARRANGED BY GOOGLE REVIEWS, PRICES & PARTY) */}
          <section className="container places-container">
            <RestaurantsGrid
              city={selectedCity}
              restaurants={restaurants}
              basket={basket}
              travelParty={travelParty}
              budgetTier={budgetTier}
              durationDays={durationDays}
              travellers={travellers}
              onAddToBasket={addToBasket}
              onRemoveFromBasket={removeFromBasket}
              onOpenPostcard={handleOpenPostcardWithSpot}
            />
          </section>

          {/* BOTTOM CTA BAR */}
          <section className="bottom-cta-banner">
            <div className="container cta-flex">
              <div>
                <h3>Ready to Compare Flights & Stays for {selectedCity.city}?</h3>
                <p>
                  You have {totalBasketCount} items selected. Target budget for {travellers} travelers ({durationDays} Days): <strong>RM {budgetAmount.toLocaleString()}</strong>.
                </p>
              </div>
              <div className="cta-actions">
                <button
                  className="btn-cta-secondary"
                  onClick={() => setBasketDrawerOpen(true)}
                >
                  <ShoppingBag size={18} /> View Basket ({totalBasketCount})
                </button>
                <button
                  className="btn-cta-primary"
                  onClick={() => setCurrentPage('compare')}
                >
                  <span>Proceed to Flight & Hotel Comparison</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PAGE 2: COMPARE FLIGHTS & STAYS */}
      {currentPage === 'compare' && (
        <ComparePage
          destination={selectedCity}
          originAirport={originAirport}
          departureDate={departureDate}
          returnDate={returnDate}
          travellers={travellers}
          travelParty={travelParty}
          budgetAmount={budgetAmount}
          selectedFlight={selectedFlight}
          selectedHotel={selectedHotel}
          onSelectFlight={setSelectedFlight}
          onSelectHotel={setSelectedHotel}
          onNavigateToAI={() => setCurrentPage('ai')}
          onNavigateToExplore={() => setCurrentPage('explore')}
        />
      )}

      {/* PAGE 3: AI AGENT & ITINERARY DOCUMENT */}
      {currentPage === 'ai' && (
        <AIAgentPage
          destination={selectedCity}
          basket={basket}
          selectedFlight={selectedFlight}
          selectedHotel={selectedHotel}
          departureDate={departureDate}
          returnDate={returnDate}
          durationDays={durationDays}
          travellers={travellers}
          travelParty={travelParty}
          budgetTier={budgetTier}
          budgetAmount={budgetAmount}
          travelPace={travelPace}
          onNavigateToExplore={() => setCurrentPage('explore')}
          onNavigateToCompare={() => setCurrentPage('compare')}
        />
      )}

      {/* PAGE 4: POSTCARD CHECK-IN & INSTAGRAM STORY STUDIO */}
      {currentPage === 'postcard' && (
        <PostcardCheckinPage
          selectedCity={selectedCity}
          basket={basket}
          initialSpot={postcardInitialSpot}
          onBackToExplore={() => setCurrentPage('explore')}
          travellers={travellers}
          travelParty={travelParty}
        />
      )}

      {/* FLOATING ACTION BUTTONS */}
      <div className="floating-actions-stack">
        <button
          className="floating-chat-btn"
          onClick={() => setGroupChatOpen(true)}
          aria-label="Open Group Chat & WhatsApp Hub"
        >
          <MessageCircle size={20} />
          <span className="floating-basket-label">Group Chat</span>
          <span className="floating-badge green">3</span>
        </button>

        {totalBasketCount > 0 && !basketDrawerOpen && (
          <button
            className="floating-basket-btn"
            onClick={() => setBasketDrawerOpen(true)}
            aria-label="View Trip Basket"
          >
            <ShoppingBag size={20} />
            <span className="floating-basket-label">Basket</span>
            <span className="floating-badge">{totalBasketCount}</span>
          </button>
        )}
      </div>

      {/* TRIP BASKET DRAWER */}
      <TripBasketDrawer
        isOpen={basketDrawerOpen}
        onClose={() => setBasketDrawerOpen(false)}
        basket={basket}
        selectedFlight={selectedFlight}
        selectedHotel={selectedHotel}
        travellers={travellers}
        budgetAmount={budgetAmount}
        onBudgetChange={handleCustomBudgetChange}
        estimatedTotalCost={estimatedTotalCost}
        onRemoveItem={removeFromBasket}
        onClearBasket={clearBasket}
        onNavigateToCompare={() => setCurrentPage('compare')}
        onNavigateToAI={() => setCurrentPage('ai')}
      />

      {/* GROUP CHAT & WHATSAPP DRAWER */}
      <GroupChatDrawer
        isOpen={groupChatOpen}
        onClose={() => setGroupChatOpen(false)}
        destination={selectedCity}
        departureDate={departureDate}
        returnDate={returnDate}
        durationDays={durationDays}
        travellers={travellers}
        travelParty={travelParty}
        budgetAmount={budgetAmount}
        basket={basket}
        onAddToBasket={addToBasket}
      />

      {/* FOOTER (DESKTOP MODE) */}
      <footer className="global-footer desktop-only">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand-group">
              <Map size={18} />
              <span>PlanTrip AI</span>
            </div>
            <p>From custom group planning to real Google Maps, multi-provider comparisons & automated itinerary generation.</p>
          </div>
          <div className="footer-links">
            <span>AirAsia Direct · Booking.com · Trip.com · Google Reviews · Google Maps · Gemini AI</span>
          </div>
          <div className="footer-copy">
            © 2026 PlanTrip Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* NATIVE PERSISTENT MOBILE BOTTOM NAVIGATION TAB BAR */}
      <AppBottomNav
        currentPage={currentPage}
        onSelectPage={page => {
          setCurrentPage(page)
          setGroupChatOpen(false)
          setBasketDrawerOpen(false)
        }}
        basketCount={totalBasketCount}
        onOpenBasket={() => setBasketDrawerOpen(true)}
        onOpenGroupChat={() => setGroupChatOpen(true)}
        groupChatOpen={groupChatOpen}
        basketOpen={basketDrawerOpen}
      />

      {/* INSTALL APP MODAL (PWA & STANDALONE) */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
