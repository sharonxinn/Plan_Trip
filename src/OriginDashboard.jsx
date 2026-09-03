import React, { useState, useEffect } from 'react'
import {
  Calendar, MapPin, Users, Sparkles, Clock, ArrowRight, ShieldCheck,
  Compass, Zap, DollarSign, Camera, CheckCircle2, ChevronRight,
  Sun, CloudRain, Wind, Thermometer, Umbrella, Luggage, FileText,
  Heart, Plane, BedDouble, Utensils, Check, Flame
} from 'lucide-react'

export default function OriginDashboard({
  selectedCity,
  selectedCountry,
  departureDate,
  returnDate,
  travellers,
  travelParty,
  budgetAmount,
  basket = [],
  isCalendarAdded = false,
  onNavigateStage,
  onOpenDateEditor,
  onOpenSmartWizard
}) {
  // Live Countdown Calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isToday: false,
    isPast: false
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!departureDate) return
      const targetTime = new Date(`${departureDate}T08:00:00`).getTime()
      const now = new Date().getTime()
      const difference = targetTime - now

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      if (days === 0 && difference > 0) {
        setTimeLeft({ days: 0, hours, minutes, seconds, isToday: true, isPast: false })
      } else if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true, isPast: true })
      } else {
        setTimeLeft({ days, hours, minutes, seconds, isToday: false, isPast: false })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [departureDate])

  // Is today travel day or actively travelling
  const isTravellingNow = timeLeft.isToday || timeLeft.isPast

  // Format dates
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Calculate duration in days
  const durationDays = Math.max(
    1,
    Math.ceil((new Date(returnDate) - new Date(departureDate)) / (1000 * 60 * 60 * 24)) + 1
  )

  // Weather forecast dataset based on destination
  const getWeatherForecast = (city) => {
    const name = city?.city?.toLowerCase() || ''
    if (name.includes('tokyo') || name.includes('japan')) {
      return {
        current: { temp: '22°C', condition: 'Partly Cloudy', icon: 'sun', humidity: '62%', rain: '15%', tip: 'Mild climate · Light jacket recommended' },
        forecast: [
          { day: 'Day 1', temp: '22°C', condition: 'Partly Cloudy', rain: '15%', icon: '⛅' },
          { day: 'Day 2', temp: '24°C', condition: 'Sunny & Crisp', rain: '5%', icon: '☀️' },
          { day: 'Day 3', temp: '20°C', condition: 'Evening Drizzle', rain: '45%', icon: '🌧️' }
        ]
      }
    } else if (name.includes('london') || name.includes('uk')) {
      return {
        current: { temp: '17°C', condition: 'Light Drizzle', icon: 'rain', humidity: '80%', rain: '65%', tip: 'Bring an umbrella & waterproof trench coat' },
        forecast: [
          { day: 'Day 1', temp: '17°C', condition: 'Light Rain', rain: '65%', icon: '🌧️' },
          { day: 'Day 2', temp: '18°C', condition: 'Overcast Skies', rain: '40%', icon: '☁️' },
          { day: 'Day 3', temp: '19°C', condition: 'Sunny Spells', rain: '20%', icon: '🌤️' }
        ]
      }
    } else if (name.includes('paris') || name.includes('france')) {
      return {
        current: { temp: '20°C', condition: 'Sunny & Pleasant', icon: 'sun', humidity: '58%', rain: '10%', tip: 'Comfortable walking shoes & sunscreen' },
        forecast: [
          { day: 'Day 1', temp: '20°C', condition: 'Sunny & Clear', rain: '10%', icon: '☀️' },
          { day: 'Day 2', temp: '22°C', condition: 'Pleasant Breeze', rain: '15%', icon: '🌤️' },
          { day: 'Day 3', temp: '21°C', condition: 'Scattered Clouds', rain: '25%', icon: '⛅' }
        ]
      }
    } else if (name.includes('bangkok') || name.includes('thailand')) {
      return {
        current: { temp: '32°C', condition: 'Tropical Sun', icon: 'sun', humidity: '82%', rain: '30%', tip: 'Breathable linen clothes & hydration' },
        forecast: [
          { day: 'Day 1', temp: '32°C', condition: 'Tropical Sun', rain: '30%', icon: '☀️' },
          { day: 'Day 2', temp: '33°C', condition: 'Afternoon Heat', rain: '20%', icon: '🌤️' },
          { day: 'Day 3', temp: '31°C', condition: 'Passing Showers', rain: '55%', icon: '🌦️' }
        ]
      }
    } else {
      // Default: Malaysia / Tropical (KL, Penang, Ipoh)
      return {
        current: { temp: '29°C', condition: 'Tropical Sunshine', icon: 'sun', humidity: '76%', rain: '25%', tip: 'Light cotton clothes + pocket umbrella for afternoon showers' },
        forecast: [
          { day: 'Day 1', temp: '29°C', condition: 'Sunny Mornings', rain: '25%', icon: '🌤️' },
          { day: 'Day 2', temp: '30°C', condition: 'Warm & Humid', rain: '20%', icon: '☀️' },
          { day: 'Day 3', temp: '28°C', condition: 'Afternoon Shower', rain: '60%', icon: '🌦️' }
        ]
      }
    }
  }

  const weatherData = getWeatherForecast(selectedCity)
  const weather = weatherData.current

  return (
    <div className="origin-dashboard-container fade-in">
      {/* 0. ACTIVE TRAVEL DAY BANNER (WHEN DAYS === 0 OR TRAVELLING) */}
      {isTravellingNow && (
        <div className="travel-day-active-alert fade-in">
          <div className="alert-badge-group">
            <span className="live-pulse-dot-red"></span>
            <strong>✈️ TRAVEL DAY ACTIVE!</strong>
          </div>
          <span>You are officially on your trip in {selectedCity?.city}! Your In-Trip Companion & Plan B are active.</span>
          <button className="btn-alert-action" onClick={() => onNavigateStage('travelling')}>
            Open Travelling Companion <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 1. TOP DUAL HERO: MULTI-DAY WEATHER FORECAST & LIVE COUNTDOWN TIMER */}
      <section className="dashboard-top-hero-grid">
        {/* WEATHER FORECAST CARD */}
        <div className="dashboard-weather-card">
          <div className="weather-card-header">
            <span className="weather-badge">
              <Sun size={14} className="text-amber" />
              <span>Weather Forecast</span>
            </span>
            <span className="weather-city-tag">📍 {selectedCity?.city || 'Destination'}</span>
          </div>

          <div className="weather-main-row">
            <div className="weather-temp-group">
              <span className="weather-temp-num">{weather.temp}</span>
              <span className="weather-condition-text">{weather.condition}</span>
            </div>
            <div className="weather-icon-illustration">
              {weather.icon === 'rain' ? (
                <CloudRain size={40} className="weather-big-icon rain" />
              ) : (
                <Sun size={40} className="weather-big-icon sun" />
              )}
            </div>
          </div>

          {/* 3-Day Forecast Strip */}
          <div className="weather-forecast-strip">
            {weatherData.forecast.map((f, idx) => (
              <div key={idx} className="forecast-mini-col">
                <span className="f-day">{f.day}</span>
                <span className="f-icon">{f.icon}</span>
                <span className="f-temp">{f.temp}</span>
                <span className="f-rain">💧 {f.rain}</span>
              </div>
            ))}
          </div>

          <div className="weather-pack-tip">
            <Sparkles size={13} className="text-amber" />
            <span><strong>Packing Tip:</strong> {weather.tip}</span>
          </div>
        </div>

        {/* COUNTDOWN TIMER CARD */}
        <div className={`countdown-hero-card ${isTravellingNow ? 'active-trip-mode' : ''}`}>
          <div className="countdown-card-header">
            <div className="countdown-badge-row">
              {isTravellingNow ? (
                <span className="live-pulse-badge travel-active">
                  <span className="live-dot-green"></span> 🎉 Travel Day Active!
                </span>
              ) : (
                <span className="live-pulse-badge">
                  <span className="live-dot"></span> Live Countdown to Departure
                </span>
              )}
              <span className="trip-status-pill">
                {selectedCity?.city || 'Trip'}, {selectedCountry?.country || selectedCity?.country || 'Malaysia'}
              </span>
            </div>
            <button className="btn-edit-dates-inline" onClick={onOpenDateEditor} title="Change Dates">
              Edit Dates ✎
            </button>
          </div>

          <div className="countdown-timer-center">
            {isTravellingNow ? (
              <div className="travel-now-display">
                <div className="travel-now-icon">✈️</div>
                <div className="travel-now-text">
                  <h3>0 Days Remaining · Have an Amazing Trip!</h3>
                  <p>In-Trip Expense Splitter & Plan B Rerouting are ready</p>
                </div>
              </div>
            ) : (
              <div className="countdown-timer-grid">
                <div className="timer-unit-card">
                  <span className="timer-number">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="timer-label">DAYS</span>
                </div>
                <span className="timer-colon">:</span>
                <div className="timer-unit-card">
                  <span className="timer-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="timer-label">HOURS</span>
                </div>
                <span className="timer-colon">:</span>
                <div className="timer-unit-card">
                  <span className="timer-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="timer-label">MINS</span>
                </div>
                <span className="timer-colon">:</span>
                <div className="timer-unit-card highlight-sec">
                  <span className="timer-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="timer-label">SECS</span>
                </div>
              </div>
            )}
          </div>

          <div className="countdown-footer-meta">
            <div className="meta-pill">
              <Calendar size={13} />
              <span>{formatDateDisplay(departureDate)} → {formatDateDisplay(returnDate)} ({durationDays} Days)</span>
            </div>
            <div className="meta-pill">
              <Users size={13} />
              <span>{travellers} Travellers ({travelParty})</span>
            </div>
            {isCalendarAdded && (
              <div className="meta-pill cal-active">
                <Check size={13} className="text-emerald" />
                <span>Added to Calendar</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. THREE PRIMARY STAGE CARDS */}
      <section className="dashboard-stages-section">
        <div className="section-heading-clean">
          <h2>Trip Stage Hubs</h2>
          <p>
            {isTravellingNow
              ? 'Your trip is currently active! Use Stage 2 for expenses and real-time contingencies.'
              : 'Click any card to open its dedicated tools and workflow'}
          </p>
        </div>

        <div className="stage-cards-grid">
          {/* CARD 1: PLANNING */}
          <div className="stage-card-item stage-plan-card" onClick={() => onNavigateStage('planning')}>
            <div className="stage-card-header">
              <div className="stage-icon-wrap plan-theme">
                <Compass size={24} />
              </div>
              <span className="stage-phase-tag plan-tag">Stage 1 · Planning</span>
            </div>

            <div className="stage-card-body">
              <h3 className="stage-title">Planning</h3>
              <p className="stage-desc">
                Setup your trip, configure your overall budget, discover transport, stays & spots, and prepare your weather packing checklist.
              </p>

              <div className="stage-feature-list">
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>1. Setup (Party, Dates, Vibes, Dietary)</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>2. Overall Budget Allocation</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>3. Discover (Transport, Stays, Places)</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>4. Pack (Checklist) & Add to Calendar</span>
                </div>
              </div>
            </div>

            <div className="stage-card-footer">
              <div className="stage-metric-badge">
                <Sparkles size={13} />
                <span>{basket.length} spots saved</span>
              </div>
              <button className="btn-stage-action plan-btn">
                <span>Open Planning</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* CARD 2: TRAVELLING (BECOMES PRIMARY ACTIVE CARD WHEN DAYS === 0) */}
          <div
            className={`stage-card-item stage-intrip-card ${isTravellingNow ? 'active-highlighted-card' : ''}`}
            onClick={() => onNavigateStage('travelling')}
          >
            <div className="stage-card-header">
              <div className="stage-icon-wrap intrip-theme">
                <Zap size={24} />
              </div>
              {isTravellingNow ? (
                <span className="stage-phase-tag intrip-tag pulse-tag">
                  🔥 Active Trip Now
                </span>
              ) : (
                <span className="stage-phase-tag intrip-tag">Stage 2 · In-Trip</span>
              )}
            </div>

            <div className="stage-card-body">
              <h3 className="stage-title">Travelling</h3>
              <p className="stage-desc">
                Your live on-the-road companion: real-time bill & expense splitting, instant Plan B rain/closure rerouting, and emergency hotlines.
              </p>

              <div className="stage-feature-list">
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>1. Budget (Real-Time Expense Splitter)</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>2. Plan B Contingency Studio (Rain/Fatigue)</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>3. Offline Daily Run-Sheet & Timetable</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>4. Emergency Embassy & Hotline Directory</span>
                </div>
              </div>
            </div>

            <div className="stage-card-footer">
              <div className="stage-metric-badge intrip-metric">
                <ShieldCheck size={13} />
                <span>{isTravellingNow ? 'Active on Trip' : 'Zero-Panic Guard'}</span>
              </div>
              <button className="btn-stage-action intrip-btn">
                <span>{isTravellingNow ? '🚀 Open Travelling' : 'Open Travelling'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* CARD 3: MEMORY */}
          <div className="stage-card-item stage-aftertrip-card" onClick={() => onNavigateStage('memory')}>
            <div className="stage-card-header">
              <div className="stage-icon-wrap aftertrip-theme">
                <Camera size={24} />
              </div>
              <span className="stage-phase-tag aftertrip-tag">Stage 3 · Post-Trip</span>
            </div>

            <div className="stage-card-body">
              <h3 className="stage-title">Memory</h3>
              <p className="stage-desc">
                Celebrate your travel memories with AI digital souvenir postcards, budget vs actual variance summaries, and your travel history.
              </p>

              <div className="stage-feature-list">
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>1. AI Digital Postcard Studio</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>2. Summary of Budget (Initial vs Final)</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>3. 📜 Travel History & Past Trips</span>
                </div>
                <div className="stage-feature-row">
                  <CheckCircle2 size={15} className="feature-icon check" />
                  <span>4. Keepsake Photo & Caption Download</span>
                </div>
              </div>
            </div>

            <div className="stage-card-footer">
              <div className="stage-metric-badge aftertrip-metric">
                <DollarSign size={13} />
                <span>Memories & History</span>
              </div>
              <button className="btn-stage-action aftertrip-btn">
                <span>Open Memory</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK SMART ROUTE SHORTCUT */}
      <section className="dashboard-quick-footer-bar">
        <div className="quick-helper-pill">
          <Sparkles size={16} className="sparkle-icon" />
          <span>Want an auto-assembled multi-day plan? Launch the </span>
          <button className="link-btn-highlight" onClick={onOpenSmartWizard}>
            Smart Route Wizard ⚡
          </button>
        </div>
      </section>
    </div>
  )
}
