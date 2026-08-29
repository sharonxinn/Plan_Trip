import React, { useState, useMemo } from 'react'
import {
  Star, Clock, MapPin, Plus, Check, Compass, Eye, Sparkles,
  Info, Users, Heart, User, Users2, DollarSign, Filter, ThumbsUp, Calendar
} from 'lucide-react'
import PlaceDetailModal from './PlaceDetailModal'

export default function AttractionsGrid({
  city,
  attractions = [],
  basket = [],
  travelParty = 'family',
  budgetTier = 'balanced',
  durationDays = 4,
  travellers = 4,
  onAddToBasket,
  onRemoveFromBasket
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('tailored') // 'tailored' | 'rating' | 'reviews'
  const [activeModalItem, setActiveModalItem] = useState(null)
  const [filterTailoredOnly, setFilterTailoredOnly] = useState(true)

  const partyLabels = {
    solo: { label: 'Solo Explorer', icon: User },
    couple: { label: 'Romantic Couple', icon: Heart },
    family: { label: 'Family with Kids', icon: Users2 },
    friends: { label: 'Friends Group', icon: Users }
  }
  const CurrentPartyIcon = partyLabels[travelParty]?.icon || Users

  const categories = useMemo(() => {
    const set = new Set(['All'])
    attractions.forEach(a => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set)
  }, [attractions])

  // Intelligent Tailoring & Recommendation Engine
  const tailoredAttractions = useMemo(() => {
    return attractions.map((item, index) => {
      let score = (item.rating || 4.8) * 10 + ((item.reviewsCount || 10000) / 10000)
      const nameAndDesc = ((item.name || '') + ' ' + (item.description || '') + ' ' + (item.category || '')).toLowerCase()
      let partyMatchReason = ''

      // Party Affinity Logic
      if (travelParty === 'family') {
        if (nameAndDesc.includes('park') || nameAndDesc.includes('garden') || nameAndDesc.includes('zoo') ||
            nameAndDesc.includes('cable') || nameAndDesc.includes('beach') || nameAndDesc.includes('aquarium') ||
            nameAndDesc.includes('fun') || nameAndDesc.includes('nature') || nameAndDesc.includes('museum')) {
          score += 25
          partyMatchReason = '👨‍👩‍👧‍👦 Top Pick for Families & Kids'
        }
      } else if (travelParty === 'couple') {
        if (nameAndDesc.includes('view') || nameAndDesc.includes('sky') || nameAndDesc.includes('sunset') ||
            nameAndDesc.includes('beach') || nameAndDesc.includes('temple') || nameAndDesc.includes('heritage') ||
            nameAndDesc.includes('panoram') || nameAndDesc.includes('promenade')) {
          score += 25
          partyMatchReason = '💑 Romantic & Scenic Atmosphere'
        }
      } else if (travelParty === 'friends') {
        if (nameAndDesc.includes('view') || nameAndDesc.includes('tower') || nameAndDesc.includes('sky') ||
            nameAndDesc.includes('night') || nameAndDesc.includes('street') || nameAndDesc.includes('island') ||
            nameAndDesc.includes('hike') || nameAndDesc.includes('adventure')) {
          score += 25
          partyMatchReason = '👯 Great for Groups & Adventure'
        }
      } else if (travelParty === 'solo') {
        if (nameAndDesc.includes('museum') || nameAndDesc.includes('art') || nameAndDesc.includes('heritage') ||
            nameAndDesc.includes('temple') || nameAndDesc.includes('walk') || nameAndDesc.includes('old')) {
          score += 25
          partyMatchReason = '👤 Perfect for Solo Culture Walks'
        }
      }

      // Budget Affinity Logic
      const isFree = item.priceEstimate?.toLowerCase().includes('free')
      if (budgetTier === 'budget') {
        if (isFree) {
          score += 20
          if (!partyMatchReason) partyMatchReason = '🟢 Free Entrance Sight'
        }
      } else if (budgetTier === 'luxury' || budgetTier === 'premium') {
        if (!isFree) score += 10
      }

      return {
        ...item,
        tailorScore: score,
        partyMatchReason: partyMatchReason || `⭐ Top Google Rated in ${city?.city || 'Area'}`
      }
    })
  }, [attractions, travelParty, budgetTier, city])

  const filteredAndSorted = useMemo(() => {
    let list = [...tailoredAttractions]

    if (selectedCategory !== 'All') {
      list = list.filter(a => a.category === selectedCategory)
    }

    if (sortBy === 'tailored') {
      list.sort((a, b) => b.tailorScore - a.tailorScore)
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount)
    }

    return list
  }, [tailoredAttractions, selectedCategory, sortBy])

  const isInBasket = id => basket.some(item => item.id === id)

  // Calculate day recommendations (e.g. 2 sights per day)
  const maxTripSights = Math.max(2, durationDays * 2)

  return (
    <div className="places-section">
      <div className="section-header">
        <div>
          <div className="section-badge party-customized-badge">
            <CurrentPartyIcon size={14} /> TAILORED FOR: {partyLabels[travelParty]?.label.toUpperCase()} · {durationDays} DAYS · {budgetTier.toUpperCase()} BUDGET
          </div>
          <h2 className="section-title">
            Must-See Attractions in {city?.city || 'Selected Destination'}
          </h2>
          <p className="section-subtitle">
            Dynamically prioritized for a <strong>{partyLabels[travelParty]?.label}</strong> ({travellers} pax) with a <strong>{budgetTier} budget</strong> across your <strong>{durationDays}-day trip</strong>.
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
              <option value="reviews">👥 Review Volume (Most popular)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVE SMART FILTER BANNER */}
      <div className="tailored-active-banner">
        <div className="tailored-banner-info">
          <Sparkles size={16} className="sparkle-gold" />
          <span>
            Showing <strong>{filteredAndSorted.length} spots</strong>. Top <strong>{maxTripSights} spots</strong> are prioritized for your <strong>{durationDays}-Day itinerary</strong>.
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills">
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {filteredAndSorted.map((attraction, idx) => {
          const inBasket = isInBasket(attraction.id)
          const isTopDayPick = idx < maxTripSights
          const assignedDay = Math.floor(idx / 2) + 1

          return (
            <article
              key={attraction.id}
              className={`place-card ${inBasket ? 'selected' : ''} ${isTopDayPick ? 'top-day-pick' : ''}`}
              onClick={() => setActiveModalItem(attraction)}
            >
              <div
                className="place-image"
                style={{ backgroundImage: `url(${attraction.image})` }}
              >
                <div className="image-overlay" />

                {/* DAY BADGE OR REASON TAG */}
                {isTopDayPick && (
                  <span className="day-schedule-badge">
                    <Calendar size={11} /> Ideal for Day {assignedDay}
                  </span>
                )}

                <span className="place-category-badge">{attraction.category}</span>
                <div className="google-review-badge">
                  <Star size={14} className="star-icon filled" fill="#f59e0b" color="#f59e0b" />
                  <strong>{(attraction.rating || 4.8).toFixed(1)}</strong>
                  <span>({(attraction.reviewsCount || 12000).toLocaleString()} Google reviews)</span>
                </div>
              </div>

              <div className="place-body">
                {/* SMART MATCH REASON TAG */}
                <div className="smart-match-tag">
                  <ThumbsUp size={12} />
                  <span>{attraction.partyMatchReason}</span>
                </div>

                <h3 className="place-name">{attraction.name}</h3>
                <p className="place-desc">{attraction.description}</p>

                <div className="place-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{attraction.estimatedHours || '2 hours'}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span className="truncate">{attraction.address}</span>
                  </div>
                </div>

                <div className="place-footer">
                  <div className="price-tag">
                    <small>Admission</small>
                    <strong>{attraction.priceEstimate || 'Free entry'}</strong>
                  </div>

                  <div className="place-card-actions">
                    <button
                      className="btn-view-details"
                      onClick={e => {
                        e.stopPropagation()
                        setActiveModalItem(attraction)
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
                          onRemoveFromBasket(attraction.id)
                        } else {
                          onAddToBasket({ ...attraction, type: 'attraction' })
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

      {/* PLACE DETAIL MODAL */}
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
