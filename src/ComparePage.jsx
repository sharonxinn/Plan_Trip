import React, { useState, useEffect } from 'react'
import {
  Plane, BedDouble, ArrowRight, ArrowLeftRight, Calendar, Users,
  ExternalLink, Check, Star, ShieldCheck, Sparkles, AlertCircle, Wifi, Loader2
} from 'lucide-react'

export default function ComparePage({
  destination,
  originAirport = { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia' },
  departureDate,
  returnDate,
  travellers = 2,
  onUpdateDates,
  onSelectFlight,
  onSelectHotel,
  selectedFlight,
  selectedHotel,
  onNavigateToAI,
  onNavigateToExplore
}) {
  const [activeTab, setActiveTab] = useState('flights') // 'flights' | 'hotels'
  const [tripType, setTripType] = useState('Round trip')
  const [flightResults, setFlightResults] = useState([])
  const [hotelResults, setHotelResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const destCode = destination?.airportCode || destination?.city?.slice(0, 3)?.toUpperCase() || 'HND'
  const cityName = destination?.city || 'Tokyo'

  useEffect(() => {
    fetchComparisons()
  }, [destination, departureDate, returnDate, travellers, tripType])

  const fetchComparisons = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Fetch flights comparison
      const flightParams = new URLSearchParams({
        origin: originAirport.code || 'KUL',
        destination: destCode,
        departureDate: departureDate || '2026-09-15',
        returnDate: returnDate || '2026-09-20',
        tripType,
        adults: travellers,
        currency: 'MYR'
      })
      const fRes = await fetch(`/api/compare/flights?${flightParams}`)
      const fData = await fRes.json()
      setFlightResults(fData.providers || [])

      // 2. Fetch hotels comparison
      const hotelParams = new URLSearchParams({
        city: cityName,
        checkin: departureDate || '2026-09-15',
        checkout: returnDate || '2026-09-20',
        guests: travellers,
        currency: 'MYR'
      })
      const hRes = await fetch(`/api/compare/hotels?${hotelParams}`)
      const hData = await hRes.json()
      setHotelResults(hData.hotels || [])
    } catch (err) {
      setError('Unable to fetch live provider rates. Showing verified direct booking links.')
    } finally {
      setLoading(false)
    }
  }

  // Pre-calculated live links
  const airasiaLink = `https://www.airasia.com/flights/search/?origin=${originAirport.code}&destination=${destCode}&departDate=${departureDate}&returnDate=${returnDate}&adult=${travellers}&currency=MYR`
  const bookingLink = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}&checkin=${departureDate}&checkout=${returnDate}&group_adults=${travellers}&selected_currency=MYR`
  const tripFlightLink = `https://www.trip.com/flights/showfarefirst?dcity=${originAirport.code.toLowerCase()}&acity=${destCode.toLowerCase()}&ddate=${departureDate}&rdate=${returnDate}&quantity=${travellers}&curr=MYR`
  const tripHotelLink = `https://www.trip.com/hotels/list?city=${encodeURIComponent(cityName)}&checkIn=${departureDate}&checkOut=${returnDate}&adult=${travellers}&curr=MYR`

  return (
    <div className="compare-page">
      {/* Header Banner */}
      <div className="compare-header">
        <div className="container">
          <div className="breadcrumbs">
            <button onClick={onNavigateToExplore} className="crumb-btn">
              1. 🌍 Explore {cityName}
            </button>
            <span className="crumb-divider">/</span>
            <span className="crumb-active">2. ✈️ Compare Tickets & Stays</span>
            <span className="crumb-divider">/</span>
            <button onClick={onNavigateToAI} className="crumb-btn">
              3. 🤖 AI Itinerary
            </button>
          </div>

          <h1 className="page-title">
            Compare Real Fares & Stays across Top Providers
          </h1>
          <p className="page-subtitle">
            Real-time price matrix and verified deep-links for <strong>AirAsia</strong>, <strong>Booking.com</strong>, and <strong>Trip.com</strong>.
          </p>

          {/* Quick Route Summary Card */}
          <div className="route-summary-bar">
            <div className="route-info-cell">
              <span className="cell-label">ROUTE</span>
              <strong>{originAirport.code} ({originAirport.city}) ➔ {destCode} ({cityName})</strong>
            </div>

            <div className="route-info-cell">
              <span className="cell-label">DATES</span>
              <strong>{departureDate} — {returnDate}</strong>
            </div>

            <div className="route-info-cell">
              <span className="cell-label">TRAVELLERS</span>
              <strong>{travellers} Adults · Economy / 1 Room</strong>
            </div>

            <button
              className="btn-next-step"
              onClick={onNavigateToAI}
            >
              <Sparkles size={16} /> Proceed to AI Itinerary <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container main-compare-body">
        {/* Navigation Tabs */}
        <div className="compare-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => setActiveTab('flights')}
          >
            <Plane size={18} />
            <span>Compare Flight Tickets (AirAsia vs Trip.com vs Skyscanner)</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            <BedDouble size={18} />
            <span>Compare Accommodations (Booking.com vs Trip.com)</span>
          </button>
        </div>

        {/* Live Provider Direct Links Hub */}
        <div className="provider-links-hub">
          <div className="hub-title">
            <ShieldCheck size={18} />
            <span>Direct 1-Click Search with Exact Dates & Route:</span>
          </div>
          <div className="hub-grid">
            <a href={airasiaLink} target="_blank" rel="noreferrer" className="hub-card airasia-hub">
              <div>
                <strong>AirAsia.com</strong>
                <small>Official Direct Booking · Best Low Fare</small>
              </div>
              <ExternalLink size={16} />
            </a>

            <a href={bookingLink} target="_blank" rel="noreferrer" className="hub-card booking-hub">
              <div>
                <strong>Booking.com</strong>
                <small>Live Global Stays · Free Cancellation</small>
              </div>
              <ExternalLink size={16} />
            </a>

            <a href={activeTab === 'flights' ? tripFlightLink : tripHotelLink} target="_blank" rel="noreferrer" className="hub-card trip-hub">
              <div>
                <strong>Trip.com</strong>
                <small>Flight + Hotel Bundles · Trip Coins Cashback</small>
              </div>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <Loader2 size={32} className="spin" />
            <p>Comparing live rates across AirAsia, Booking.com, and Trip.com...</p>
          </div>
        )}

        {/* FLIGHTS TAB */}
        {!loading && activeTab === 'flights' && (
          <div className="comparison-content">
            <div className="matrix-heading">
              <h2>Flight Ticket Comparison Matrix</h2>
              <span className="live-badge"><Wifi size={13} /> Live Verified Data</span>
            </div>

            <div className="flights-cards-list">
              {flightResults.map(flight => {
                const isSelected = selectedFlight?.id === flight.id
                return (
                  <div key={flight.id} className={`compare-card ${isSelected ? 'selected-item' : ''}`}>
                    <div className="card-provider-tag">
                      <span className={`provider-badge ${flight.provider.toLowerCase().replace(/[^a-z]/g, '')}`}>
                        {flight.provider}
                      </span>
                      {flight.tag && <span className="highlight-tag">{flight.tag}</span>}
                    </div>

                    <div className="compare-card-grid">
                      {/* Airline & Flight Number */}
                      <div className="airline-col">
                        <strong>{flight.airline}</strong>
                        <small>{flight.flightNumber || flight.airlineCode}</small>
                      </div>

                      {/* Flight Timetable */}
                      <div className="schedule-col">
                        <div className="time-block">
                          <span className="time-val">{flight.depart}</span>
                          <span className="city-val">{originAirport.code}</span>
                        </div>
                        <div className="duration-line">
                          <span>{flight.duration}</span>
                          <div className="line-visual">
                            <span className="dot start" />
                            <span className="bar" />
                            <Plane size={14} className="plane-icon" />
                            <span className="dot end" />
                          </div>
                          <small>{flight.direct ? 'Direct Non-stop' : `${flight.stops} Stop`}</small>
                        </div>
                        <div className="time-block">
                          <span className="time-val">{flight.arrive}</span>
                          <span className="city-val">{destCode}</span>
                        </div>
                      </div>

                      {/* Baggage & Perks */}
                      <div className="perks-col">
                        <div className="baggage-row">{flight.baggage}</div>
                        <ul className="perks-list">
                          {flight.perks?.map((p, i) => (
                            <li key={i}><Check size={12} /> {p}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Price & Action */}
                      <div className="price-action-col">
                        <div className="price-label">Total for {travellers} Travellers</div>
                        <div className="price-amount">RM {flight.totalPrice}</div>
                        <small className="price-sub">RM {flight.pricePerAdult} / person</small>

                        <div className="btn-group">
                          <button
                            className={`btn-select ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelectFlight(flight)}
                          >
                            {isSelected ? <><Check size={16} /> Selected</> : 'Select Flight'}
                          </button>
                          <a
                            href={flight.deepLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-deeplink"
                            title="Verify on provider site"
                          >
                            <ExternalLink size={14} /> Open Site
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* HOTELS TAB */}
        {!loading && activeTab === 'hotels' && (
          <div className="comparison-content">
            <div className="matrix-heading">
              <h2>Accommodation Price Comparison (Booking.com vs Trip.com)</h2>
              <span className="live-badge"><Wifi size={13} /> Multi-Provider Live Rates</span>
            </div>

            <div className="hotels-cards-list">
              {hotelResults.map((hotel, idx) => {
                return (
                  <div key={idx} className="hotel-compare-card">
                    <div
                      className="hotel-banner-img"
                      style={{ backgroundImage: `url(${hotel.image})` }}
                    >
                      <div className="star-rating-badge">
                        {'★'.repeat(hotel.starRating)}
                      </div>
                    </div>

                    <div className="hotel-main-body">
                      <div className="hotel-title-row">
                        <div>
                          <h3 className="hotel-name">{hotel.name}</h3>
                          <p className="hotel-area-text">{hotel.area}</p>
                        </div>
                        <div className="hotel-review-score">
                          <Star size={14} className="star-icon filled" />
                          <strong>{hotel.rating}★</strong>
                          <span>({hotel.reviewsCount} reviews)</span>
                        </div>
                      </div>

                      <div className="hotel-amenities-pills">
                        {hotel.amenities.map((amenity, i) => (
                          <span key={i} className="amenity-pill">{amenity}</span>
                        ))}
                      </div>

                      <p className="hotel-cancellation-notice">
                        <Check size={14} /> {hotel.cancellation}
                      </p>

                      {/* Provider Rates Side-by-Side Table */}
                      <div className="providers-rate-matrix">
                        <div className="rate-matrix-title">Price Comparison across Providers:</div>
                        <div className="rate-matrix-grid">
                          {hotel.providers.map((prov, pIdx) => {
                            const isChosen = selectedHotel?.name === hotel.name && selectedHotel?.provider === prov.name
                            return (
                              <div key={pIdx} className={`provider-rate-card ${prov.name.toLowerCase().includes('booking') ? 'booking-card' : 'trip-card'}`}>
                                <div className="prov-header">
                                  <strong>{prov.name}</strong>
                                  <span className="prov-badge">{prov.badge}</span>
                                </div>
                                <div className="prov-room-desc">{prov.roomType}</div>
                                <div className="prov-deal-tag">{prov.dealTag}</div>
                                <div className="prov-price-block">
                                  <div className="prov-price-amount">RM {prov.totalPrice}</div>
                                  <small className="prov-nightly">RM {prov.nightlyPrice} / night</small>
                                </div>
                                <div className="prov-actions">
                                  <button
                                    className={`btn-choose-hotel ${isChosen ? 'chosen' : ''}`}
                                    onClick={() => onSelectHotel({
                                      name: hotel.name,
                                      area: hotel.area,
                                      image: hotel.image,
                                      provider: prov.name,
                                      price: prov.totalPrice,
                                      nightlyPrice: prov.nightlyPrice,
                                      roomType: prov.roomType
                                    })}
                                  >
                                    {isChosen ? <><Check size={14} /> Selected</> : 'Select Stay'}
                                  </button>
                                  <a
                                    href={prov.deepLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-prov-link"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
