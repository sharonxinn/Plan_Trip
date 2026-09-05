import React, { useState } from 'react'
import {
  Camera, DollarSign, ArrowLeft, Download, Share2, Sparkles,
  TrendingDown, TrendingUp, CheckCircle2, FileText, PieChart, Users,
  Receipt, ArrowUpRight, ArrowDownRight, Printer, AlertCircle, Heart,
  History, Calendar, MapPin, Award, Plane, Compass
} from 'lucide-react'
import PostcardCheckinPage from './PostcardCheckinPage'
import AIAgentPage from './AIAgentPage'

export default function StageMemory({
  selectedCity,
  selectedCountry,
  departureDate,
  returnDate,
  durationDays,
  travellers,
  travelParty,
  budgetAmount = 3800,
  budgetTier = 'balanced',
  basket = [],
  smartItinerary,
  onBackToDashboard
}) {
  const [activeTab, setActiveTab] = useState('postcard') // 'postcard' | 'budget-summary' | 'history' | 'doc'

  // Realistic Expense Variance Calculations (Initial Budget vs Final Actual)
  const initialBudget = budgetAmount || 3800
  
  // Actual spending calculation (simulated around 90-95% of budget or user logged items)
  const actualCategories = [
    { name: 'Accommodation & Stays', planned: Math.round(initialBudget * 0.38), actual: Math.round(initialBudget * 0.35), icon: '🏨' },
    { name: 'Flights & Transportation', planned: Math.round(initialBudget * 0.25), actual: Math.round(initialBudget * 0.26), icon: '✈️' },
    { name: 'Food & Local Gastronomy', planned: Math.round(initialBudget * 0.22), actual: Math.round(initialBudget * 0.19), icon: '🍜' },
    { name: 'Attractions & Experiences', planned: Math.round(initialBudget * 0.10), actual: Math.round(initialBudget * 0.08), icon: '🎟️' },
    { name: 'Shopping & Contingency', planned: Math.round(initialBudget * 0.05), actual: Math.round(initialBudget * 0.03), icon: '🛍️' },
  ]

  const totalActual = actualCategories.reduce((sum, cat) => sum + cat.actual, 0)
  const varianceAmount = initialBudget - totalActual
  const isUnderBudget = varianceAmount >= 0
  const variancePercentage = Math.abs(Math.round((varianceAmount / initialBudget) * 100))

  const perPaxPlanned = Math.round(initialBudget / Math.max(1, travellers))
  const perPaxActual = Math.round(totalActual / Math.max(1, travellers))
  const perPaxSaved = perPaxPlanned - perPaxActual

  // Travel History Data
  const travelHistoryLog = [
    {
      id: 'trip-current',
      city: selectedCity?.city || 'Kuala Lumpur',
      country: selectedCountry?.country || 'Malaysia',
      dates: `${departureDate} → ${returnDate} (${durationDays} Days)`,
      travellers: `${travellers} Pax (${travelParty})`,
      initialBudget: initialBudget,
      finalSpend: totalActual,
      saved: varianceAmount,
      isUnder: isUnderBudget,
      spotsCount: Math.max(6, basket.length),
      highlights: basket.slice(0, 3).map(b => b.title || b.name).join(', ') || 'Petronas Towers, Batu Caves, Jalan Alor',
      status: 'Active / Current Trip',
      badgeClass: 'current'
    },
    {
      id: 'trip-1',
      city: 'Penang',
      country: 'Malaysia',
      dates: 'Aug 10 → Aug 13, 2026 (4 Days)',
      travellers: '4 Pax (Friends)',
      initialBudget: 2200,
      finalSpend: 1980,
      saved: 220,
      isUnder: true,
      spotsCount: 9,
      highlights: 'George Town Heritage Walk, Penang Hill Funicular, Gurney Drive Food Hawker',
      status: 'Completed · Postcard Saved',
      badgeClass: 'completed'
    },
    {
      id: 'trip-2',
      city: 'Tokyo',
      country: 'Japan',
      dates: 'May 01 → May 06, 2026 (6 Days)',
      travellers: '2 Pax (Couple)',
      initialBudget: 8000,
      finalSpend: 7450,
      saved: 550,
      isUnder: true,
      spotsCount: 14,
      highlights: 'Senso-ji Asakusa, Shibuya Sky, Shinjuku Gyoen National Garden, Tsukiji Market',
      status: 'Completed · Postcard Saved',
      badgeClass: 'completed'
    },
    {
      id: 'trip-3',
      city: 'Ipoh',
      country: 'Malaysia',
      dates: 'Mar 15 → Mar 17, 2026 (3 Days)',
      travellers: '3 Pax (Family)',
      initialBudget: 1300,
      finalSpend: 1120,
      saved: 180,
      isUnder: true,
      spotsCount: 7,
      highlights: 'Concubine Lane, Kek Lok Tong Cave Temple, Nam Heong Old Town White Coffee',
      status: 'Completed · Postcard Saved',
      badgeClass: 'completed'
    }
  ]

  const lifetimeStats = {
    totalTrips: 4,
    totalSpots: 36,
    totalSaved: 1330,
    postcardsCount: 6
  }

  return (
    <div className="stage-memory-container fade-in">
      {/* 1. TOP STAGE HEADER */}
      <div className="stage-view-top-header">
        <div className="stage-header-title-col">
          <button className="btn-back-to-dashboard" onClick={onBackToDashboard}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <div className="stage-headline-group">
            <span className="stage-phase-badge memory">Your travel journal</span>
            <h1 className="stage-headline-title">Bring a little of the trip home.</h1>
            <p className="stage-headline-sub">
              Make a postcard, review your spending, and revisit your journeys.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="memory-tab-switcher">
          <button
            className={`memory-tab-btn ${activeTab === 'postcard' ? 'active' : ''}`}
            onClick={() => setActiveTab('postcard')}
          >
            <Camera size={16} />
            <span>Postcards</span>
          </button>
          <button
            className={`memory-tab-btn ${activeTab === 'budget-summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget-summary')}
          >
            <DollarSign size={16} />
            <span>Spending recap</span>
          </button>
          <button
            className={`memory-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            <span>Past trips</span>
          </button>
          <button
            className={`memory-tab-btn ${activeTab === 'doc' ? 'active' : ''}`}
            onClick={() => setActiveTab('doc')}
          >
            <FileText size={16} />
            <span>Trip journal</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT */}
      <div className="memory-tab-content">
        {/* TAB 1: AI DIGITAL POSTCARD STUDIO */}
        {activeTab === 'postcard' && (
          <div className="memory-tab-pane fade-in">
            <PostcardCheckinPage
              selectedCity={selectedCity}
              selectedCountry={selectedCountry}
              departureDate={departureDate}
              returnDate={returnDate}
              travellers={travellers}
              onBack={() => onBackToDashboard()}
            />
          </div>
        )}

        {/* TAB 2: BUDGET SUMMARY (INITIAL BUDGET VS FINAL ACTUAL SPEND) */}
        {activeTab === 'budget-summary' && (
          <div className="memory-tab-pane budget-summary-pane fade-in">
            {/* VARIANCE HERO BANNER */}
            <div className={`budget-variance-hero-card ${isUnderBudget ? 'under-budget' : 'over-budget'}`}>
              <div className="variance-hero-left">
                <span className="variance-pill">
                  {isUnderBudget ? (
                    <><ArrowDownRight size={15} /> Saved RM {varianceAmount.toLocaleString()} ({variancePercentage}% Under Budget)</>
                  ) : (
                    <><ArrowUpRight size={15} /> Overspent by RM {Math.abs(varianceAmount).toLocaleString()} ({variancePercentage}%)</>
                  )}
                </span>
                <h2>Trip Budget vs Actual Spend</h2>
                <p>
                  Initial Target Budget of <strong>RM {initialBudget.toLocaleString()}</strong> vs Final Total Spend of <strong>RM {totalActual.toLocaleString()}</strong>
                </p>
              </div>

              <div className="variance-hero-metrics">
                <div className="variance-metric-box">
                  <span className="metric-label">Initial Budget</span>
                  <span className="metric-val">RM {initialBudget.toLocaleString()}</span>
                  <span className="metric-sub">RM {perPaxPlanned}/pax</span>
                </div>
                <span className="metric-divider">vs</span>
                <div className="variance-metric-box highlight">
                  <span className="metric-label">Final Actual Spent</span>
                  <span className="metric-val">RM {totalActual.toLocaleString()}</span>
                  <span className="metric-sub">RM {perPaxActual}/pax</span>
                </div>
                <div className="variance-metric-box saved">
                  <span className="metric-label">{isUnderBudget ? 'Total Savings' : 'Net Overspend'}</span>
                  <span className="metric-val">{isUnderBudget ? `+ RM ${varianceAmount.toLocaleString()}` : `- RM ${Math.abs(varianceAmount).toLocaleString()}`}</span>
                  <span className="metric-sub">{isUnderBudget ? `Saved RM ${perPaxSaved}/pax` : 'Over budget'}</span>
                </div>
              </div>
            </div>

            {/* CATEGORY BREAKDOWN TABLE & BARS */}
            <div className="budget-category-variance-card">
              <div className="card-inner-header">
                <h3>Category-by-Category Spend Breakdown</h3>
                <p>Compare planned allocations with actual recorded costs</p>
              </div>

              <div className="category-variance-table">
                {actualCategories.map((cat, idx) => {
                  const catDiff = cat.planned - cat.actual
                  const catSaved = catDiff >= 0
                  const pctSpent = Math.min(100, Math.round((cat.actual / cat.planned) * 100))

                  return (
                    <div key={idx} className="category-variance-row">
                      <div className="cat-row-info">
                        <span className="cat-icon-emoji">{cat.icon}</span>
                        <div className="cat-title-group">
                          <strong>{cat.name}</strong>
                          <span className="cat-sub-text">
                            Planned: RM {cat.planned.toLocaleString()} · Actual: RM {cat.actual.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="cat-progress-wrapper">
                        <div className="cat-bar-track">
                          <div
                            className={`cat-bar-fill ${catSaved ? 'saved-bar' : 'over-bar'}`}
                            style={{ width: `${pctSpent}%` }}
                          ></div>
                        </div>
                        <span className="cat-pct-label">{pctSpent}% spent</span>
                      </div>

                      <div className="cat-diff-tag">
                        {catSaved ? (
                          <span className="diff-saved">+ RM {catDiff.toLocaleString()} saved</span>
                        ) : (
                          <span className="diff-over">- RM {Math.abs(catDiff).toLocaleString()} over</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SETTLEMENT & BROADCAST ACTIONS */}
            <div className="budget-settlement-actions-card">
              <div className="settlement-info-col">
                <Users size={20} className="text-emerald" />
                <div>
                  <h4>Group Settlement Complete</h4>
                  <p>All expenses are balanced among {travellers} travellers at <strong>RM {perPaxActual.toLocaleString()}</strong> per person.</p>
                </div>
              </div>
              <div className="settlement-btn-group">
                <button
                  className="btn-clean-secondary"
                  onClick={() => {
                    const text = `🎉 Trip Expense Summary for ${selectedCity?.city || 'Our Trip'}:\nInitial Budget: RM ${initialBudget}\nFinal Total Spent: RM ${totalActual}\nTotal Saved: RM ${varianceAmount}\nPer Person: RM ${perPaxActual}\nSettlement complete on PlanTrip.ai!`
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                >
                  <Share2 size={15} />
                  <span>Broadcast on WhatsApp</span>
                </button>
                <button className="btn-clean-primary" onClick={() => setActiveTab('history')}>
                  <History size={15} />
                  <span>View Travel History Log</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 📜 TRAVEL HISTORY */}
        {activeTab === 'history' && (
          <div className="memory-tab-pane travel-history-pane fade-in">
            {/* LIFETIME STATS BANNER */}
            <div className="lifetime-travel-stats-card">
              <div className="stats-heading">
                <Award size={22} className="text-amber" />
                <div>
                  <h3>Your Lifetime Travel Odyssey</h3>
                  <p>Track all your completed trips, smart savings, and keepsake memories</p>
                </div>
              </div>

              <div className="lifetime-stats-grid">
                <div className="life-stat-box">
                  <span className="life-stat-val">{lifetimeStats.totalTrips}</span>
                  <span className="life-stat-label">Trips Explored</span>
                </div>
                <div className="life-stat-box">
                  <span className="life-stat-val">{lifetimeStats.totalSpots}</span>
                  <span className="life-stat-label">Sights & Spots</span>
                </div>
                <div className="life-stat-box highlight">
                  <span className="life-stat-val">+ RM {lifetimeStats.totalSaved}</span>
                  <span className="life-stat-label">Budget Saved</span>
                </div>
                <div className="life-stat-box">
                  <span className="life-stat-val">{lifetimeStats.postcardsCount}</span>
                  <span className="life-stat-label">Postcards Crafted</span>
                </div>
              </div>
            </div>

            {/* PAST TRIPS LOG LIST */}
            <div className="past-trips-list-section">
              <div className="card-inner-header">
                <h3>Completed Trips & Memory Timeline</h3>
                <p>Browse previous itineraries, budget achievements, and memory stamps</p>
              </div>

              <div className="past-trips-cards-grid">
                {travelHistoryLog.map(trip => (
                  <div key={trip.id} className="past-trip-card">
                    <div className="trip-card-top">
                      <div className="trip-dest-badge">
                        <MapPin size={14} />
                        <strong>{trip.city}, {trip.country}</strong>
                      </div>
                      <span className={`trip-status-tag ${trip.badgeClass}`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="trip-dates-row">
                      <Calendar size={13} />
                      <span>{trip.dates} · {trip.travellers}</span>
                    </div>

                    <div className="trip-highlights-box">
                      <small>Key Highlights:</small>
                      <p>{trip.highlights}</p>
                    </div>

                    <div className="trip-budget-comparison-row">
                      <div className="trip-budget-col">
                        <span className="b-label">Initial Budget</span>
                        <span className="b-val">RM {trip.initialBudget.toLocaleString()}</span>
                      </div>
                      <div className="trip-budget-col">
                        <span className="b-label">Final Spent</span>
                        <span className="b-val">RM {trip.finalSpend.toLocaleString()}</span>
                      </div>
                      <div className="trip-budget-col saved">
                        <span className="b-label">Savings</span>
                        <span className="b-val text-emerald">+ RM {trip.saved.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="trip-card-actions">
                      <button
                        className="btn-trip-action-clean"
                        onClick={() => setActiveTab('postcard')}
                      >
                        <Camera size={14} /> View Postcard
                      </button>
                      <button
                        className="btn-trip-action-clean highlight"
                        onClick={() => setActiveTab('doc')}
                      >
                        <FileText size={14} /> View Doc
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WORD TRIP RECAP */}
        {activeTab === 'doc' && (
          <div className="memory-tab-pane fade-in">
            <AIAgentPage
              destination={selectedCity}
              country={selectedCountry}
              departureDate={departureDate}
              returnDate={returnDate}
              travellers={travellers}
              travelParty={travelParty}
              budgetTier={budgetTier}
              budgetAmount={budgetAmount}
              itinerary={smartItinerary}
              bucketList={basket}
              onBack={() => setActiveTab('budget-summary')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
