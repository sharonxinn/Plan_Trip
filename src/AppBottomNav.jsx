import React from 'react'
import { Compass, Scale, Bot, Camera, MessageCircle, ShoppingBag, Sparkles } from 'lucide-react'

export default function AppBottomNav({
  currentPage,
  onSelectPage,
  basketCount = 0,
  onOpenBasket,
  onOpenGroupChat,
  groupChatOpen = false,
  basketOpen = false
}) {
  return (
    <nav className="app-native-bottom-nav" aria-label="Mobile App Navigation">
      <div className="bottom-nav-inner">
        {/* 1. Explore Tab */}
        <button
          className={`nav-tab-item ${currentPage === 'explore' && !groupChatOpen && !basketOpen ? 'active' : ''}`}
          onClick={() => {
            onSelectPage('explore')
          }}
        >
          <div className="tab-icon-wrapper">
            <Compass size={19} />
          </div>
          <span className="tab-label">Explore</span>
        </button>

        {/* 2. Compare Tab */}
        <button
          className={`nav-tab-item ${currentPage === 'compare' && !groupChatOpen && !basketOpen ? 'active' : ''}`}
          onClick={() => {
            onSelectPage('compare')
          }}
        >
          <div className="tab-icon-wrapper">
            <Scale size={19} />
          </div>
          <span className="tab-label">Compare</span>
        </button>

        {/* 3. AI Planner (Center Action Tab) */}
        <button
          className={`nav-tab-item center-highlight ${currentPage === 'ai' && !groupChatOpen && !basketOpen ? 'active' : ''}`}
          onClick={() => {
            onSelectPage('ai')
          }}
        >
          <div className="tab-icon-wrapper center-badge">
            <Bot size={20} />
          </div>
          <span className="tab-label">AI Plan</span>
        </button>

        {/* 4. Postcard & Check-in Tab */}
        <button
          className={`nav-tab-item ${currentPage === 'postcard' && !groupChatOpen && !basketOpen ? 'active' : ''}`}
          onClick={() => {
            onSelectPage('postcard')
          }}
        >
          <div className="tab-icon-wrapper">
            <Camera size={19} />
          </div>
          <span className="tab-label">Postcard</span>
        </button>

        {/* 5. WhatsApp Hub */}
        <button
          className={`nav-tab-item ${groupChatOpen ? 'active' : ''}`}
          onClick={onOpenGroupChat}
        >
          <div className="tab-icon-wrapper">
            <MessageCircle size={19} />
            <span className="live-nav-dot" />
          </div>
          <span className="tab-label">Hub</span>
        </button>

        {/* 6. Trip Basket */}
        <button
          className={`nav-tab-item ${basketOpen ? 'active' : ''}`}
          onClick={onOpenBasket}
        >
          <div className="tab-icon-wrapper">
            <ShoppingBag size={19} />
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
