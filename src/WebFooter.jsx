import React from 'react'
import {
  Compass, ShieldCheck, Zap, Globe, Heart, ExternalLink,
  MapPin, Calendar, Users, DollarSign, Sparkles
} from 'lucide-react'

export default function WebFooter({ onSelectPage, onSelectCity, countriesData = [] }) {
  const popularCities = [
    { city: 'Penang', tag: 'UNESCO Food Capital' },
    { city: 'Kuala Lumpur', tag: 'Skyline & Heritage' },
    { city: 'Ipoh', tag: 'Caves & White Coffee' },
    { city: 'Tokyo', tag: 'Neon & Culture' },
    { city: 'Bangkok', tag: 'Temples & Night Markets' },
    { city: 'Singapore', tag: 'Gardens & Skyline' }
  ]

  return (
    <footer className="website-main-footer">
      <div className="container">
        {/* TOP BRAND & NEWSLETTER ROW */}
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="logo-sparkle-badge">
                <Compass size={20} className="brand-compass-icon" />
              </div>
              <span className="brand-title-text">
                PlanTrip<span className="brand-accent-text">.ai</span>
              </span>
            </div>
            <p className="footer-mission-text">
              Intelligent group travel planner and smart route generator. Auto-collect Google Maps links from group chats, optimize non-backtracking daily routes, and split trip expenses with zero stress.
            </p>
            <div className="footer-live-status-row">
              <span className="live-status-pill">
                <span className="status-dot online" /> Open-Meteo Live Weather
              </span>
              <span className="live-status-pill">
                <span className="status-dot online" /> Live ECB Forex Rates
              </span>
              <span className="live-status-pill">
                <span className="status-dot online" /> Google Maps Direct Routes
              </span>
            </div>
          </div>

          {/* QUICK LINKS COLS */}
          <div className="footer-links-col">
            <h4>Trip Stages</h4>
            <ul>
              <li><button onClick={() => onSelectPage('dashboard')}>🏠 Origin Dashboard</button></li>
              <li><button onClick={() => onSelectPage('planning')}>1. Planning (Setup, Budget, Discover, Pack)</button></li>
              <li><button onClick={() => onSelectPage('travelling')}>2. Travelling (Expense Splitter, Plan B)</button></li>
              <li><button onClick={() => onSelectPage('memory')}>3. Memory (AI Postcard, Budget Summary)</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Popular Destinations</h4>
            <ul>
              {popularCities.map(c => (
                <li key={c.city}>
                  <button
                    onClick={() => {
                      if (onSelectCity) onSelectCity(c.city)
                      onSelectPage('planning')
                    }}
                  >
                    {c.city} <small className="dest-tag-small">({c.tag})</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Smart Tools</h4>
            <ul>
              <li><button onClick={() => onSelectPage('planning')}>Smart Route & Discover Hub</button></li>
              <li><button onClick={() => onSelectPage('travelling')}>⚡ Plan B Contingency Studio</button></li>
              <li><button onClick={() => onSelectPage('memory')}>E-Postcard Check-in Studio</button></li>
              <li><button onClick={() => onSelectPage('memory')}>Budget vs Actual Variance</button></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & COMPLIANCE BAR */}
        <div className="footer-bottom-bar">
          <div className="footer-copy-text">
            © {new Date().getFullYear()} PlanTrip AI Travel Planner. Built for effortless, stress-free group adventures.
          </div>
          <div className="footer-social-meta">
            <span>Powered by Real-Time Open Data & Smart Routing Engine</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
