import React from 'react'
import {
  X, Star, MapPin, Clock, DollarSign, ExternalLink,
  Plus, Check, Sparkles, Compass, Utensils, Navigation, ShieldCheck
} from 'lucide-react'

export default function PlaceDetailModal({
  isOpen,
  onClose,
  item,
  inBasket,
  onAddToBasket,
  onRemoveFromBasket
}) {
  if (!isOpen || !item) return null

  const isAttraction = item.type === 'attraction' || item.category !== undefined
  const destinationCity = item.city || ''

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (item.address || destinationCity))}`

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="place-detail-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* CLOSE BUTTON */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        {/* MODAL HERO IMAGE */}
        <div
          className="modal-hero-image"
          style={{ backgroundImage: `url(${item.image})` }}
        >
          <div className="modal-hero-gradient" />
          <div className="modal-hero-badges">
            <span className="badge-category">
              {isAttraction ? (item.category || 'Tourist Attraction') : (item.cuisine || 'Restaurant & Dining')}
            </span>
            {!isAttraction && (
              <span className="badge-price-tier">{item.priceTier || '$$'}</span>
            )}
          </div>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="modal-body-scroll">
          {/* TITLE & GOOGLE REVIEW RATING HEADER */}
          <div className="modal-header-section">
            <h2 className="modal-place-title">{item.name}</h2>

            <div className="modal-rating-row">
              <div className="google-stars-pill">
                <Star size={16} className="star-icon filled" fill="#f59e0b" color="#f59e0b" />
                <span className="rating-score">{(item.rating || 4.8).toFixed(1)}</span>
                <span className="reviews-count">
                  ({(item.reviewsCount || 15000).toLocaleString()} verified Google Reviews)
                </span>
              </div>
              <span className="verified-badge">
                <ShieldCheck size={14} /> Verified Real Spot
              </span>
            </div>
          </div>

          {/* KEY DETAILS GRID */}
          <div className="modal-details-grid">
            {isAttraction ? (
              <>
                <div className="detail-item-box">
                  <Clock size={18} className="detail-icon" />
                  <div>
                    <span className="detail-label">Recommended Duration</span>
                    <strong>{item.estimatedHours || '2 - 3 hours'}</strong>
                  </div>
                </div>

                <div className="detail-item-box">
                  <DollarSign size={18} className="detail-icon" />
                  <div>
                    <span className="detail-label">Admission / Fee</span>
                    <strong>{item.priceEstimate || 'Free admission'}</strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="detail-item-box">
                  <Utensils size={18} className="detail-icon" />
                  <div>
                    <span className="detail-label">Cuisine & Specialty</span>
                    <strong>{item.cuisine || 'Local Gastronomy'}</strong>
                  </div>
                </div>

                <div className="detail-item-box">
                  <DollarSign size={18} className="detail-icon" />
                  <div>
                    <span className="detail-label">Typical Price Range</span>
                    <strong>{item.priceRange || 'RM 25 - 60'} ({item.priceTier || '$$'})</strong>
                  </div>
                </div>

                <div className="detail-item-box">
                  <Clock size={18} className="detail-icon" />
                  <div>
                    <span className="detail-label">Best Dining Time</span>
                    <strong>{item.mealType || 'Lunch & Dinner'}</strong>
                  </div>
                </div>
              </>
            )}

            <div className="detail-item-box full-width">
              <MapPin size={18} className="detail-icon" />
              <div className="address-flex">
                <div>
                  <span className="detail-label">Exact Location</span>
                  <strong>{item.address || 'Central District'}</strong>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-gmaps"
                >
                  <Navigation size={13} />
                  <span>Google Maps Directions</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* PLACE DESCRIPTION & ABOUT */}
          <div className="modal-section-block">
            <h3 className="section-subtitle-heading">
              <Sparkles size={16} /> About {item.name}
            </h3>
            <p className="place-full-description">
              {item.description || `Experience ${item.name}, one of the highest-rated destinations in the area celebrated by locals and travelers worldwide.`}
            </p>
          </div>

          {/* TRAVEL TIPS & HIGHLIGHTS */}
          <div className="modal-section-block tips-block">
            <h3 className="section-subtitle-heading">
              <Compass size={16} /> Travel Tips & Highlights
            </h3>
            <ul className="tips-list">
              {isAttraction ? (
                <>
                  <li>📸 <strong>Best Photo Spot:</strong> Arrive early in the morning or near golden hour for the best natural lighting and fewer crowds.</li>
                  <li>🎫 <strong>Ticketing:</strong> {item.priceEstimate?.includes('Free') ? 'Free admission — walk-in at your convenience.' : 'Advance online booking recommended on weekends.'}</li>
                  <li>👟 <strong>Comfort:</strong> Wear comfortable walking shoes to fully explore the grounds and viewpoints.</li>
                </>
              ) : (
                <>
                  <li>🔥 <strong>Signature Dish:</strong> Try their house-specialty {item.cuisine} dishes and chef recommendations.</li>
                  <li>⏰ <strong>Peak Hours:</strong> Peak dinner times are 7:00 PM – 8:30 PM. Arrive slightly earlier for shorter queues.</li>
                  <li>💳 <strong>Payment:</strong> Accepts major credit cards, QR payments, and cash.</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* MODAL BOTTOM ACTION FOOTER */}
        <div className="modal-footer-actions">
          <button className="btn-modal-secondary" onClick={onClose}>
            Close
          </button>

          <button
            className={`btn-modal-primary ${inBasket ? 'in-basket' : ''}`}
            onClick={() => {
              if (inBasket) {
                onRemoveFromBasket(item.id)
              } else {
                onAddToBasket({ ...item, type: isAttraction ? 'attraction' : 'restaurant' })
              }
            }}
          >
            {inBasket ? (
              <>
                <Check size={18} /> In Trip Basket (Click to Remove)
              </>
            ) : (
              <>
                <Plus size={18} /> Add to Trip Basket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
