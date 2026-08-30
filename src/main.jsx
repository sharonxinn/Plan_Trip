import React, { useState, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Plane, Globe, Sparkles, ShoppingBag, ArrowRight, Search, MapPin,
  Compass, Utensils, BedDouble, Calendar, Users, ChevronRight, Menu, X, Check,
  Map, Layers, User, Heart, Users2, DollarSign, Zap, Coffee, SlidersHorizontal,
  Wand2, Edit3, Plus, Minus, MessageCircle, Share2, Scale, Bot, Camera,
  ShieldCheck, AlertCircle, Luggage, Receipt, ArrowLeft, Link2, Navigation
} from 'lucide-react'
import RealMapView from './RealMapView'
import AttractionsGrid from './AttractionsGrid'
import RestaurantsGrid from './RestaurantsGrid'
import TripBasketDrawer from './TripBasketDrawer'
import GroupChatDrawer from './GroupChatDrawer'
import LinkCollectorDrawer from './LinkCollectorDrawer'
import SmartRouteWizard from './SmartRouteWizard'
import SmartRouteTimeline from './SmartRouteTimeline'
import ComparePage from './ComparePage'
import AIAgentPage from './AIAgentPage'
import PostcardCheckinPage from './PostcardCheckinPage'
import AppBottomNav from './AppBottomNav'
import InstallAppModal from './InstallAppModal'
import StepSetupSync from './StepSetupSync'
import StepBudgetSplitter from './StepBudgetSplitter'
import StepPlanBStudio from './StepPlanBStudio'
import StepGroupRoom from './StepGroupRoom'
import StepPackExport from './StepPackExport'
import { countriesData, popularDestinations } from './data/destinationsData'
import { generateSmartItinerary } from './utils/routeOptimizer'
import './styles.css'

