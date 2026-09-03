import React, { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Compass, DollarSign, MapPin, Luggage,
  Plane, BedDouble, Utensils, Map, Zap, CheckCircle2, Search, X,
  Calendar, Scale, SlidersHorizontal, Sparkles
} from 'lucide-react'
import StepSetupSync from './StepSetupSync'
import StepBudgetSplitter from './StepBudgetSplitter'
import StepPackExport from './StepPackExport'
import RealMapView from './RealMapView'
import AttractionsGrid from './AttractionsGrid'
import RestaurantsGrid from './RestaurantsGrid'
import SmartRouteTimeline from './SmartRouteTimeline'
import ComparePage from './ComparePage'

export default function StagePlanning({
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
  budgetAmount,
  setBudgetAmount,
  travelPace,
  setTravelPace,
  groupPreferences,
  setGroupPreferences,
  members,
  setMembers,
  basket,
  addToBasket,
  removeFromBasket,
  selectedFlight,
  selectedHotel,
  setSelectedFlight,
  setSelectedHotel,
  originAirport,
  smartItinerary,
  planningStep,
  setPlanningStep,
  discoverCardView: propDiscoverCardView,
  setDiscoverCardView: propSetDiscoverCardView,
  onOpenLinkCollector,
  onOpenSmartWizard,
  onAddToCalendar,
  onBackToDashboard
}) {
  // Step in Planning Stage: 'setup' (1) | 'budget' (2) | 'discover' (3) | 'pack' (4)
  const [internalStep, setInternalStep] = useState('setup')
  const [internalDiscoverView, setInternalDiscoverView] = useState('hub')
  const [placeSearchQuery, setPlaceSearchQuery] = useState('')

  const currentStep = planningStep !== undefined ? planningStep : internalStep
  const setCurrentStep = setPlanningStep || setInternalStep

  const discoverCardView = propDiscoverCardView !== undefined ? propDiscoverCardView : internalDiscoverView
  const setDiscoverCardView = propSetDiscoverCardView || setInternalDiscoverView

  const attractions = (selectedCity && selectedCity.attractions) ? selectedCity.attractions : []
  const restaurants = (selectedCity && selectedCity.restaurants) ? selectedCity.restaurants : []

  return (
    <div className="stage-planning-container fade-in">
      {/* 1. TOP SUB-NAV BAR (BACK TO DASHBOARD & 4 STEPS) */}
      <div className="container stage-subnav-bar">
        <button className="btn-back-to-dashboard" onClick={onBackToDashboard}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="stage-stepper-pills">
          <button
            className={`stage-step-pill ${currentStep === 'setup' ? 'active' : ''}`}
            onClick={() => setCurrentStep('setup')}
          >
            <span className="step-num">1</span>
            <span>Setup</span>
          </button>
          <button
            className={`stage-step-pill ${currentStep === 'budget' ? 'active' : ''}`}
            onClick={() => setCurrentStep('budget')}
          >
            <span className="step-num">2</span>
            <span>Budget (Overall)</span>
          </button>
          <button
            className={`stage-step-pill ${currentStep === 'discover' ? 'active' : ''}`}
            onClick={() => {
              setCurrentStep('discover')
              setDiscoverCardView('hub')
            }}
          >
            <span className="step-num">3</span>
            <span>Discover Hub</span>
          </button>
          <button
            className={`stage-step-pill ${currentStep === 'pack' ? 'active' : ''}`}
            onClick={() => setCurrentStep('pack')}
          >
            <span className="step-num">4</span>
            <span>Pack & Export</span>
          </button>
        </div>
      </div>

      {/* 2. STEP 1: SETUP */}
      {currentStep === 'setup' && (
        <div className="planning-step-view">
          <StepSetupSync
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            onSelectCountry={onSelectCountry}
            onSelectCity={onSelectCity}
            countriesData={countriesData}
            departureDate={departureDate}
            returnDate={returnDate}
            onDepartureDateChange={onDepartureDateChange}
            onReturnDateChange={onReturnDateChange}
            durationDays={durationDays}
            travelParty={travelParty}
            onPartyChange={onPartyChange}
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
            bucketListCount={basket.length}
            onOpenLinkCollector={onOpenLinkCollector}
            onOpenSmartRouteWizard={onOpenSmartWizard}
            onNextStep={() => setCurrentStep('budget')}
          />
        </div>
      )}

      {/* 3. STEP 2: BUDGET (OVERALL INITIAL ALLOCATION) */}
      {currentStep === 'budget' && (
        <div className="planning-step-view">
          <StepBudgetSplitter
            budgetAmount={budgetAmount}
            setBudgetAmount={setBudgetAmount}
            budgetTier={budgetTier}
            setBudgetTier={setBudgetTier}
            travellers={travellers}
            selectedCity={selectedCity}
            travelParty={travelParty}
            onNextStep={() => {
              setCurrentStep('discover')
              setDiscoverCardView('hub')
            }}
            onPrevStep={() => setCurrentStep('setup')}
          />
        </div>
      )}

      {/* 4. STEP 3: DISCOVER SUB-HUB (3 CARDS: TRANSPORT, ACCOMMODATION, PLACES & RESTAURANTS) */}
      {currentStep === 'discover' && (
        <div className="planning-step-view discover-subhub-view">
          {/* DISCOVER INNER DASHBOARD (3 CARDS) */}
          {discoverCardView === 'hub' && (
            <div className="container discover-hub-dashboard fade-in">
              <div className="discover-hub-header">
                <div className="hub-badge-row">
                  <span className="hub-badge">Step 3 · Discover Hub</span>
                  <span className="hub-city-pill">📍 {selectedCity?.city || 'Destination'}</span>
                </div>
                <h2>Explore & Select Bookings</h2>
                <p>Compare transportation, choose your stays, and discover top attractions and dining</p>
              </div>

              <div className="discover-three-cards-grid">
                {/* CARD 1: TRANSPORTATION */}
                <div className="discover-card-tile" onClick={() => setDiscoverCardView('transport')}>
                  <div className="tile-icon-circle transport">
                    <Plane size={24} />
                  </div>
                  <div className="tile-body">
                    <h3>1. Transportation</h3>
                    <p>Compare flights, trains, ferry routes, and airport transfers for {selectedCity?.city}.</p>
                    <div className="tile-highlights">
                      <span>✓ Flight Deals</span>
                      <span>✓ Route Times</span>
                      <span>✓ Price Comparison</span>
                    </div>
                  </div>
                  <div className="tile-footer">
                    <span className="tile-status-tag">
                      {selectedFlight ? `Selected: ${selectedFlight.airline || 'Flight'}` : 'Browse Flights & Trains'}
                    </span>
                    <button className="btn-open-tile transport-btn">
                      <span>Open Transport</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* CARD 2: ACCOMMODATION */}
                <div className="discover-card-tile" onClick={() => setDiscoverCardView('hotel')}>
                  <div className="tile-icon-circle hotel">
                    <BedDouble size={24} />
                  </div>
                  <div className="tile-body">
                    <h3>2. Accommodation</h3>
                    <p>Compare verified hotels, boutique resorts, and homestays with direct booking links.</p>
                    <div className="tile-highlights">
                      <span>✓ Verified Ratings</span>
                      <span>✓ Price per Night</span>
                      <span>✓ Key Amenities</span>
                    </div>
                  </div>
                  <div className="tile-footer">
                    <span className="tile-status-tag">
                      {selectedHotel ? `Selected: ${selectedHotel.name || 'Hotel'}` : 'Compare Stays'}
                    </span>
                    <button className="btn-open-tile hotel-btn">
                      <span>Open Stays</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* CARD 3: PLACES & RESTAURANTS */}
                <div className="discover-card-tile" onClick={() => setDiscoverCardView('places')}>
                  <div className="tile-icon-circle places">
                    <MapPin size={24} />
                  </div>
                  <div className="tile-body">
                    <h3>3. Places & Restaurants</h3>
                    <p>Interactive Google Maps, must-visit sights, local gastronomy, and 1-click smart route timeline.</p>
                    <div className="tile-highlights">
                      <span>✓ Real Map View</span>
                      <span>✓ Top Attractions</span>
                      <span>✓ Smart Timeline</span>
                    </div>
                  </div>
                  <div className="tile-footer">
                    <span className="tile-status-tag">
                      {basket.length} spots in basket
                    </span>
                    <button className="btn-open-tile places-btn">
                      <span>Explore Places</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Next Step Bar */}
              <div className="step-bottom-bar mt-5">
                <button className="step-back-btn" onClick={() => setCurrentStep('budget')}>
                  <ArrowLeft size={16} /> Back to Budget
                </button>
                <div className="step-summary-text">
                  Basket: <strong>{basket.length} Items</strong> · Selected Stays & Flights
                </div>
                <button className="step-next-primary-btn" onClick={() => setCurrentStep('pack')}>
                  Proceed to Step 4: Pack & Export <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* INNER VIEW: TRANSPORTATION & FLIGHTS */}
          {discoverCardView === 'transport' && (
            <div className="discover-sub-view fade-in">
              <div className="container sub-view-top-bar">
                <button className="btn-back-to-hub" onClick={() => setDiscoverCardView('hub')}>
                  <ArrowLeft size={16} />
                  <span>Back to Discover Hub</span>
                </button>
                <h3>Transportation Options for {selectedCity?.city}</h3>
              </div>
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
                onNavigateToExplore={() => setDiscoverCardView('hub')}
              />
            </div>
          )}

          {/* INNER VIEW: ACCOMMODATION / HOTELS */}
          {discoverCardView === 'hotel' && (
            <div className="discover-sub-view fade-in">
              <div className="container sub-view-top-bar">
                <button className="btn-back-to-hub" onClick={() => setDiscoverCardView('hub')}>
                  <ArrowLeft size={16} />
                  <span>Back to Discover Hub</span>
                </button>
                <h3>Accommodation & Stays in {selectedCity?.city}</h3>
              </div>
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
                onNavigateToExplore={() => setDiscoverCardView('hub')}
              />
            </div>
          )}

          {/* INNER VIEW: PLACES & RESTAURANTS & SMART ROUTE */}
          {discoverCardView === 'places' && (
            <div className="discover-sub-view fade-in">
              <div className="container sub-view-top-bar">
                <button className="btn-back-to-hub" onClick={() => setDiscoverCardView('hub')}>
                  <ArrowLeft size={16} />
                  <span>Back to Discover Hub</span>
                </button>
                <div className="places-tabs-switcher">
                  <button
                    className={`places-sub-tab ${discoverCardView === 'places' ? 'active' : ''}`}
                    onClick={() => setDiscoverCardView('places')}
                  >
                    <Map size={14} /> Map & Attractions
                  </button>
                  <button
                    className="places-sub-tab"
                    onClick={() => setDiscoverCardView('timeline')}
                  >
                    <Calendar size={14} /> Daily Route Timeline
                  </button>
                </div>
              </div>

              {/* SEARCH BAR */}
              <section className="container mb-3">
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
              </section>

              {/* MAP VIEW */}
              <section className="container map-section-wrapper">
                <RealMapView
                  destination={selectedCity}
                  selectedCity={selectedCity}
                  attractions={attractions}
                  restaurants={restaurants}
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
                  onOpenPostcard={() => {}}
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
                  onOpenPostcard={() => {}}
                />
              </section>
            </div>
          )}

          {/* INNER VIEW: SMART ROUTE TIMELINE */}
          {discoverCardView === 'timeline' && (
            <div className="discover-sub-view fade-in">
              <div className="container sub-view-top-bar">
                <button className="btn-back-to-hub" onClick={() => setDiscoverCardView('hub')}>
                  <ArrowLeft size={16} />
                  <span>Back to Discover Hub</span>
                </button>
                <div className="places-tabs-switcher">
                  <button
                    className="places-sub-tab"
                    onClick={() => setDiscoverCardView('places')}
                  >
                    <Map size={14} /> Map & Attractions
                  </button>
                  <button
                    className="places-sub-tab active"
                    onClick={() => setDiscoverCardView('timeline')}
                  >
                    <Calendar size={14} /> Daily Route Timeline
                  </button>
                </div>
              </div>

              {smartItinerary ? (
                <section className="container smart-timeline-section">
                  <SmartRouteTimeline
                    smartItinerary={smartItinerary}
                    destination={selectedCity}
                    onReopenWizard={onOpenSmartWizard}
                    onAddToBasket={addToBasket}
                  />
                </section>
              ) : (
                <section className="container empty-timeline-card">
                  <Zap size={36} className="text-cyan mb-3" />
                  <h3>No Itinerary Generated Yet</h3>
                  <p>Click "Generate Smart Route" to automatically assemble an optimized multi-day plan.</p>
                  <button className="btn-clean-primary mt-4" onClick={onOpenSmartWizard}>
                    <Zap size={16} />
                    <span>Generate Smart Route</span>
                  </button>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. STEP 4: PACK & EXPORT */}
      {currentStep === 'pack' && (
        <div className="planning-step-view">
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
            smartItinerary={smartItinerary}
            onAddToCalendar={onAddToCalendar}
            onPrevStep={() => {
              setCurrentStep('discover')
              setDiscoverCardView('hub')
            }}
          />
        </div>
      )}
    </div>
  )
}
