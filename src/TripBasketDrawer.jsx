import React from 'react'
import {
  ShoppingBag, X, Trash2, ArrowRight, Compass, Utensils,
  Plane, BedDouble, Star, DollarSign, Sparkles, CheckCircle2, Users, Edit3
} from 'lucide-react'

export default function TripBasketDrawer({
  isOpen,
  onClose,
  basket = [],
  selectedFlight = null,
  selectedHotel = null,
  travellers = 2,
  budgetAmount = 3500,
  onBudgetChange,
  estimatedTotalCost = 0,
  onRemoveItem,
  onClearBasket,
  onNavigateToCompare,
  onNavigateToAI
}) {
  const attractions = basket.filter(item => item.type === 'attraction' || item.category)
  const restaurants = basket.filter(item => item.type === 'restaurant' || item.cuisine)

  const totalItems = basket.length + (selectedFlight ? 1 : 0) + (selectedHotel ? 1 : 0)
  const perPersonBudget = Math.round(budgetAmount / Math.max(1, travellers))
  const budgetPercentage = Math.min(100, Math.round((estimatedTotalCost / Math.max(1, budgetAmount)) * 100))

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      {/* Drawer */}
      <aside className={`basket-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-badge">
              <ShoppingBag size={16} />
              <span>Trip Basket</span>
            </div>
            <h2>Selected for Your Trip ({totalItems})</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close basket">
            <X size={20} />
          </button>
        </div>

        {/* EDITABLE BUDGET TRACKER CARD */}
        <div className="drawer-budget-banner">
          <div className="budget-banner-header">
            <div>
              <span className="budget-title">Est. Current Total ({travellers} Pax)</span>
              <h3>RM {estimatedTotalCost.toLocaleString()}</h3>
            </div>
            <div className="budget-target-pill">
              <div className="target-input-row">
                <span>Target: RM</span>
                <input
                  type="number"
                  className="drawer-budget-input"
                  value={budgetAmount}
                  onChange={e => onBudgetChange && onBudgetChange(e.target.value)}
                  step="100"
                  min="500"
                />
              </div>
              <small>RM {perPersonBudget.toLocaleString()} / pax</small>
            </div>
          </div>
          <div className="budget-progress-track">
            <div
              className={`budget-progress-bar ${budgetPercentage > 95 ? 'warning' : ''}`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>

        <div className="drawer-content">
          {totalItems === 0 ? (
            <div className="empty-basket-state">
              <div className="empty-icon-circle">
                <ShoppingBag size={36} />
              </div>
              <h3>Your basket is empty</h3>
              <p>
                Browse through attractions and nearby restaurants on the map to add them to your trip plan, or use the <strong>"✨ Auto-Pick Best Spots"</strong> button.
              </p>
            </div>
          ) : (
            <div className="basket-items-list">
              {/* Selected Flight */}
              {selectedFlight && (
                <div className="basket-group">
                  <div className="group-heading">
                    <Plane size={15} />
                    <span>Flight Selection</span>
                  </div>
                  <div className="basket-card flight-card-mini">
                    <div className="card-top">
                      <strong>{selectedFlight.airline}</strong>
                      <span className="price-badge">RM {selectedFlight.totalPrice || selectedFlight.price}</span>
                    </div>
                    <p className="card-sub">{selectedFlight.route || `${selectedFlight.depart} → ${selectedFlight.arrive}`} · {selectedFlight.provider}</p>
                  </div>
                </div>
              )}

              {/* Selected Hotel */}
              {selectedHotel && (
                <div className="basket-group">
                  <div className="group-heading">
                    <BedDouble size={15} />
                    <span>Stay Selection</span>
                  </div>
                  <div className="basket-card hotel-card-mini">
                    <div className="card-top">
                      <strong>{selectedHotel.name}</strong>
                      <span className="price-badge">RM {selectedHotel.totalPrice || selectedHotel.price}</span>
                    </div>
                    <p className="card-sub">{selectedHotel.area} · via {selectedHotel.provider || 'Booking.com'}</p>
                  </div>
                </div>
              )}

              {/* Attractions Group */}
              {attractions.length > 0 && (
                <div className="basket-group">
                  <div className="group-heading">
                    <Compass size={15} />
                    <span>Attractions & Sights ({attractions.length})</span>
                  </div>
                  {attractions.map(item => (
                    <div key={item.id} className="basket-card">
                      <div className="card-thumb" style={{ backgroundImage: `url(${item.image})` }} />
                      <div className="card-details">
                        <div className="card-name-row">
                          <strong className="item-name">{item.name}</strong>
                          <button
                            className="remove-item-btn"
                            onClick={() => onRemoveItem(item.id)}
                            title="Remove from basket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="item-rating-row">
                          <Star size={12} className="star-icon filled" fill="#f59e0b" color="#f59e0b" />
                          <span>{(typeof item.rating === 'number' ? item.rating.toFixed(1) : String(item.rating || '4.8').replace('★', '').trim())}★</span>
                          <span className="item-category-tag">{item.category || 'Sight'}</span>
                        </div>
                        <small className="item-extra">{item.priceEstimate || 'Free admission'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Restaurants Group */}
              {restaurants.length > 0 && (
                <div className="basket-group">
                  <div className="group-heading">
                    <Utensils size={15} />
                    <span>Dining & Restaurants ({restaurants.length})</span>
                  </div>
                  {restaurants.map(item => (
                    <div key={item.id} className="basket-card">
                      <div className="card-thumb" style={{ backgroundImage: `url(${item.image})` }} />
                      <div className="card-details">
                        <div className="card-name-row">
                          <strong className="item-name">{item.name}</strong>
                          <button
                            className="remove-item-btn"
                            onClick={() => onRemoveItem(item.id)}
                            title="Remove from basket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="item-rating-row">
                          <Star size={12} className="star-icon filled" fill="#f59e0b" color="#f59e0b" />
                          <span>{(typeof item.rating === 'number' ? item.rating.toFixed(1) : String(item.rating || '4.8').replace('★', '').trim())}★</span>
                          <span className="item-price-tier">{item.priceTier || '$$'}</span>
                          <span className="item-cuisine-tag">{item.cuisine || 'Local Gastronomy'}</span>
                        </div>
                        <small className="item-extra">{item.priceRange || 'RM 20 - 50'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <div className="drawer-footer">
            <div className="drawer-action-buttons">
              <button
                className="btn-secondary-drawer"
                onClick={() => {
                  onClose()
                  onNavigateToCompare()
                }}
              >
                <Plane size={16} /> Compare Flights & Stays
              </button>

              <button
                className="btn-primary-drawer"
                onClick={() => {
                  onClose()
                  onNavigateToAI()
                }}
              >
                <Sparkles size={16} /> Plan with AI Agent
                <ArrowRight size={16} />
              </button>
            </div>

            <button className="clear-all-link" onClick={onClearBasket}>
              Clear all items
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