function App() {
  // Navigation Flow: 'setup' (1) | 'budget' (2) | 'explore' (3) | 'planb' (4) | 'group' (5) | 'pack' (6)
  // Deep-dive Views: 'compare' | 'ai' | 'postcard'
  const [currentPage, setCurrentPage] = useState('setup')
  const [postcardInitialSpot, setPostcardInitialSpot] = useState(null)
  const [planBToast, setPlanBToast] = useState(null)

  // App View & Installation Mode
  const [installModalOpen, setInstallModalOpen] = useState(false)

  // Destination State
  const [selectedCountry, setSelectedCountry] = useState(countriesData[0]) // Malaysia
  const [selectedCity, setSelectedCity] = useState(countriesData[0].places[0]) // Kuala Lumpur
  const [destinations, setDestinations] = useState(popularDestinations)

  // Smart Trip Configuration Parameters (Fully Editable)
  const [departureDate, setDepartureDate] = useState('2026-09-15')
  const [returnDate, setReturnDate] = useState('2026-09-18') // 3 Days 2 Nights default
  const [travelParty, setTravelParty] = useState('friends') // 'solo' | 'couple' | 'family' | 'friends'
  const [travellers, setTravellers] = useState(4)
  const [budgetTier, setBudgetTier] = useState('balanced') // 'budget' | 'balanced' | 'premium' | 'luxury'
  const [budgetAmount, setBudgetAmount] = useState(3800)
  const [travelPace, setTravelPace] = useState('moderate') // 'relaxed' | 'moderate' | 'packed'

  // Link Collector & Smart Route Engine State
  const [linkCollectorOpen, setLinkCollectorOpen] = useState(false)
  const [smartRouteWizardOpen, setSmartRouteWizardOpen] = useState(false)
  
  // Helper to build city-specific initial bucket list and smart itinerary
  const buildCitySmartData = (place, numDays = 3) => {
    if (!place) return { newBucketList: [], newSmartItinerary: null }
    
    const cityAttractions = (place.attractions && place.attractions.length > 0) ? place.attractions : []
    const cityRestaurants = (place.restaurants && place.restaurants.length > 0) ? place.restaurants : []
    
    const squadNames = ['Marcus', 'Pei Shan', 'Vicky', 'You', 'Alex']
    const newBucketList = []

    cityAttractions.forEach((att, idx) => {
      newBucketList.push({
        ...att,
        id: att.id || `b-att-${idx}`,
        name: att.name,
        title: att.name,
        category: att.category || 'Must-Visit Sights',
        type: 'attraction',
        suggestedBy: squadNames[idx % squadNames.length],
        rating: att.rating || 4.8,
        lat: att.lat || place.lat,
        lng: att.lng || place.lng,
        image: att.image,
        isMustVisit: idx < 2,
        assignedDay: ((idx % numDays) + 1).toString()
      })
    })

    cityRestaurants.forEach((rest, idx) => {
      newBucketList.push({
        ...rest,
        id: rest.id || `b-rest-${idx}`,
        name: rest.name,
        title: rest.name,
        category: rest.cuisine || 'Local Gastronomy',
        type: 'restaurant',
        suggestedBy: squadNames[(idx + 2) % squadNames.length],
        rating: rest.rating || 4.8,
        lat: rest.lat || (place.lat ? place.lat + 0.005 * (idx + 1) : 5.4164),
        lng: rest.lng || (place.lng ? place.lng + 0.005 * (idx + 1) : 100.3327),
        image: rest.image,
        isMustVisit: idx === 0,
        assignedDay: ((idx % numDays) + 1).toString()
      })
    })

    let hubName = `${place.city} Station / Central Hub`
    if (place.city?.includes('Penang')) {
      hubName = 'Penang Sentral / Georgetown Ferry Hub'
    } else if (place.city?.includes('Ipoh')) {
      hubName = 'Ipoh Railway Station (怡保火车站)'
    } else if (place.city?.includes('Kuala Lumpur')) {
      hubName = 'KL Sentral / Railway Station'
    } else if (place.city?.includes('Tokyo')) {
      hubName = 'Tokyo Station (Marunouchi)'
    } else if (place.city?.includes('Bangkok')) {
      hubName = 'Bangkok Krung Thep Aphiwat Central'
    }

    const newSmartItinerary = generateSmartItinerary({
      durationDays: numDays,
      startingPoint: {
        name: hubName,
        lat: place.lat || 3.1390,
        lng: place.lng || 101.6869
      },
      arrivalTimeStr: '10:00 AM',
      confirmedItems: newBucketList,
      pace: 'balanced'
    })

    return { newBucketList, newSmartItinerary }
  }

  const initialCityData = buildCitySmartData(countriesData[0]?.places[0], 3)

  // Group Bucket List (Collected Google Maps Links & Chat Recommendations)
  const [bucketList, setBucketList] = useState(initialCityData.newBucketList)

  // Generated Smart Route Result
  const [smartItinerary, setSmartItinerary] = useState(initialCityData.newSmartItinerary)

  // Add item to Bucket List
  const addToBucketList = (item) => {
    setBucketList(prev => {
      if (prev.some(b => b.id === item.id || b.name === item.name)) return prev
      return [...prev, item]
    })
  }

  // Remove item from Bucket List
  const removeFromBucketList = (id) => {
    setBucketList(prev => prev.filter(b => b.id !== id))
  }

  // Group Preferences & Squad State
  const [groupPreferences, setGroupPreferences] = useState({
    vibes: ['foodie', 'culture', 'nature'],
    dietary: ['Halal Friendly']
  })

  const [members, setMembers] = useState([
    { id: 'm1', name: 'You (Organizer)', avatar: '🌟', isOrganizer: true },
    { id: 'm2', name: 'Pei Shan', avatar: '👩', isOrganizer: false },
    { id: 'm3', name: 'Marcus', avatar: '👱‍♂️', isOrganizer: false },
    { id: 'm4', name: 'Vicky', avatar: '🧑', isOrganizer: false }
  ])

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

  // Adjust duration by 1 step
  const adjustDurationStep = delta => {
    const nextDays = Math.max(1, durationDays + delta)
    setDurationInDays(nextDays)
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
    if (num < 2200) setBudgetTier('budget')
    else if (num <= 5000) setBudgetTier('balanced')
    else if (num <= 9500) setBudgetTier('premium')
    else setBudgetTier('luxury')
  }

  // Party presets
  const partyPresets = [
    { id: 'solo', label: 'Solo Trip', icon: User, defaultCount: 1, desc: 'Solo explorer & cafes' },
    { id: 'couple', label: 'Couple', icon: Heart, defaultCount: 2, desc: 'Romantic & scenic' },
    { id: 'family', label: 'Family with Kids', icon: Users2, defaultCount: 4, desc: 'Kid-friendly & relaxed' },
    { id: 'friends', label: 'Friends Group', icon: Users, defaultCount: 4, desc: 'Fun activities & food crawls' }
  ]

  const budgetPresets = [
    { id: 'budget', label: 'Budget ($)', amount: 1800 },
    { id: 'balanced', label: 'Balanced ($$)', amount: 3800 },
    { id: 'premium', label: 'Premium ($$$)', amount: 7200 },
    { id: 'luxury', label: 'Luxury ($$$$)', amount: 14000 }
  ]

  // Update travellers count when party changes
  const handlePartyChange = partyId => {
    setTravelParty(partyId)
    const found = partyPresets.find(p => p.id === partyId)
    if (found) {
      setTravellers(found.defaultCount)
      if (partyId === 'solo') {
        setMembers([members[0]])
      } else if (members.length < found.defaultCount) {
        setMembers([
          { id: 'm1', name: 'You (Organizer)', avatar: '🌟', isOrganizer: true },
          { id: 'm2', name: 'Pei Shan', avatar: '👩', isOrganizer: false },
          { id: 'm3', name: 'Marcus', avatar: '👱‍♂️', isOrganizer: false },
          { id: 'm4', name: 'Vicky', avatar: '🧑', isOrganizer: false }
        ].slice(0, found.defaultCount))
      }
    }
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

    if (selectedCity.attractions && selectedCity.attractions.length > 0) {
      setAttractions(selectedCity.attractions)
    }
    if (selectedCity.restaurants && selectedCity.restaurants.length > 0) {
      setRestaurants(selectedCity.restaurants)
    }

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
    const enrichedPlace = {
      ...place,
      country: c.country,
      countryCode: c.code,
      flag: c.flag
    }
    setSelectedCity(enrichedPlace)
    setSearchQuery(place.city)
    setSearchOpen(false)

    // Synchronize Bucket List and Smart Route timeline to this selected city!
    const { newBucketList, newSmartItinerary } = buildCitySmartData(enrichedPlace, durationDays)
    setBucketList(newBucketList)
    setSmartItinerary(newSmartItinerary)
  }

  // Smart 1-Click Auto-Populate Basket based on Party & Budget
  const handleSmartAutoFill = () => {
    const topAttractions = attractions.slice(0, 4).map(a => ({ ...a, type: 'attraction' }))
    const topDining = restaurants.slice(0, 3).map(r => ({ ...r, type: 'restaurant' }))
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

  // Apply Plan B Contingency
  const handleApplyPlanB = (scenarioId, optimizedSpots) => {
    const newSpots = (optimizedSpots || []).map((s, idx) => ({
      id: `planb-${Date.now()}-${idx}`,
      title: s.title,
      name: s.title,
      type: s.type.includes('Dining') ? 'restaurant' : 'attraction',
      category: s.type,
      rating: '4.8 ★',
      priceTier: '$$',
      isPlanB: true
    }))

    setBasket(prev => {
      const filtered = prev.filter(p => !p.isPlanB)
      return [...filtered, ...newSpots]
    })

    setPlanBToast(`Plan B applied! ${newSpots.length} contingency spots added to your live itinerary.`)
    setTimeout(() => setPlanBToast(null), 4500)
  }

  // Estimated Live Trip Cost Calculation
  const estimatedTotalCost = useMemo(() => {
    let sum = 0
    if (selectedFlight) sum += (selectedFlight.totalPrice || selectedFlight.price || 400)
    if (selectedHotel) sum += (selectedHotel.totalPrice || selectedHotel.price || 600)
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

  // Stepper Sequence Navigation
  const stepsOrder = ['setup', 'budget', 'explore', 'planb', 'group', 'pack']

  const handleNextStep = () => {
    const currentIndex = stepsOrder.indexOf(currentPage)
    if (currentIndex >= 0 && currentIndex < stepsOrder.length - 1) {
      setCurrentPage(stepsOrder[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    const currentIndex = stepsOrder.indexOf(currentPage)
    if (currentIndex > 0) {
      setCurrentPage(stepsOrder[currentIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="app-root-wrapper">
      <div className="app-layout">
        {/* TOP HEADER & GLOBAL 6-STEP NAVIGATION */}
        <header className="global-header app-native-header">
          <div className="header-container">
            <div className="brand-group" onClick={() => setCurrentPage('setup')}>
              <div className="brand-logo-icon" style={{ width: 38, height: 38, flexShrink: 0 }}>
                <Map size={18} />
              </div>
              <div className="brand-text">
                <div className="brand-title-row">
                  <span className="brand-name">PlanTrip</span>
                  <span className="app-pill-badge">PRO</span>
                </div>
                <span className="brand-tagline">Zero-Stress Travel AI</span>
              </div>
            </div>

            {/* QUICK DESTINATION & DATES PILL */}
            <div className="header-dest-pill" onClick={() => setCurrentPage('setup')}>
              <MapPin size={13} className="text-cyan" />
              <span className="pill-dest-city">{selectedCity.city}</span>
              <span className="pill-dot">·</span>
              <span className="pill-dest-dur">{durationDays}D</span>
              <span className="pill-dot">·</span>
              <span className="pill-dest-party">{travellers} Pax</span>
            </div>

            {/* PROGRESSIVE 6-STEP NAVIGATION (DESKTOP & TABLET) */}
            <nav className="stepper-nav desktop-only">
              <button
                className={`step-link ${currentPage === 'setup' ? 'active' : ''}`}
                onClick={() => setCurrentPage('setup')}
              >
                <span className="step-num">1</span>
                <span className="step-label">1. Setup</span>
              </button>

              <div className="step-arrow"><ChevronRight size={13} /></div>

              <button
                className={`step-link ${currentPage === 'budget' ? 'active' : ''}`}
                onClick={() => setCurrentPage('budget')}
              >
                <span className="step-num">2</span>
                <span className="step-label">2. Budget</span>
              </button>

              <div className="step-arrow"><ChevronRight size={13} /></div>

              <button
                className={`step-link ${currentPage === 'explore' ? 'active' : ''}`}
                onClick={() => setCurrentPage('explore')}
              >
                <span className="step-num">3</span>
                <span className="step-label">3. Discover</span>
              </button>

              <div className="step-arrow"><ChevronRight size={13} /></div>

              <button
                className={`step-link ${currentPage === 'planb' ? 'active' : ''}`}
                onClick={() => setCurrentPage('planb')}
              >
                <span className="step-num highlight">4</span>
                <span className="step-label highlight">4. ⚡ Plan B</span>
              </button>

              <div className="step-arrow"><ChevronRight size={13} /></div>

              <button
                className={`step-link ${currentPage === 'group' ? 'active' : ''}`}
                onClick={() => setCurrentPage('group')}
              >
                <span className="step-num">5</span>
                <span className="step-label">5. Squad</span>
              </button>

              <div className="step-arrow"><ChevronRight size={13} /></div>

              <button
                className={`step-link ${currentPage === 'pack' ? 'active' : ''}`}
                onClick={() => setCurrentPage('pack')}
              >
                <span className="step-num">6</span>
                <span className="step-label">6. Export</span>
              </button>
            </nav>

            {/* HEADER RIGHT ACTIONS */}
            <div className="header-actions">
              {/* LINK COLLECTOR / GROUP CHAT DROP BUTTON */}
              <button
                className="btn-link-collector-header"
                onClick={() => setLinkCollectorOpen(true)}
                title="群聊自动收藏 · Drop Google Maps Links & Chat Wishes"
              >
                <Link2 size={15} />
                <span className="desktop-only">Link Collector</span>
                <span className="collector-badge">{bucketList.length}</span>
              </button>

              {/* 1-CLICK GENERATE SMART ROUTE BUTTON */}
              <button
                className="btn-smart-route-header"
                onClick={() => setSmartRouteWizardOpen(true)}
                title="一键智能行程生成器 · Generate Smart Route"
              >
                <Zap size={15} />
                <span>⚡ Smart Route</span>
              </button>

              {/* GROUP SQUAD BUTTON */}
              <button
                className="btn-group-chat-header"
                onClick={() => setGroupChatOpen(true)}
                title="Squad Chat & Live Wishes"
              >
                <MessageCircle size={16} />
                <span className="desktop-only">Squad</span>
                <span className="chat-wishes-badge">{members.length}</span>
              </button>

              {/* BASKET DRAWER BUTTON */}
              <button
                className="basket-btn-header"
                onClick={() => setBasketDrawerOpen(true)}
                title="View Trip Basket"
              >
                <ShoppingBag size={16} />
                <span className="desktop-only">Basket</span>
                {totalBasketCount > 0 && (
                  <span className="basket-counter-badge">{totalBasketCount}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* TOAST FEEDBACK NOTIFICATION */}
        {planBToast && (
          <div className="planb-toast-banner fade-in">
            <Zap size={18} className="text-amber" />
            <span>{planBToast}</span>
            <button className="toast-close-btn" onClick={() => setPlanBToast(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* STEP 1: TRIP SETUP & GROUP PREFERENCE SYNC */}
        {currentPage === 'setup' && (
          <StepSetupSync
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            onSelectCountry={handleSelectCountry}
            onSelectCity={handleSelectCity}
            countriesData={countriesData}
            departureDate={departureDate}
            returnDate={returnDate}
            onDepartureDateChange={handleDepartureDateChange}
            onReturnDateChange={handleReturnDateChange}
            durationDays={durationDays}
            travelParty={travelParty}
            onPartyChange={handlePartyChange}
            travellers={travellers}
            setTravellers={setTravellers}
            budgetTier={budgetTier}
            setBudgetTier={setBudgetTier}
            travelPace={travelPace}
            setTravelPace={setTravelPace}
            groupPreferences={groupPreferences}
            setGroupPreferences={setGroupPreferences}
            members={members}
            setMembers={setMembers}
            bucketListCount={bucketList.length}
            onOpenLinkCollector={() => setLinkCollectorOpen(true)}
            onOpenSmartRouteWizard={() => setSmartRouteWizardOpen(true)}
            onNextStep={handleNextStep}
          />
        )}

        {/* STEP 2: SMART BUDGETING & EXPENSE SPLITTER */}
        {currentPage === 'budget' && (
          <StepBudgetSplitter
            budgetAmount={budgetAmount}
            setBudgetAmount={setBudgetAmount}
            budgetTier={budgetTier}
            setBudgetTier={setBudgetTier}
            travellers={travellers}
            durationDays={durationDays}
            members={members}
            basket={basket}
            selectedFlight={selectedFlight}
            selectedHotel={selectedHotel}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        )}

        {/* STEP 3: DISCOVER PLACES & LIVE ITINERARY BUILDER */}
        {currentPage === 'explore' && (
          <main className="explore-page fade-in">
            {/* STEP 3 HERO BANNER */}
            <div className="step-hero-card">
              <div className="step-badge-row">
                <span className="step-pill-number">Step 3 of 6</span>
                <span className="step-pill-tag">🗺️ Smart Route & Discover</span>
                <span className="step-mode-pill">{selectedCity.city}, {selectedCountry.country}</span>
              </div>

              <div className="explore-hero-actions-row">
                <div>
                  <h1 className="step-main-title">
                    {selectedCity.city} 智能行程生成器 (Smart Route Generator)
                  </h1>
                  <p className="step-subtitle">
                    从群聊自动收集 Google Maps 链接，一键生成不走回头路、避开休息日的多日时间轴与地图导航路线。
                  </p>
                </div>

                <div className="hero-quick-actions">
                  <button className="auto-plan-magic-btn" onClick={() => setSmartRouteWizardOpen(true)}>
                    <Zap size={17} />
                    <span>⚡ 一键生成智能行程 (Generate Smart Route)</span>
                  </button>
                  <button className="compare-fares-quick-btn" onClick={() => setLinkCollectorOpen(true)}>
                    <Link2 size={17} />
                    <span>🔗 群聊自动收藏 ({bucketList.length} Spots)</span>
                  </button>
                  <button className="compare-fares-quick-btn" onClick={() => setCurrentPage('compare')}>
                    <Scale size={17} />
                    <span>Compare Flights & Hotels</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SMART ROUTE TIMELINE VIEW (GENERATED MULTI-DAY SCHEDULE) */}
            {smartItinerary && (
              <section className="container smart-timeline-section">
                <SmartRouteTimeline
                  smartItinerary={smartItinerary}
                  destination={selectedCity}
                  onReopenWizard={() => setSmartRouteWizardOpen(true)}
                  onAddToBasket={addToBasket}
                />
              </section>
            )}

            {/* SEARCH & REGION BAR */}
            <section className="explore-search-section">
              <div className="container">
                <div className="search-filter-card">
                  <div className="search-input-group">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder={`Search attractions, foods, or districts in ${selectedCity.city}...`}
                      value={placeSearchQuery}
                      onChange={e => setPlaceSearchQuery(e.target.value)}
                    />
                    {placeSearchQuery && (
                      <button className="clear-search-btn" onClick={() => setPlaceSearchQuery('')}>
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* REAL MAP VIEW */}
            <section className="container map-section-wrapper">
              <RealMapView
                destination={selectedCity}
                selectedCity={selectedCity}
                attractions={attractions.length > 0 ? attractions : selectedCity.attractions}
                restaurants={restaurants.length > 0 ? restaurants : selectedCity.restaurants}
                places={[...attractions, ...restaurants]}
                basket={basket}
                onAddToBasket={addToBasket}
                onRemoveFromBasket={removeFromBasket}
              />
            </section>

            {/* ATTRACTIONS GRID */}
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

            {/* RESTAURANTS GRID */}
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

            {/* STEP 3 BOTTOM ACTIONS BAR */}
            <div className="step-bottom-bar">
              <button className="step-back-btn" onClick={handlePrevStep}>
                <ArrowLeft size={18} /> Back to Step 2: Budget
              </button>
              <div className="step-summary-text">
                Basket: <strong>{totalBasketCount} Items Selected</strong> · Est. RM {estimatedTotalCost.toLocaleString()}
              </div>
              <button className="step-next-primary-btn" onClick={handleNextStep}>
                Proceed to Step 4: ⚡ Plan B Studio <ArrowRight size={18} />
              </button>
            </div>
          </main>
        )}

        {/* STEP 4: ⚡ PLAN B & CONTINGENCY STUDIO */}
        {currentPage === 'planb' && (
          <StepPlanBStudio
            destination={selectedCity}
            travellers={travellers}
            travelParty={travelParty}
            departureDate={departureDate}
            returnDate={returnDate}
            durationDays={durationDays}
            budgetAmount={budgetAmount}
            basket={basket}
            onApplyPlanB={handleApplyPlanB}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        )}

        {/* STEP 5: GROUP COLLABORATION ROOM */}
        {currentPage === 'group' && (
          <StepGroupRoom
            destination={selectedCity}
            travellers={travellers}
            travelParty={travelParty}
            members={members}
            setMembers={setMembers}
            basket={basket}
            onAddToBasket={addToBasket}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        )}

        {/* STEP 6: PACK, EXPORT & POSTCARDS */}
        {currentPage === 'pack' && (
          <StepPackExport
            destination={selectedCity}
            travellers={travellers}
            travelParty={travelParty}
            departureDate={departureDate}
            returnDate={returnDate}
            durationDays={durationDays}
            budgetAmount={budgetAmount}
            basket={basket}
            selectedFlight={selectedFlight}
            selectedHotel={selectedHotel}
            onNavigateToPostcard={() => setCurrentPage('postcard')}
            onPrevStep={handlePrevStep}
          />
        )}

        {/* DEEP-DIVE VIEW: COMPARE FLIGHTS & STAYS */}
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

        {/* DEEP-DIVE VIEW: AI ITINERARY DOCUMENT */}
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

        {/* DEEP-DIVE VIEW: POSTCARD CHECK-IN STUDIO */}
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

        {/* LINK COLLECTOR MODAL */}
        <LinkCollectorDrawer
          isOpen={linkCollectorOpen}
          onClose={() => setLinkCollectorOpen(false)}
          destination={selectedCity}
          bucketList={bucketList}
          onAddToBucket={addToBucketList}
          onRemoveFromBucket={removeFromBucketList}
          onOpenSmartRouteWizard={() => setSmartRouteWizardOpen(true)}
        />

        {/* 3-STEP SMART ROUTE GENERATOR WIZARD */}
        <SmartRouteWizard
          isOpen={smartRouteWizardOpen}
          onClose={() => setSmartRouteWizardOpen(false)}
          destination={selectedCity}
          departureDate={departureDate}
          returnDate={returnDate}
          onDepartureDateChange={handleDepartureDateChange}
          onReturnDateChange={handleReturnDateChange}
          durationDays={durationDays}
          bucketList={bucketList}
          onGeneratedRoute={(newItinerary) => {
            setSmartItinerary(newItinerary)
            setCurrentPage('explore')
            setPlanBToast(`⚡ Generated ${newItinerary.totalDays}-Day optimized route with ${newItinerary.totalSpotsScheduled} stops (Total ${newItinerary.totalEstimatedKm} km, 0 backtracking)!`)
            setTimeout(() => setPlanBToast(null), 5000)
          }}
        />

        {/* NATIVE PERSISTENT MOBILE BOTTOM NAVIGATION TAB BAR */}
        <AppBottomNav
          currentPage={currentPage}
          onSelectPage={page => {
            setCurrentPage(page)
            setGroupChatOpen(false)
            setBasketDrawerOpen(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          basketCount={totalBasketCount}
          onOpenBasket={() => setBasketDrawerOpen(true)}
          onOpenGroupChat={() => setGroupChatOpen(true)}
          groupChatOpen={groupChatOpen}
          basketOpen={basketDrawerOpen}
        />

        {/* INSTALL APP MODAL */}
        <InstallAppModal
          isOpen={installModalOpen}
          onClose={() => setInstallModalOpen(false)}
        />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
