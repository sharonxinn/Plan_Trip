import React, { useState } from 'react'
import {
  MapPin, ExternalLink, Compass, Star, Utensils,
  Plus, Check, Navigation, Search, Layers, RefreshCw
} from 'lucide-react'

export default function RealMapView({
  destination,
  selectedCity,
  places = [],
  attractions = [],
  restaurants = [],
  basket = [],
  onAddToBasket,
  onRemoveFromBasket
}) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'attractions' | 'restaurants'
  const [selectedPin, setSelectedPin] = useState(null)
  const [mapZoom, setMapZoom] = useState(13)

  const activeDest = destination || selectedCity || {}
  const lat = activeDest.lat || 3.1390
  const lng = activeDest.lng || 101.6869
  const cityName = activeDest.city || 'Kuala Lumpur'
  const countryName = activeDest.country || 'Malaysia'

  // Construct Google Maps embed URL
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${mapZoom}&output=embed`
  const googleMapsLiveLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cityName + ' ' + countryName)}`

  // Resolve attractions & restaurants with automatic fallbacks
  const rawAttractions = (attractions && attractions.length > 0)
    ? attractions
    : (activeDest.attractions || [])

  const rawRestaurants = (restaurants && restaurants.length > 0)
    ? restaurants
    : (activeDest.restaurants || [])

  const allPins = places.length > 0 && rawAttractions.length === 0 && rawRestaurants.length === 0
    ? places.map(p => ({ ...p, pinType: p.type === 'restaurant' || p.cuisine ? 'restaurant' : 'attraction' }))
    : [
        ...rawAttractions.map(a => ({ ...a, pinType: 'attraction' })),
        ...rawRestaurants.map(r => ({ ...r, pinType: 'restaurant' }))
      ]

  const filteredPins = activeTab === 'all'
    ? allPins
    : activeTab === 'attractions'
    ? allPins.filter(p => p.pinType === 'attraction')
    : allPins.filter(p => p.pinType === 'restaurant')

  return (
    <div className="real-map-container">
      {/* MAP CONTROLS BAR */}
      <div className="real-map-header">
        <div className="map-filter-pills">
          <button
            className={`map-filter-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Nearby ({allPins.length})
          </button>
          <button
            className={`map-filter-pill ${activeTab === 'attractions' ? 'active' : ''}`}
            onClick={() => setActiveTab('attractions')}
          >
            🏛️ Sights ({attractions.length})
          </button>
          <button
            className={`map-filter-pill ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            🍽️ Dining ({restaurants.length})
          </button>
        </div>

        <div className="map-header-actions">
          {/* Zoom Controls */}
          <div className="map-zoom-buttons">
            <button
              className="btn-zoom"
              onClick={() => setMapZoom(prev => Math.min(18, prev + 1))}
              title="Zoom In"
            >
              +
            </button>
            <span className="zoom-level-label">{mapZoom}x</span>
            <button
              className="btn-zoom"
              onClick={() => setMapZoom(prev => Math.max(8, prev - 1))}
              title="Zoom Out"
            >
              -
            </button>
          </div>

          {/* Direct Google Maps Deep Link */}
          <a
            href={googleMapsLiveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-map-control google-maps-link"
          >
            <ExternalLink size={14} />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {/* MAP BODY WITH INTERACTIVE PINS SIDEBAR */}
      <div className="real-map-body-grid">
        {/* EMBEDDED GOOGLE MAP */}
        <div className="google-map-embed-wrapper">
          <iframe
            title={`Google Map of ${cityName}`}
            src={googleMapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* NEARBY SPOTS ON-MAP RADAR DRAWER */}
        <div className="nearby-pins-sidebar">
          <div className="sidebar-header">
            <h4>
              <Compass size={16} />
              <span>Nearby Radar in {cityName}</span>
            </h4>
            <span className="count-badge">{filteredPins.length} spots</span>
          </div>

          <div className="pins-scroll-list">
            {filteredPins.length === 0 ? (
              <div className="no-pins-state">
                <p>Loading real-time Google Maps radar places...</p>
              </div>
            ) : (
              filteredPins.map((item, idx) => {
                const inBasket = basket.some(b => b.id === item.id)
                const isSelected = selectedPin?.id === item.id

                return (
                  <div
                    key={item.id || idx}
                    className={`map-spot-card ${isSelected ? 'active-pin' : ''} ${item.pinType}`}
                    onClick={() => setSelectedPin(item)}
                  >
                    <div
                      className="map-spot-thumb"
                      style={{ backgroundImage: `url(${item.image})` }}
                    >
                      <span className={`spot-type-tag ${item.pinType}`}>
                        {item.pinType === 'attraction' ? '🏛️ Sights' : '🍽️ Food'}
                      </span>
                    </div>

                    <div className="map-spot-details">
                      <div className="spot-title-row">
                        <h5>{item.name}</h5>
                        <div className="spot-rating-badge">
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <span>{item.rating || '4.8'}</span>
                        </div>
                      </div>

                      <p className="spot-address">
                        <MapPin size={11} />
                        <span>{item.address || `${cityName} Central`}</span>
                      </p>

                      <div className="spot-footer-row">
                        <span className="spot-price-tag">
                          {item.pinType === 'attraction'
                            ? (item.priceEstimate || 'Free entry')
                            : (item.priceRange || item.priceTier || '$$')}
                        </span>

                        <div className="spot-action-btns">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + cityName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-map-pin-directions"
                            title="View on Google Maps"
                            onClick={e => e.stopPropagation()}
                          >
                            <Navigation size={13} />
                          </a>

                          <button
                            className={`btn-pin-basket ${inBasket ? 'in-basket' : ''}`}
                            onClick={e => {
                              e.stopPropagation()
                              if (inBasket) {
                                onRemoveFromBasket(item.id)
                              } else {
                                onAddToBasket(item)
                              }
                            }}
                          >
                            {inBasket ? (
                              <>
                                <Check size={13} /> Added
                              </>
                            ) : (
                              <>
                                <Plus size={13} /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
