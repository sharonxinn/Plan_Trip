import React, { useState, useMemo } from 'react'
import {
  Star, Clock, MapPin, Plus, Check, Compass, Sparkles,
  Users, Heart, User, Users2, DollarSign, Filter, Camera,
  SlidersHorizontal, CheckCircle2, Award
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
  travelPace = 'moderate',
  groupPreferences = { vibes: [], dietary: [] },
  searchQuery = '',
  onAddToBasket,
  onRemoveFromBasket,
  onOpenPostcard,
  onEditPreferences
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('tailored') // 'tailored' | 'rating' | 'reviews'
  const [activeModalItem, setActiveModalItem] = useState(null)
  const [partyFilterOnly, setPartyFilterOnly] = useState(false)

  const vibes = groupPreferences?.vibes || []

  const partyLabels = {
    solo: { label: 'Solo Explorer', icon: User, targetTag: 'Solo Friendly' },
    couple: { label: 'Romantic Couple', icon: Heart, targetTag: 'Romantic Spot' },
    family: { label: 'Family with Kids', icon: Users2, targetTag: 'Playground & Kids' },
    friends: { label: 'Friends Squad', icon: Users, targetTag: 'Group Adventure' }
  }
  const CurrentPartyIcon = partyLabels[travelParty]?.icon || Users

  const categories = useMemo(() => {
    const set = new Set(['All'])
    attractions.forEach(a => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set)
  }, [attractions])

  // Intelligent Multi-Factor Tailoring & Recommendation Engine
  const tailoredAttractions = useMemo(() => {
    return attractions.map((item) => {
      let score = (item.rating || 4.8) * 12 + ((item.reviewsCount || 10000) / 10000)
      const nameAndDesc = ((item.name || '') + ' ' + (item.description || '') + ' ' + (item.category || '') + ' ' + (item.tags ? item.tags.join(' ') : '')).toLowerCase()
      
      let partyMatchReason = ''
      let partyBadge = ''
      let isPartyHighlight = false
      let styleTags = []

      // 1. Party Affinity Logic (Couple, Family, Solo, Friends)
      if (travelParty === 'family') {
        const isFamilySpot = item.isPlayground || item.kidFriendly ||
          nameAndDesc.includes('playground') || nameAndDesc.includes('kids') || nameAndDesc.includes('splash') ||
          nameAndDesc.includes('wading') || nameAndDesc.includes('aquarium') || nameAndDesc.includes('discovery') ||
          nameAndDesc.includes('science') || nameAndDesc.includes('theme park') || nameAndDesc.includes('waterplay') ||
          nameAndDesc.includes('slide') || nameAndDesc.includes('petrosains') || nameAndDesc.includes('zoo')

        if (isFamilySpot) {
          score += 55
          partyMatchReason = '👨‍👩‍👧‍👦 Family & Playground Top Pick: Adventure Play & Water Fun'
          partyBadge = '🎠 Playground & Kids Fun'
          isPartyHighlight = true
        } else if (nameAndDesc.includes('park') || nameAndDesc.includes('garden') || nameAndDesc.includes('nature') || nameAndDesc.includes('beach')) {
          score += 28
          partyMatchReason = '👨‍👩‍👧‍👦 Great for Family Strolls & Open Nature'
          partyBadge = '🌿 Family Friendly'
          isPartyHighlight = true
        }
      } else if (travelParty === 'couple') {
        const isCoupleSpot = item.isRomantic || (item.romanticScore && item.romanticScore > 80) ||
          nameAndDesc.includes('romantic') || nameAndDesc.includes('sunset') || nameAndDesc.includes('viewpoint') ||
          nameAndDesc.includes('helipad') || nameAndDesc.includes('skyline') || nameAndDesc.includes('sky deck') ||
          nameAndDesc.includes('panoram') || nameAndDesc.includes('promenade') || nameAndDesc.includes('lantern')

        if (isCoupleSpot) {
          score += 50
          partyMatchReason = '💑 Romantic Couple Top Pick: Scenic Sunset Panoramas & Intimate Vibe'
          partyBadge = 'Romantic Sunset Spot'
          isPartyHighlight = true
        } else if (nameAndDesc.includes('garden') || nameAndDesc.includes('temple') || nameAndDesc.includes('beach') || nameAndDesc.includes('heritage')) {
          score += 25
          partyMatchReason = '💑 Scenic & Atmospheric Date Walk'
          partyBadge = 'Couple Friendly'
          isPartyHighlight = true
        }
      } else if (travelParty === 'friends') {
        const isFriendsSpot = nameAndDesc.includes('thrill') || nameAndDesc.includes('theme park') ||
          nameAndDesc.includes('adventure') || nameAndDesc.includes('tower') || nameAndDesc.includes('sky') ||
          nameAndDesc.includes('night') || nameAndDesc.includes('street') || nameAndDesc.includes('hike') ||
          nameAndDesc.includes('escape') || nameAndDesc.includes('roller coaster')

        if (isFriendsSpot) {
          score += 50
          partyMatchReason = 'Friends Squad Top Pick: High Energy Thrills & Group Adventures'
          partyBadge = '⚡ Group Adventure'
          isPartyHighlight = true
        } else {
          score += 20
        }
      } else if (travelParty === 'solo') {
        const isSoloSpot = nameAndDesc.includes('museum') || nameAndDesc.includes('art') ||
          nameAndDesc.includes('heritage') || nameAndDesc.includes('temple') || nameAndDesc.includes('walk') ||
          nameAndDesc.includes('alley') || nameAndDesc.includes('book') || nameAndDesc.includes('viewpoint')

        if (isSoloSpot) {
          score += 45
          partyMatchReason = 'Solo Explorer Pick: Peaceful Culture Walks & Contemplative Views'
          partyBadge = '🚶 Solo Friendly Walk'
          isPartyHighlight = true
        } else {
          score += 20
        }
      }

      // 2. Travel Style Vibes Affinity (groupPreferences.vibes)
      if (vibes.includes('foodie') && (nameAndDesc.includes('food') || nameAndDesc.includes('market') || nameAndDesc.includes('chinatown') || nameAndDesc.includes('street'))) {
        score += 22
        styleTags.push('Foodie Sights')
      }
      if (vibes.includes('culture') && (nameAndDesc.includes('temple') || nameAndDesc.includes('culture') || nameAndDesc.includes('heritage') || nameAndDesc.includes('historic') || nameAndDesc.includes('museum'))) {
        score += 22
        styleTags.push('Heritage & Culture')
      }
      if (vibes.includes('nature') && (nameAndDesc.includes('nature') || nameAndDesc.includes('park') || nameAndDesc.includes('garden') || nameAndDesc.includes('lake') || nameAndDesc.includes('botanical') || nameAndDesc.includes('hill'))) {
        score += 22
        styleTags.push('Nature & Views')
      }
      if (vibes.includes('adventure') && (nameAndDesc.includes('thrill') || nameAndDesc.includes('theme park') || nameAndDesc.includes('waterplay') || nameAndDesc.includes('sky') || nameAndDesc.includes('adventure'))) {
        score += 25
        styleTags.push('⚡ Thrill & Action')
      }
      if (vibes.includes('shopping') && (nameAndDesc.includes('mall') || nameAndDesc.includes('shopping') || nameAndDesc.includes('market') || nameAndDesc.includes('trx') || nameAndDesc.includes('klcc'))) {
        score += 22
        styleTags.push('🛍️ Shopping & Malls')
      }
      if (vibes.includes('relaxed') && (nameAndDesc.includes('garden') || nameAndDesc.includes('park') || nameAndDesc.includes('walk') || nameAndDesc.includes('botanical') || nameAndDesc.includes('peaceful'))) {
        score += 20
        styleTags.push('Chill & Unhurried')
      }

      // 3. Daily Pace Adjustment
      if (travelPace === 'relaxed') {
        const estH = parseFloat(item.estimatedHours || '2')
        if (estH <= 2.5) score += 12
      } else if (travelPace === 'packed') {
        if (nameAndDesc.includes('theme park') || nameAndDesc.includes('day') || nameAndDesc.includes('tower')) {
          score += 15
        }
      }

      // 4. Budget Tier Adjustment
      const isFree = item.priceEstimate?.toLowerCase().includes('free')
      if (budgetTier === 'budget') {
        if (isFree) score += 20
      } else if (budgetTier === 'luxury' || budgetTier === 'premium') {
        if (!isFree) score += 10
      }

      // Calculate match percentage (82% - 99%)
      const matchPercent = Math.min(99, Math.max(82, Math.round((score / 145) * 100)))

      return {
        ...item,
        tailorScore: score,
        matchPercent,
        partyMatchReason: partyMatchReason || `⭐ Highly Recommended Google Attraction in ${city?.city || 'the Area'}`,
        partyBadge: partyBadge || (travelParty === 'couple' ? 'Couple Friendly' : travelParty === 'family' ? '👨‍👩‍👧‍👦 Family Friendly' : '⭐ Top Attraction'),
        isPartyHighlight,
        styleTags
      }
    })
  }, [attractions, travelParty, budgetTier, travelPace, vibes, city])

  // Filter and Sort Pipeline
  const filteredAndSorted = useMemo(() => {
    let list = [...tailoredAttractions]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.address?.toLowerCase().includes(q)
      )
    }

    // Party filter toggle (e.g. only show playgrounds for family, or romantic spots for couple)
    if (partyFilterOnly) {
      list = list.filter(a => a.isPartyHighlight)
    }

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(a => a.category === selectedCategory)
    }

    // Sorting
    if (sortBy === 'tailored') {
      list.sort((a, b) => b.tailorScore - a.tailorScore)
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount)
    }

    return list
  }, [tailoredAttractions, selectedCategory, sortBy, searchQuery, partyFilterOnly])

  const isInBasket = id => basket.some(item => item.id === id)

  return (
    <div className="places-section">
      {/* SECTION HEADER */}
      <div className="section-header">
        <div>
          <div className="section-badge party-customized-badge">
            <CurrentPartyIcon size={14} /> TAILORED FOR: {partyLabels[travelParty]?.label.toUpperCase()} · {travelPace.toUpperCase()} PACE · {budgetTier.toUpperCase()} BUDGET
          </div>
          <h2 className="section-title">
            Must-See Attractions in {city?.city || 'Selected Destination'}
          </h2>
          <p className="section-subtitle">
            Personalized recommendations for <strong>{partyLabels[travelParty]?.label}</strong> ({travellers} pax) with <strong>{vibes.length} travel styles</strong> active.
            {travelParty === 'family' && ' Playgrounds, water splash parks & science discovery centers are prioritized.'}
            {travelParty === 'couple' && ' Scenic sunset viewpoints, rooftops & intimate walks are prioritized.'}
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
              <option value="tailored">Best Match for Trip Profile</option>
              <option value="rating">⭐ Google Rating (Highest first)</option>
              <option value="reviews">👥 Review Volume (Most popular)</option>
            </select>
          </div>
        </div>
      </div>

      {/* QUICK FILTER PILLS BAR */}
      <div className="category-pills">
        <button
          className={`cat-pill ${selectedCategory === 'All' && !partyFilterOnly ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('All')
            setPartyFilterOnly(false)
          }}
        >
          All Sights ({tailoredAttractions.length})
        </button>

        {/* Dynamic Party-Specific Filter Pill */}
        <button
          className={`cat-pill party-pill-highlight ${partyFilterOnly ? 'active' : ''}`}
          onClick={() => setPartyFilterOnly(!partyFilterOnly)}
        >
          <CurrentPartyIcon size={13} />
          <span>
            {travelParty === 'family' ? '🎠 Playgrounds & Kids Only' :
             travelParty === 'couple' ? 'Romantic & Sunset Only' :
             travelParty === 'friends' ? '⚡ Thrills & Adventures Only' : '🚶 Solo Culture Walks Only'}
          </span>
        </button>

        {categories.filter(c => c !== 'All').map(cat => (
          <button
            key={cat}
            className={`cat-pill ${selectedCategory === cat && !partyFilterOnly ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(cat)
              setPartyFilterOnly(false)
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CARDS GRID */}
      <div className="cards-grid">
        {filteredAndSorted.map((attraction) => {
          const inBasket = isInBasket(attraction.id)

          return (
            <article
              key={attraction.id}
              className={`place-card ${inBasket ? 'selected' : ''} ${attraction.isPartyHighlight ? 'top-day-pick' : ''}`}
              onClick={() => setActiveModalItem(attraction)}
            >
              {/* IMAGE WRAPPER */}
              <div
                className="place-image"
                style={{ backgroundImage: `url(${attraction.image})` }}
              >
                <div className="image-overlay" />
                
                {/* MATCH PERCENTAGE CHIP */}
                <div className="attraction-match-chip">
                  <Sparkles size={12} className="sparkle-gold" />
                  <span>{attraction.matchPercent}% Match</span>
                </div>

                <span className="place-category-badge">{attraction.category}</span>

                <div className="google-review-badge">
                  <Star size={13} className="star-icon filled" fill="#38bdf8" color="#38bdf8" />
                  <strong>{typeof attraction.rating === 'number' ? attraction.rating.toFixed(1) : String(attraction.rating || '4.8').replace('★', '').trim()}</strong>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="place-body">
                {/* DYNAMIC TAILORED REASON BANNER */}
                <div className="smart-match-tag">
                  <CurrentPartyIcon size={12} />
                  <span className="truncate">{attraction.partyMatchReason}</span>
                </div>

                <h3 className="place-name">{attraction.name}</h3>
                <p className="place-desc">{attraction.description}</p>

                {/* STYLE VIBE TAGS */}
                {attraction.styleTags && attraction.styleTags.length > 0 && (
                  <div className="place-style-chips-row">
                    {attraction.styleTags.map(tag => (
                      <span key={tag} className="place-style-mini-chip">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="place-meta">
                  <div className="meta-item">
                    <Clock size={13} />
                    <span>{attraction.estimatedHours || '2 hours'}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={13} />
                    <span className="truncate">{attraction.address}</span>
                  </div>
                </div>

                <div className="place-footer">
                  <div className="price-tag">
                    <strong>{attraction.priceEstimate || 'Free entry'}</strong>
                  </div>

                  <div className="place-card-actions">
                    {onOpenPostcard && (
                      <button
                        className="btn-card-postcard"
                        onClick={e => {
                          e.stopPropagation()
                          onOpenPostcard(attraction)
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
                          onRemoveFromBasket(attraction.id)
                        } else {
                          onAddToBasket({
                            ...attraction,
                            type: 'attraction'
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
          <p>No attractions match your current search or filter.</p>
          <button
            className="btn-reset-filters"
            onClick={() => {
              setSelectedCategory('All')
              setPartyFilterOnly(false)
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

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
