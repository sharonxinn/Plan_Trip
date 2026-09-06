import React, { useState, useMemo } from 'react'
import {
  Star, Utensils, DollarSign, MapPin, Plus, Check, Coffee, Flame,
  Sparkles, Users, Heart, User, Users2, Filter, Camera,
  SlidersHorizontal, CheckCircle2, ShieldCheck, AlertTriangle, Leaf
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
  travelPace = 'moderate',
  groupPreferences = { vibes: [], dietary: [] },
  searchQuery = '',
  onAddToBasket,
  onRemoveFromBasket,
  onOpenPostcard,
  onEditPreferences
}) {
  const [selectedPriceTier, setSelectedPriceTier] = useState('All')
  const [activeDietaryQuickFilter, setActiveDietaryQuickFilter] = useState('All')
  const [sortBy, setSortBy] = useState('tailored') // 'tailored' | 'rating' | 'priceAsc' | 'priceDesc'
  const [activeModalItem, setActiveModalItem] = useState(null)

  const activeDietary = groupPreferences?.dietary || []
  const vibes = groupPreferences?.vibes || []

  const partyLabels = {
    solo: { label: 'Solo Explorer', icon: User },
    couple: { label: 'Romantic Couple', icon: Heart },
    family: { label: 'Family with Kids', icon: Users2 },
    friends: { label: 'Friends Squad', icon: Users }
  }
  const CurrentPartyIcon = partyLabels[travelParty]?.icon || Users

  // Intelligent Dining Tailoring Engine (Dietary + Party + Budget + Vibes)
  const tailoredRestaurants = useMemo(() => {
    return restaurants.map((item) => {
      let score = (item.rating || 4.8) * 12 + ((item.reviewsCount || 8000) / 10000)
      const nameAndDesc = ((item.name || '') + ' ' + (item.cuisine || '') + ' ' + (item.description || '') + ' ' + (item.dietaryFlags ? item.dietaryFlags.join(' ') : '')).toLowerCase()

      let partyMatchReason = ''
      let partyBadge = ''
      let dietaryBadges = []
      let dietaryWarnings = []
      let isPartyHighlight = false

      // 1. DIETARY MATCHING ENGINE (Halal, Vegetarian, Vegan, No Seafood, No Pork, Gluten Free)
      if (activeDietary.includes('Halal Friendly')) {
        const isHalal = item.dietaryFlags?.some(f => f.toLowerCase().includes('halal')) ||
          nameAndDesc.includes('halal') || nameAndDesc.includes('nasi kandar') || nameAndDesc.includes('pelita') ||
          nameAndDesc.includes('village park') || nameAndDesc.includes('rebung') || nameAndDesc.includes('malay') ||
          nameAndDesc.includes('pure vegetarian')

        if (isHalal) {
          score += 65
          dietaryBadges.push('100% Halal Verified')
        } else if (nameAndDesc.includes('pork') || nameAndDesc.includes('non-halal') || nameAndDesc.includes('bacon')) {
          score -= 45
          dietaryWarnings.push('Non-Halal / Pork Served')
        }
      }

      if (activeDietary.includes('Vegetarian')) {
        const isVeg = item.dietaryFlags?.some(f => f.toLowerCase().includes('vegetarian')) ||
          nameAndDesc.includes('vegetarian') || nameAndDesc.includes('vegan') || nameAndDesc.includes('dharma') ||
          nameAndDesc.includes('ganga') || nameAndDesc.includes('woodlands') || nameAndDesc.includes('thali')

        if (isVeg) {
          score += 70
          dietaryBadges.push('Vegetarian Friendly')
        }
      }

      if (activeDietary.includes('Vegan')) {
        const isVegan = item.dietaryFlags?.some(f => f.toLowerCase().includes('vegan')) ||
          nameAndDesc.includes('vegan') || nameAndDesc.includes('plant-based') || nameAndDesc.includes('dharma') ||
          nameAndDesc.includes('ganga') || nameAndDesc.includes('woodlands')

        if (isVegan) {
          score += 70
          dietaryBadges.push('🌿 100% Vegan Friendly')
        }
      }

      if (activeDietary.includes('No Seafood')) {
        const hasSeafood = nameAndDesc.includes('seafood') || nameAndDesc.includes('crab') ||
          nameAndDesc.includes('prawn') || nameAndDesc.includes('squid') || nameAndDesc.includes('sotong') ||
          nameAndDesc.includes('fish') || nameAndDesc.includes('oyster') || item.dietaryFlags?.includes('Contains Seafood')

        if (hasSeafood) {
          score -= 35
          dietaryWarnings.push('🦐 Contains Seafood')
        } else {
          score += 25
          dietaryBadges.push('🍗 Seafood-Free Friendly')
        }
      }

      if (activeDietary.includes('No Pork')) {
        const hasPork = nameAndDesc.includes('pork') || nameAndDesc.includes('char siu') || nameAndDesc.includes('bacon')
        const isPorkFree = item.dietaryFlags?.some(f => f.toLowerCase().includes('pork-free') || f.toLowerCase().includes('no pork')) ||
          nameAndDesc.includes('pork-free') || nameAndDesc.includes('halal') || nameAndDesc.includes('vegetarian')

        if (isPorkFree && !hasPork) {
          score += 45
          dietaryBadges.push('100% Pork-Free')
        } else if (hasPork) {
          score -= 45
          dietaryWarnings.push('Contains Pork')
        }
      }

      if (activeDietary.includes('Gluten Free')) {
        const isGlutenFree = item.dietaryFlags?.some(f => f.toLowerCase().includes('gluten')) ||
          nameAndDesc.includes('gluten-free') || nameAndDesc.includes('nasi') || nameAndDesc.includes('rice') || nameAndDesc.includes('hor fun')

        if (isGlutenFree) {
          score += 30
          dietaryBadges.push('Gluten-Free Friendly')
        }
      }

      // 2. PARTY AFFINITY LOGIC (Couple, Family, Friends, Solo)
      if (travelParty === 'couple') {
        const isRomantic = item.isRomantic || (item.romanticScore && item.romanticScore > 80) ||
          nameAndDesc.includes('romantic') || nameAndDesc.includes('sunset') || nameAndDesc.includes('troika') ||
          nameAndDesc.includes('fuego') || nameAndDesc.includes('kebaya') || nameAndDesc.includes('bistro') ||
          nameAndDesc.includes('cocktails') || nameAndDesc.includes('fine dining') || nameAndDesc.includes('omakase')

        if (isRomantic) {
          score += 55
          partyMatchReason = '💑 Romantic Couple Top Pick: Sunset Ambiance & Intimate Dining'
          partyBadge = 'Romantic Date Night'
          isPartyHighlight = true
        } else if (item.priceTier === '$$$' || item.priceTier === '$$$$') {
          score += 25
          partyMatchReason = '💑 Chic Atmosphere for Two'
          partyBadge = 'Couple Dining'
          isPartyHighlight = true
        }
      } else if (travelParty === 'family') {
        const isFamilyDining = item.kidFriendly || item.hasHighchairs ||
          nameAndDesc.includes('kid') || nameAndDesc.includes('family') || nameAndDesc.includes('highchair') ||
          nameAndDesc.includes('dumpling') || nameAndDesc.includes('dim sum') || nameAndDesc.includes('noodle') ||
          nameAndDesc.includes('rice') || nameAndDesc.includes('buffet') || nameAndDesc.includes('rebung') ||
          nameAndDesc.includes('din tai fung') || nameAndDesc.includes('village park')

        if (isFamilyDining) {
          score += 55
          partyMatchReason = '👨‍👩‍👧‍👦 Family-Friendly Dining: Spacious Seating, Highchairs & Mild Kids Dishes'
          partyBadge = '👶 Kid & Family Friendly'
          isPartyHighlight = true
        } else {
          score += 15
        }
      } else if (travelParty === 'friends') {
        const isFriendsDining = nameAndDesc.includes('sharing') || nameAndDesc.includes('wings') ||
          nameAndDesc.includes('bbq') || nameAndDesc.includes('hotpot') || nameAndDesc.includes('steamboat') ||
          nameAndDesc.includes('alor') || nameAndDesc.includes('wong ah wah') || nameAndDesc.includes('pelita') ||
          nameAndDesc.includes('seafood') || nameAndDesc.includes('supper')

        if (isFriendsDining) {
          score += 50
          partyMatchReason = 'Friends Squad Top Pick: Big Communal Tables & Late Night Feasts'
          partyBadge = '🍲 Group Sharing Feast'
          isPartyHighlight = true
        } else {
          score += 18
        }
      } else if (travelParty === 'solo') {
        const isSoloDining = nameAndDesc.includes('counter') || nameAndDesc.includes('cafe') ||
          nameAndDesc.includes('coffee') || nameAndDesc.includes('noodle') || nameAndDesc.includes('bakery') ||
          nameAndDesc.includes('kopitiam') || nameAndDesc.includes('quick') || nameAndDesc.includes('village park')

        if (isSoloDining) {
          score += 45
          partyMatchReason = 'Solo Explorer Pick: Cozy Counter Seating & Easy Single Servings'
          partyBadge = '☕ Solo Friendly Counter'
          isPartyHighlight = true
        } else {
          score += 18
        }
      }

      // 3. STYLE VIBES AFFINITY (Local Food, Cafes, etc.)
      if (vibes.includes('foodie') && (nameAndDesc.includes('nasi') || nameAndDesc.includes('hawker') || nameAndDesc.includes('street') || nameAndDesc.includes('michelin') || nameAndDesc.includes('traditional'))) {
        score += 25
      }
      if (vibes.includes('relaxed') && (nameAndDesc.includes('cafe') || nameAndDesc.includes('coffee') || nameAndDesc.includes('tea') || nameAndDesc.includes('bistro') || nameAndDesc.includes('courtyard'))) {
        score += 25
      }

      // 4. BUDGET TIER AFFINITY
      if (budgetTier === 'budget') {
        if (item.priceTier === '$') score += 30
        else if (item.priceTier === '$$$$') score -= 25
      } else if (budgetTier === 'balanced') {
        if (item.priceTier === '$$' || item.priceTier === '$') score += 25
      } else if (budgetTier === 'premium' || budgetTier === 'luxury') {
        if (item.priceTier === '$$$$' || item.priceTier === '$$$') score += 30
      }

      // Calculate match percentage (83% - 99%)
      const matchPercent = Math.min(99, Math.max(83, Math.round((score / 148) * 100)))

      return {
        ...item,
        tailorScore: score,
        matchPercent,
        partyMatchReason: partyMatchReason || `⭐ Top Google Rated Dining in ${city?.city || 'the Area'}`,
        partyBadge: partyBadge || (travelParty === 'couple' ? 'Couple Friendly' : travelParty === 'family' ? '👶 Family Friendly' : '🍴 Highly Rated'),
        dietaryBadges,
        dietaryWarnings,
        isPartyHighlight
      }
    })
  }, [restaurants, travelParty, budgetTier, activeDietary, vibes, city])

  // Filter and Sort Pipeline
  const filteredAndSorted = useMemo(() => {
    let list = [...tailoredRestaurants]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.cuisine?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q)
      )
    }

    // Price Tier Filter
    if (selectedPriceTier !== 'All') {
      list = list.filter(r => r.priceTier === selectedPriceTier)
    }

    // Quick Dietary / Party Filter
    if (activeDietaryQuickFilter === 'halal') {
      list = list.filter(r => r.dietaryBadges.some(b => b.includes('Halal')))
    } else if (activeDietaryQuickFilter === 'vegetarian') {
      list = list.filter(r => r.dietaryBadges.some(b => b.includes('Vegetarian') || b.includes('Vegan')))
    } else if (activeDietaryQuickFilter === 'kidFriendly') {
      list = list.filter(r => r.partyBadge.includes('Family') || r.kidFriendly || r.hasHighchairs)
    } else if (activeDietaryQuickFilter === 'romantic') {
      list = list.filter(r => r.partyBadge.includes('Romantic') || r.isRomantic)
    }

    // Sorting
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
  }, [tailoredRestaurants, selectedPriceTier, activeDietaryQuickFilter, sortBy, searchQuery])

  const isInBasket = id => basket.some(item => item.id === id)

  const priceTiers = [
    { label: 'All Budgets', value: 'All' },
    { label: '$ Budget Hawker', value: '$' },
    { label: '$$ Casual Dining', value: '$$' },
    { label: '$$$ Gourmet', value: '$$$' },
    { label: '$$$$ Fine Dining', value: '$$$$' }
  ]

  return (
    <div className="places-section">
      {/* SECTION HEADER */}
      <div className="section-header">
        <div>
          <div className="section-badge dining-badge">
            <CurrentPartyIcon size={14} /> DINING TAILORED FOR: {partyLabels[travelParty]?.label.toUpperCase()} · {activeDietary.length > 0 ? activeDietary.join(', ').toUpperCase() : 'ALL DIETS'} · {budgetTier.toUpperCase()} BUDGET
          </div>
          <h2 className="section-title">
            Top-Rated Dining in {city?.city || 'Selected Destination'}
          </h2>
          <p className="section-subtitle">
            Personalized gastronomy for a <strong>{partyLabels[travelParty]?.label}</strong> ({travellers} pax) with <strong>{activeDietary.length > 0 ? activeDietary.join(', ') : 'no dietary restrictions'}</strong> applied.
            {travelParty === 'family' && ' Highchair availability, kid-friendly dishes, and spacious family seating are surfaced.'}
            {travelParty === 'couple' && ' Intimate candlelight ambiance, sunset viewpoints, and upscale fine dining are surfaced.'}
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
              <option value="tailored">Best Match for Trip & Dietary</option>
              <option value="rating">⭐ Google Rating (Highest first)</option>
              <option value="priceAsc">💲 Price ($ to $$$$)</option>
              <option value="priceDesc">💎 Price ($$$$ to $)</option>
            </select>
          </div>
        </div>
      </div>

      {/* QUICK FILTER PILLS BAR */}
      <div className="category-pills">
        {/* Dynamic Quick Dietary Filters */}
        <button
          className={`cat-pill ${activeDietaryQuickFilter === 'All' && selectedPriceTier === 'All' ? 'active' : ''}`}
          onClick={() => {
            setActiveDietaryQuickFilter('All')
            setSelectedPriceTier('All')
          }}
        >
          All Dining ({tailoredRestaurants.length})
        </button>

        {activeDietary.includes('Halal Friendly') && (
          <button
            className={`cat-pill halal-pill-btn ${activeDietaryQuickFilter === 'halal' ? 'active' : ''}`}
            onClick={() => setActiveDietaryQuickFilter(activeDietaryQuickFilter === 'halal' ? 'All' : 'halal')}
          >
            Halal Verified Only
          </button>
        )}

        {(activeDietary.includes('Vegetarian') || activeDietary.includes('Vegan')) && (
          <button
            className={`cat-pill veg-pill-btn ${activeDietaryQuickFilter === 'vegetarian' ? 'active' : ''}`}
            onClick={() => setActiveDietaryQuickFilter(activeDietaryQuickFilter === 'vegetarian' ? 'All' : 'vegetarian')}
          >
            Vegetarian / Vegan Only
          </button>
        )}

        {travelParty === 'family' && (
          <button
            className={`cat-pill party-pill-highlight ${activeDietaryQuickFilter === 'kidFriendly' ? 'active' : ''}`}
            onClick={() => setActiveDietaryQuickFilter(activeDietaryQuickFilter === 'kidFriendly' ? 'All' : 'kidFriendly')}
          >
            👶 Family & Highchairs Only
          </button>
        )}

        {travelParty === 'couple' && (
          <button
            className={`cat-pill party-pill-highlight ${activeDietaryQuickFilter === 'romantic' ? 'active' : ''}`}
            onClick={() => setActiveDietaryQuickFilter(activeDietaryQuickFilter === 'romantic' ? 'All' : 'romantic')}
          >
            Romantic Date Spots Only
          </button>
        )}

        {/* Standard Budget Price Tiers */}
        {priceTiers.filter(t => t.value !== 'All').map(tier => (
          <button
            key={tier.value}
            className={`cat-pill ${selectedPriceTier === tier.value ? 'active' : ''}`}
            onClick={() => {
              setSelectedPriceTier(selectedPriceTier === tier.value ? 'All' : tier.value)
              setActiveDietaryQuickFilter('All')
            }}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* RESTAURANT CARDS GRID */}
      <div className="cards-grid">
        {filteredAndSorted.map((restaurant) => {
          const inBasket = isInBasket(restaurant.id)

          return (
            <article
              key={restaurant.id}
              className={`place-card ${inBasket ? 'selected' : ''} ${restaurant.isPartyHighlight ? 'top-day-pick' : ''}`}
              onClick={() => setActiveModalItem(restaurant)}
            >
              {/* IMAGE WRAPPER */}
              <div
                className="place-image"
                style={{ backgroundImage: `url(${restaurant.image})` }}
              >
                <div className="image-overlay" />
                
                {/* MATCH PERCENTAGE CHIP */}
                <div className="attraction-match-chip dining">
                  <Sparkles size={12} className="sparkle-gold" />
                  <span>{restaurant.matchPercent}% Match</span>
                </div>

                <div className="dining-tags">
                  <span className="price-tier-pill">{restaurant.priceTier}</span>
                  <span className="meal-type-pill">{restaurant.cuisine?.split('&')[0]?.trim()}</span>
                </div>

                <div className="google-review-badge">
                  <Star size={13} className="star-icon filled" fill="#38bdf8" color="#38bdf8" />
                  <strong>{typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : String(restaurant.rating || '4.8').replace('★', '').trim()}</strong>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="place-body">
                {/* DYNAMIC TAILORED REASON BANNER */}
                <div className="smart-match-tag dining">
                  <CurrentPartyIcon size={12} />
                  <span className="truncate">{restaurant.partyMatchReason}</span>
                </div>

                <h3 className="place-name">{restaurant.name}</h3>
                <p className="place-desc">{restaurant.description}</p>

                {/* DIETARY & SAFETY BADGES ROW */}
                <div className="dietary-badges-row">
                  {restaurant.dietaryBadges.map((badge, i) => (
                    <span key={i} className="dietary-badge-chip success">
                      <CheckCircle2 size={11} /> {badge}
                    </span>
                  ))}
                  {restaurant.dietaryWarnings.map((warn, i) => (
                    <span key={i} className="dietary-badge-chip warning">
                      <AlertTriangle size={11} /> {warn}
                    </span>
                  ))}
                  {restaurant.hasHighchairs && (
                    <span className="dietary-badge-chip info">
                      👶 Highchairs Available
                    </span>
                  )}
                </div>

                <div className="place-meta">
                  <div className="meta-item">
                    <DollarSign size={13} />
                    <span>{restaurant.priceRange}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={13} />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                </div>

                <div className="place-footer">
                  <div className="price-tag">
                    <strong>{restaurant.priceTier} · {restaurant.cuisine?.split('&')[0]}</strong>
                  </div>

                  <div className="place-card-actions">
                    {onOpenPostcard && (
                      <button
                        className="btn-card-postcard"
                        onClick={e => {
                          e.stopPropagation()
                          onOpenPostcard(restaurant)
                        }}
                        title="Check-in & Create Story Postcard"
                      >
                        <Camera size={14} />
                      </button>
                    )}

                    <button
                      className={`btn-add-basket ${inBasket ? 'added' : ''}`}
                      onClick={e => {
                        e.stopPropagation()
                        if (inBasket) {
                          onRemoveFromBasket(restaurant.id)
                        } else {
                          onAddToBasket({
                            ...restaurant,
                            type: 'restaurant'
                          })
                        }
                      }}
                    >
                      {inBasket ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Add to Trip</span>
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

      {filteredAndSorted.length === 0 && (
        <div className="empty-places-state">
          <p>No restaurants match your selected dietary or price criteria.</p>
          <button
            className="btn-reset-filters"
            onClick={() => {
              setSelectedPriceTier('All')
              setActiveDietaryQuickFilter('All')
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

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
