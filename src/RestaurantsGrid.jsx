import React, { useState, useMemo } from 'react'
import {
  Star, Utensils, DollarSign, MapPin, Plus, Check, Coffee, Flame,
  Sparkles, Info, Users, Heart, User, Users2, ThumbsUp, Calendar, Camera
} from 'lucide-react'
import PlaceDetailModal from './PlaceDetailModal'

export default function RestaurantsGrid({
  city,
  restaurants = [],
  basket = [],
  travelParty = 'family',
  budgetTier = 'balanced',
  durationDays = 4,
  travellers = 4,
  onAddToBasket,
  onRemoveFromBasket,
  onOpenPostcard
}) {
  const [selectedPriceTier, setSelectedPriceTier] = useState('All')
  const [sortBy, setSortBy] = useState('tailored') // 'tailored' | 'rating' | 'priceAsc' | 'priceDesc'
  const [activeModalItem, setActiveModalItem] = useState(null)

  const partyLabels = {
    solo: { label: 'Solo Explorer', icon: User },
    couple: { label: 'Romantic Couple', icon: Heart },
    family: { label: 'Family with Kids', icon: Users2 },
    friends: { label: 'Friends Group', icon: Users }
  }
  const CurrentPartyIcon = partyLabels[travelParty]?.icon || Users

  // Smart Dining Tailoring Engine
  const tailoredRestaurants = useMemo(() => {
    return restaurants.map((item, index) => {
      let score = (item.rating || 4.8) * 10 + ((item.reviewsCount || 8000) / 10000)
      const nameAndDesc = ((item.name || '') + ' ' + (item.cuisine || '') + ' ' + (item.description || '')).toLowerCase()
      let partyMatchReason = ''

      // Budget Alignment Logic
      if (budgetTier === 'budget') {
        if (item.priceTier === '$') {
          score += 35
          partyMatchReason = '🟢 Best Budget Hawker / Kopitiam'
        } else if (item.priceTier === '$$') {
          score += 10
        } else {
          score -= 20
        }
      } else if (budgetTier === 'balanced') {
        if (item.priceTier === '$$' || item.priceTier === '$') {
          score += 30
          partyMatchReason = '🔵 Great Value Quality Dining'
        } else if (item.priceTier === '$$$') {
          score += 15
        }
      } else if (budgetTier === 'premium') {
        if (item.priceTier === '$$$' || item.priceTier === '$$') {
          score += 30
          partyMatchReason = '🟣 Upscale Gourmet Experience'
        } else if (item.priceTier === '$$$$') {
          score += 25
        }
      } else if (budgetTier === 'luxury') {
        if (item.priceTier === '$$$$' || item.priceTier === '$$$') {
          score += 35
          partyMatchReason = '👑 Fine Dining & Michelin Experience'
        }
      }

      // Party Affinity Logic
      if (travelParty === 'family') {
        if (nameAndDesc.includes('family') || nameAndDesc.includes('court') || nameAndDesc.includes('noodle') ||
            nameAndDesc.includes('rice') || nameAndDesc.includes('cafe') || nameAndDesc.includes('kuih') ||
            nameAndDesc.includes('kopitiam')) {
          score += 20
          partyMatchReason = '👨‍👩‍👧‍👦 Family-Friendly & Spacious'
        }
      } else if (travelParty === 'couple') {
        if (nameAndDesc.includes('sunset') || nameAndDesc.includes('grill') || nameAndDesc.includes('bistro') ||
            nameAndDesc.includes('sky') || nameAndDesc.includes('wine') || nameAndDesc.includes('italian') ||
            nameAndDesc.includes('omakase')) {
          score += 20
          partyMatchReason = '💑 Romantic Sunset / Dinner Vibe'
        }
      } else if (travelParty === 'friends') {
        if (nameAndDesc.includes('seafood') || nameAndDesc.includes('bbq') || nameAndDesc.includes('crab') ||
            nameAndDesc.includes('steamboat') || nameAndDesc.includes('bar') || nameAndDesc.includes('kandar') ||
            nameAndDesc.includes('street')) {
          score += 20
          partyMatchReason = '👯 Perfect for Group Feasts & Sharing'
        }
      } else if (travelParty === 'solo') {
        if (nameAndDesc.includes('kopitiam') || nameAndDesc.includes('coffee') || nameAndDesc.includes('noodle') ||
            nameAndDesc.includes('cafe') || nameAndDesc.includes('bakery')) {
          score += 20
          partyMatchReason = '👤 Cozy & Solo-Friendly Dining'
        }
      }

      return {
        ...item,
        tailorScore: score,
        partyMatchReason: partyMatchReason || `⭐ Top Google Rated in ${city?.city || 'Area'}`
      }
    })
  }, [restaurants, travelParty, budgetTier, city])

  const filteredAndSorted = useMemo(() => {
    let list = [...tailoredRestaurants]

    if (selectedPriceTier !== 'All') {
      list = list.filter(r => r.priceTier === selectedPriceTier)
    }

    if (sortBy === 'tailored') {
      list.sort((a, b) => b.tailorScore - a.tailorScore)
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
    } else if (sortBy === 'priceAsc') {
      const tierMap = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }
      list.sort((a, b) => (tierMap[a.priceTier] || 2) - (tierMap[b.priceTier] || 2) || b.rating - a.rating)
    } else if (sortBy === 'priceDesc') {
      const tierMap = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }
      list.sort((a, b) => (tierMap[b.priceTier] || 2) - (tierMap[a.priceTier] || 2) || b.rating - a.rating)
    }

    return list
  }, [tailoredRestaurants, selectedPriceTier, sortBy])

  const isInBasket = id => basket.some(item => item.id === id)

  const priceTiers = [
    { label: 'All Budgets', value: 'All' },
    { label: '$ Budget Eats', value: '$' },
    { label: '$$ Casual Dining', value: '$$' },
    { label: '$$$ Upscale & Gourmet', value: '$$$' },
    { label: '$$$$ Fine Dining & Michelin', value: '$$$$' }
  ]

  // Calculate meal slots for trip (e.g. 2 meals/day)
  const maxTripMeals = Math.max(2, durationDays * 2)

  return (
    <div className="places-section">
      <div className="section-header">
        <div>
          <div className="section-badge dining-badge">
            <CurrentPartyIcon size={14} /> DINING TAILORED FOR: {partyLabels[travelParty]?.label.toUpperCase()} · {budgetTier.toUpperCase()} BUDGET
          </div>
          <h2 className="section-title">
            Top-Rated Dining in {city?.city || 'Selected Destination'}
          </h2>
          <p className="section-subtitle">
            Dynamically prioritized for a <strong>{partyLabels[travelParty]?.label}</strong> ({travellers} pax) with a <strong>{budgetTier} budget tier</strong> across your <strong>{durationDays}-day trip</strong>.
          </p>
        </div>

        <div className="filter-controls">
          <div className="sort-group">
            <span className="sort-label">Arrange by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="tailored">✨ Best Match for My Trip Profile</option>
              <option value="rating">⭐ Google Rating (Highest first)</option>
              <option value="priceAsc">💲 Price ($ to $$$$)</option>
              <option value="priceDesc">💎 Price ($$$$ to $)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVE SMART FILTER BANNER */}
      <div className="tailored-active-banner dining">
        <div className="tailored-banner-info">
          <Utensils size={16} className="sparkle-gold" />
          <span>
            Showing <strong>{filteredAndSorted.length} eateries</strong>. Top <strong>{maxTripMeals} dining spots</strong> are matched for your <strong>{durationDays}-Day itinerary (Lunch & Dinner)</strong>.
          </span>
        </div>
      </div>

      {/* Price Tier Filter Pills */}
      <div className="category-pills">
        {priceTiers.map(tier => (
          <button
            key={tier.value}
            className={`cat-pill ${selectedPriceTier === tier.value ? 'active' : ''}`}
            onClick={() => setSelectedPriceTier(tier.value)}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* Restaurant Cards Grid */}
      <div className="cards-grid">
        {filteredAndSorted.map((restaurant, idx) => {
          const inBasket = isInBasket(restaurant.id)
          const isTopDayPick = idx < maxTripMeals
          const assignedDay = Math.floor(idx / 2) + 1
          const mealType = idx % 2 === 0 ? 'Lunch' : 'Dinner'

          return (
            <article
              key={restaurant.id}
              className={`place-card ${inBasket ? 'selected' : ''} ${isTopDayPick ? 'top-day-pick' : ''}`}
              onClick={() => setActiveModalItem(restaurant)}
            >
              <div
                className="place-image"
                style={{ backgroundImage: `url(${restaurant.image})` }}
              >
                <div className="image-overlay" />

                {/* DAY BADGE */}
                {isTopDayPick && (
                  <span className="day-schedule-badge dining">
                    <Calendar size={11} /> Ideal Day {assignedDay} {mealType}
                  </span>
                )}

                <div className="dining-tags">
                  <span className="price-tier-pill">{restaurant.priceTier}</span>
                  <span className="meal-type-pill">{restaurant.mealType || mealType}</span>
                </div>
                <div className="google-review-badge">
                  <Star size={14} className="star-icon filled" fill="#f59e0b" color="#f59e0b" />
                  <strong>{typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : String(restaurant.rating || '4.8').replace('★', '').trim()}</strong>
                  <span>({(restaurant.reviewsCount || 8500).toLocaleString()} Google reviews)</span>
                </div>
              </div>

              <div className="place-body">
                {/* SMART MATCH REASON TAG */}
                <div className="smart-match-tag dining">
                  <ThumbsUp size={12} />
                  <span>{restaurant.partyMatchReason}</span>
                </div>

                <div className="cuisine-subtitle">{restaurant.cuisine}</div>
                <h3 className="place-name">{restaurant.name}</h3>
                <p className="place-desc">{restaurant.description}</p>

                <div className="place-meta">
                  <div className="meta-item">
                    <DollarSign size={14} />
                    <span>{restaurant.priceRange}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                </div>

                <div className="place-footer">
                  <div className="price-tag">
                    <small>Price Tier</small>
                    <strong>{restaurant.priceTier} · {restaurant.cuisine.split('&')[0]}</strong>
                  </div>

                  <div className="place-card-actions">
                    {onOpenPostcard && (
                      <button
                        className="btn-card-postcard"
                        onClick={e => {
                          e.stopPropagation()
                          onOpenPostcard(restaurant)
                        }}
                        title="Check-in & Create Instagram Story Postcard / 打卡明信片"
                      >
                        <Camera size={14} />
                        <span>打卡</span>
                      </button>
                    )}

                    <button
                      className="btn-view-details"
                      onClick={e => {
                        e.stopPropagation()
                        setActiveModalItem(restaurant)
                      }}
                      title="View Details"
                    >
                      <Info size={15} />
                      <span>Details</span>
                    </button>

                    <button
                      className={`basket-action-btn ${inBasket ? 'in-basket' : ''}`}
                      onClick={e => {
                        e.stopPropagation()
                        if (inBasket) {
                          onRemoveFromBasket(restaurant.id)
                        } else {
                          onAddToBasket({ ...restaurant, type: 'restaurant' })
                        }
                      }}
                    >
                      {inBasket ? (
                        <>
                          <Check size={15} /> In Basket
                        </>
                      ) : (
                        <>
                          <Plus size={15} /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* RESTAURANT DETAIL MODAL */}
      <PlaceDetailModal
        isOpen={Boolean(activeModalItem)}
        onClose={() => setActiveModalItem(null)}
        item={activeModalItem}
        inBasket={activeModalItem ? isInBasket(activeModalItem.id) : false}
        onAddToBasket={onAddToBasket}
        onRemoveFromBasket={onRemoveFromBasket}
      />
    </div>
  )
}
