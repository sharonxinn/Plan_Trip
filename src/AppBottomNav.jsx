import React from 'react'
import {
  MapPin, DollarSign, Compass, Zap, Users, Luggage,
  Scale, Bot, Camera, ShoppingBag
} from 'lucide-react'

export default function AppBottomNav({
  currentPage,
  onSelectPage,
  basketCount = 0,
  onOpenBasket,
  onOpenGroupChat,
  groupChatOpen = false,
  basketOpen = false
}) {
  const navItems = [
    { id: 'setup', label: '1. Setup', icon: MapPin },
    { id: 'budget', label: '2. Budget', icon: DollarSign },
    { id: 'explore', label: '3. Discover', icon: Compass },
    { id: 'planb', label: '4. Plan B', icon: Zap, isHighlight: true },
    { id: 'group', label: '5. Squad', icon: Users },
    { id: 'pack', label: '6. Export', icon: Luggage }
  ]

  return (
    <nav className="app-native-bottom-nav" aria-label="Mobile App Navigation">
      <div className="bottom-nav-inner">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentPage === item.id && !groupChatOpen && !basketOpen
          return (
            <button
              key={item.id}
              className={`nav-tab-item ${isActive ? 'active' : ''} ${item.isHighlight ? 'center-highlight' : ''}`}
              onClick={() => onSelectPage(item.id)}
            >
              <div className={`tab-icon-wrapper ${item.isHighlight ? 'center-badge' : ''}`}>
                <Icon size={item.isHighlight ? 20 : 18} />
              </div>
              <span className="tab-label">{item.label}</span>
            </button>
          )
        })}

        {/* Trip Basket Button */}
        <button
          className={`nav-tab-item ${basketOpen ? 'active' : ''}`}
          onClick={onOpenBasket}
        >
          <div className="tab-icon-wrapper">
            <ShoppingBag size={18} />
            {basketCount > 0 && (
              <span className="nav-badge-count">{basketCount}</span>
            )}
          </div>
          <span className="tab-label">Basket</span>
        </button>
      </div>
    </nav>
  )
}

