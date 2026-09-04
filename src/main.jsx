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
import WebFooter from './WebFooter'
import StepSetupSync from './StepSetupSync'
import StepBudgetSplitter from './StepBudgetSplitter'
import StepPlanBStudio from './StepPlanBStudio'
import StepPackExport from './StepPackExport'
import OriginDashboard from './OriginDashboard'
import StagePlanning from './StagePlanning'
import StageTravelling from './StageTravelling'
import StageMemory from './StageMemory'
import PublicTripsPage from './PublicTripsPage'
import { countriesData, popularDestinations } from './data/destinationsData'
import { generateSmartItinerary } from './utils/routeOptimizer'
import './styles.css'

function App() {
  // Navigation Flow: 'dashboard' (1st page) | 'planning' | 'travelling' | 'memory'
  // Deep-dive Views: 'compare' | 'ai' | 'postcard'
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [planningStep, setPlanningStep] = useState('setup')
  const [planningDiscoverView, setPlanningDiscoverView] = useState('hub')
  const [isCalendarAdded, setIsCalendarAdded] = useState(false)
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
      hubName = 'Ipoh Railway Station'
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
  const [exploreSubView, setExploreSubView] = useState('places') // 'places' | 'itinerary' | 'compare'

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
        {/* TOP HEADER & 3-STAGE NAVIGATION */}
        <header className="global-header app-native-header">
          <div className="header-container">
            {/* BRAND */}
            <div className="brand-group" onClick={() => { setCurrentPage('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <div className="brand-logo-icon">
                <Map size={18} />
              </div>
              <div className="brand-text">
                <span className="brand-name">PlanTrip</span>
              </div>
            </div>

            {/* HEADER RIGHT ACTIONS */}
            <div className="header-actions">
              {/* PUBLIC / OPEN TRIPS */}
              <button
                className="btn-smart-route-header"
                onClick={() => { setCurrentPage('public'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                title="Open Trips — host or join a trip with other travellers"
              >
                <Users2 size={14} />
                <span className="desktop-only">Open Trips</span>
              </button>

              {/* CURRENT DESTINATION PILL */}
              <button
                className="header-dest-pill"
                onClick={() => { setCurrentPage('planning'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                title="Change Destination & Dates"
              >
                <MapPin size={13} className="text-cyan" />
                <span className="pill-dest-city">{selectedCity.city}</span>
                <span className="pill-dest-dur">{durationDays}D</span>
              </button>

              {/* 1-CLICK SMART ROUTE BUTTON */}
              <button
                className="btn-smart-route-header"
                onClick={() => setSmartRouteWizardOpen(true)}
                title="Generate Optimized Multi-Day Route"
              >
                <Zap size={14} />
                <span className="desktop-only">Smart Route</span>
              </button>

              {/* BASKET DRAWER BUTTON */}
              <button
                className="basket-btn-header"
                onClick={() => setBasketDrawerOpen(true)}
                title="View Trip Basket"
              >
                <ShoppingBag size={14} />
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
            <Zap size={16} className="text-amber" />
            <span>{planBToast}</span>
            <button className="toast-close-btn" onClick={() => setPlanBToast(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* 1. 🏠 ORIGIN DASHBOARD (ONLY PAGE ON 1ST LOAD) */}
        {currentPage === 'dashboard' && (
          <OriginDashboard
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            departureDate={departureDate}
            returnDate={returnDate}
            travellers={travellers}
            travelParty={travelParty}
            budgetAmount={budgetAmount}
            basket={basket}
            isCalendarAdded={isCalendarAdded}
            onNavigateStage={(st) => {
              setCurrentPage(st)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onOpenDateEditor={() => {
              setCurrentPage('planning')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onOpenSmartWizard={() => setSmartRouteWizardOpen(true)}
          />
        )}

        {/* 2. 📋 PLANNING STAGE (SETUP, OVERALL BUDGET, DISCOVER 3-CARDS, PACK) */}
        {currentPage === 'planning' && (
          <StagePlanning
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
            budgetAmount={budgetAmount}
            setBudgetAmount={setBudgetAmount}
            travelPace={travelPace}
            setTravelPace={setTravelPace}
            groupPreferences={groupPreferences}
            setGroupPreferences={setGroupPreferences}
            members={members}
            setMembers={setMembers}
            basket={basket}
            addToBasket={addToBasket}
            removeFromBasket={removeFromBasket}
            selectedFlight={selectedFlight}
            selectedHotel={selectedHotel}
            setSelectedFlight={setSelectedFlight}
            setSelectedHotel={setSelectedHotel}
            originAirport={originAirport}
            smartItinerary={smartItinerary}
            planningStep={planningStep}
            setPlanningStep={setPlanningStep}
            discoverCardView={planningDiscoverView}
            setDiscoverCardView={setPlanningDiscoverView}
            onOpenLinkCollector={() => setLinkCollectorOpen(true)}
            onOpenSmartWizard={() => setSmartRouteWizardOpen(true)}
            onAddToCalendar={() => {
              setIsCalendarAdded(true)
              setPlanBToast('📅 Added to Calendar! Countdown is live on your Dashboard.')
              setTimeout(() => setPlanBToast(null), 5000)
            }}
            onBackToDashboard={() => {
              setCurrentPage('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {/* 3. 🚗 TRAVELLING STAGE (EXPENSE SPLITTER & PLAN B) */}
        {currentPage === 'travelling' && (
          <StageTravelling
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            departureDate={departureDate}
            returnDate={returnDate}
            durationDays={durationDays}
            travellers={travellers}
            travelParty={travelParty}
            members={members}
            setMembers={setMembers}
            budgetAmount={budgetAmount}
            budgetTier={budgetTier}
            basket={basket}
            onApplyPlanB={handleApplyPlanB}
            onBackToDashboard={() => {
              setCurrentPage('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {/* 4. 📸 MEMORY STAGE (AI DIGITAL POSTCARD & BUDGET VS ACTUAL SUMMARY) */}
        {currentPage === 'memory' && (
          <StageMemory
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
            departureDate={departureDate}
            returnDate={returnDate}
            durationDays={durationDays}
            travellers={travellers}
            travelParty={travelParty}
            budgetAmount={budgetAmount}
            budgetTier={budgetTier}
            basket={basket}
            smartItinerary={smartItinerary}
            onBackToDashboard={() => {
              setCurrentPage('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {/* 5. 🚪 OPEN TRIPS (HOST / JOIN A PUBLIC GROUP TRIP & PLAN TOGETHER) */}
        {currentPage === 'public' && (
          <PublicTripsPage
            defaultCity={selectedCity?.city}
            defaultCountry={selectedCountry?.country}
            defaultDeparture={departureDate}
            defaultReturn={returnDate}
            onBack={() => {
              setCurrentPage('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
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
            onNavigateToExplore={() => {
              setPlanningStep('discover')
              setPlanningDiscoverView('hub')
              setCurrentPage('planning')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
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
            onNavigateToExplore={() => {
              setPlanningStep('discover')
              setPlanningDiscoverView('hub')
              setCurrentPage('planning')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onNavigateToCompare={() => setCurrentPage('compare')}
          />
        )}

        {/* DEEP-DIVE VIEW: POSTCARD CHECK-IN STUDIO */}
        {currentPage === 'postcard' && (
          <PostcardCheckinPage
            selectedCity={selectedCity}
            basket={basket}
            initialSpot={postcardInitialSpot}
            onBackToExplore={() => {
              setCurrentPage('memory')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
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
            setPlanningStep('discover')
            setPlanningDiscoverView('timeline')
            setCurrentPage('planning')
            setPlanBToast(`⚡ Generated ${newItinerary.totalDays}-Day optimized route with ${newItinerary.totalSpotsScheduled} stops (Total ${newItinerary.totalEstimatedKm} km, 0 backtracking)!`)
            setTimeout(() => setPlanBToast(null), 5000)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />

        {/* MODERN RESPONSIVE WEBSITE FOOTER */}
        <WebFooter
          onSelectPage={page => {
            setCurrentPage(page)
            setGroupChatOpen(false)
            setBasketDrawerOpen(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onSelectCity={cityName => {
            const foundCountry = countriesData.find(c => c.places.some(p => p.city.toLowerCase().includes(cityName.toLowerCase())))
            if (foundCountry) {
              const foundPlace = foundCountry.places.find(p => p.city.toLowerCase().includes(cityName.toLowerCase()))
              if (foundPlace) {
                handleSelectCity(foundPlace, foundCountry)
                setCurrentPage('planning')
              }
            }
          }}
          countriesData={countriesData}
        />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
