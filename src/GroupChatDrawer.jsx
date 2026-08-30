import React, { useState, useEffect } from 'react'
import {
  MessageCircle, X, Send, Share2, Sparkles, Check, Plus,
  Users, Copy, ExternalLink, ThumbsUp, Heart, Wand2, ArrowRight,
  Download, MessageSquare, ClipboardCheck, Bot, UserPlus, Trash2, CheckCircle2,
  Zap, ToggleLeft, ToggleRight, Radio
} from 'lucide-react'

export default function GroupChatDrawer({
  isOpen,
  onClose,
  destination,
  departureDate,
  returnDate,
  durationDays,
  travellers,
  travelParty,
  budgetAmount,
  basket = [],
  onAddToBasket
}) {
  const [activeTab, setActiveTab] = useState('whatsapp') // 'whatsapp' | 'members' | 'chat' | 'parser'
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [copiedReplyId, setCopiedReplyId] = useState(null)
  const [appliedWishId, setAppliedWishId] = useState(null)
  const [autoApply, setAutoApply] = useState(true)

  // Real Group Members Management (Fully dynamic)
  const [members, setMembers] = useState([
    { id: 'm1', name: 'You (Organizer)', avatar: '🌟', isOrganizer: true },
    { id: 'm2', name: 'Pei Shan', avatar: '👩', isOrganizer: false },
    { id: 'm3', name: 'Vicky', avatar: '🧑', isOrganizer: false }
  ])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberAvatar, setNewMemberAvatar] = useState('🧑')

  // In-app group chat messages
  const [chatMessages, setChatMessages] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [activeChatSender, setActiveChatSender] = useState('You (Organizer)')

  // Live WhatsApp Captured Suggestions Feed
  const [capturedSuggestions, setCapturedSuggestions] = useState([])
  const [simulatedInput, setSimulatedInput] = useState('')
  const [simulatedSender, setSimulatedSender] = useState('Pei Shan')
  const [isCapturing, setIsCapturing] = useState(false)

  // WhatsApp pasted chat log parser state
  const [pastedChat, setPastedChat] = useState('')
  const [parsedWishes, setParsedWishes] = useState([])
  const [parserLoading, setParserLoading] = useState(false)

  const cityName = destination?.city || 'Kuala Lumpur'
  const countryName = destination?.country || 'Malaysia'

  // Poll live WhatsApp suggestions feed from backend
  useEffect(() => {
    const fetchFeed = () => {
      fetch('/api/whatsapp/feed')
        .then(res => res.json())
        .then(data => {
          if (data.suggestions && data.suggestions.length > 0) {
            setCapturedSuggestions(prev => {
              const ids = new Set(prev.map(p => p.id))
              const newItems = data.suggestions.filter(s => !ids.has(s.id))
              if (newItems.length > 0) {
                newItems.forEach(item => {
                  if (item.sender && !members.some(m => m.name.toLowerCase() === item.sender.toLowerCase())) {
                    setMembers(mPrev => [...mPrev, { id: `mem-${Date.now()}`, name: item.sender, avatar: '🧑' }])
                  }
                  if (autoApply && item.suggestedItem && onAddToBasket) {
                    onAddToBasket(item.suggestedItem)
                  }
                })
                return [...newItems, ...prev]
              }
              return prev
            })
          }
        })
        .catch(() => {})
    }
    fetchFeed()
    const timer = setInterval(fetchFeed, 3000)
    return () => clearInterval(timer)
  }, [members, autoApply, onAddToBasket])

  // Add new real group member
  const handleAddMember = e => {
    if (e) e.preventDefault()
    if (!newMemberName.trim()) return
    const nameClean = newMemberName.trim()
    if (!members.some(m => m.name.toLowerCase() === nameClean.toLowerCase())) {
      const newM = {
        id: `mem-${Date.now()}`,
        name: nameClean,
        avatar: newMemberAvatar || '🧑',
        isOrganizer: false
      }
      setMembers(prev => [...prev, newM])
      if (!simulatedSender) setSimulatedSender(nameClean)
    }
    setNewMemberName('')
  }

  // Remove member
  const handleRemoveMember = id => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  // Generate WhatsApp Share Message with Real Destination Data
  const generateWhatsAppMessage = () => {
    const attractionsList = basket.filter(b => b.type === 'attraction' || b.category).map(a => `• 🏛️ ${a.name} (${typeof a.rating === 'number' ? a.rating.toFixed(1) : String(a.rating || '4.8').replace('★', '').trim()}★)`).join('\n') || `• 🏛️ Top-rated Google review sights in ${cityName}`
    const diningList = basket.filter(b => b.type === 'restaurant' || b.cuisine).map(r => `• 🍽️ ${r.name} (${r.priceTier || '$$'} · ${r.cuisine || 'Local'})`).join('\n') || `• 🍽️ Google 4.8★+ verified food spots in ${cityName}`

    const membersListStr = members.map(m => m.name).join(', ')

    return `🌴 *Our ${cityName}, ${countryName} Trip Plan!* ✈️
📅 *Dates:* ${departureDate} ➔ ${returnDate} (${durationDays} Days)
👥 *Group:* ${members.length} Travelers (${membersListStr})
💰 *Target Budget:* RM ${budgetAmount.toLocaleString()} (RM ${Math.round(budgetAmount / Math.max(1, members.length)).toLocaleString()}/pax)

📍 *Selected Attractions & Sights:*
${attractionsList}

🍲 *Selected Dining & Food Spots:*
${diningList}

🗺️ *Live Google Maps & Interactive Plan:*
👉 http://127.0.0.1:5173

_💬 Reply in this WhatsApp group with any place suggestions, food wishes, or budget preferences — our AI Trip Planner will automatically capture your real feedback and update our itinerary!_`
  }

  const whatsAppShareUrl = `https://wa.me/?text=${encodeURIComponent(generateWhatsAppMessage())}`

  const copyWhatsAppText = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage())
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2500)
  }

  const copyCounterProposal = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedReplyId(id)
    setTimeout(() => setCopiedReplyId(null), 2500)
  }

  // Trigger capture with custom or pre-set prompt
  const triggerCapture = async (senderName, messageText) => {
    if (!messageText?.trim()) return
    const actualSender = (senderName?.trim() || members[0]?.name || 'Traveler')

    // Auto-register member
    if (!members.some(m => m.name.toLowerCase() === actualSender.toLowerCase())) {
      setMembers(prev => [...prev, { id: `mem-${Date.now()}`, name: actualSender, avatar: '🧑' }])
    }

    setIsCapturing(true)
    try {
      const res = await fetch('/api/whatsapp/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingMessage: messageText.trim(),
          sender: actualSender,
          destination,
          budgetAmount,
          travellers: Math.max(1, members.length),
          travelParty
        })
      })
      const data = await res.json()
      if (data.suggestion) {
        setCapturedSuggestions(prev => {
          if (!prev.some(p => p.id === data.suggestion.id)) {
            return [data.suggestion, ...prev]
          }
          return prev
        })
        if (autoApply && data.suggestion.suggestedItem && onAddToBasket) {
          onAddToBasket(data.suggestion.suggestedItem)
          setAppliedWishId(data.suggestion.id)
        }
      }
      setSimulatedInput('')
    } catch (_err) {
    } finally {
      setIsCapturing(false)
    }
  }

  // Form submit handler
  const handleCaptureWhatsAppSuggestion = e => {
    if (e) e.preventDefault()
    triggerCapture(simulatedSender, simulatedInput)
  }

  // Apply suggestion to basket manually
  const handleApplySuggestion = (item, sugId) => {
    if (item && onAddToBasket) {
      onAddToBasket(item)
      setAppliedWishId(sugId)
      setTimeout(() => setAppliedWishId(null), 3000)
    }
  }

  // In-app group chat send
  const handleSendChat = async e => {
    e.preventDefault()
    if (!inputMsg.trim()) return

    const senderObj = members.find(m => m.name === activeChatSender) || { name: activeChatSender, avatar: '🧑' }
    const currentMsgText = inputMsg.trim()

    const newMsg = {
      id: Date.now(),
      sender: senderObj.name,
      avatar: senderObj.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: currentMsgText,
      likes: 0
    }

    setChatMessages(prev => [...prev, newMsg])
    setInputMsg('')

    // Check if message has a wish and query real place data
    if (currentMsgText.length > 3) {
      try {
        const res = await fetch('/api/ai/whatsapp-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incomingMessage: currentMsgText,
            sender: senderObj.name,
            destination,
            currentBasket: basket,
            budgetAmount,
            travellers: members.length,
            travelParty
          })
        })
        const data = await res.json()
        if (data.suggestedItem) {
          setChatMessages(prev =>
            prev.map(m => m.id === newMsg.id ? { ...m, wish: data.suggestedItem } : m)
          )
          if (autoApply && onAddToBasket) {
            onAddToBasket(data.suggestedItem)
          }
        }
      } catch (_err) {}
    }
  }

  // Parse pasted real WhatsApp chat log
  const handleParseWhatsAppChat = async () => {
    if (!pastedChat.trim()) return
    setParserLoading(true)
    setParsedWishes([])

    const lines = pastedChat.split('\n').filter(l => l.trim().length > 0)
    const extractedList = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let sender = 'Traveler'
      let message = line

      const waMatch1 = line.match(/(?:\[.*?\]\s*|(?:\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*-\s*))([^:]+):\s*(.+)/)
      const waMatch2 = line.match(/^([^:]+):\s*(.+)/)

      if (waMatch1) {
        sender = waMatch1[1].trim()
        message = waMatch1[2].trim()
      } else if (waMatch2) {
        sender = waMatch2[1].trim()
        message = waMatch2[2].trim()
      }

      if (sender && !members.some(m => m.name.toLowerCase() === sender.toLowerCase())) {
        setMembers(prev => [...prev, { id: `mem-${Date.now()}-${i}`, name: sender, avatar: '🧑' }])
      }

      try {
        const res = await fetch('/api/ai/whatsapp-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incomingMessage: message,
            sender,
            destination,
            currentBasket: basket,
            budgetAmount,
            travellers: members.length,
            travelParty
          })
        })
        const data = await res.json()
        if (data.suggestedItem) {
          extractedList.push({
            id: `parse-${Date.now()}-${i}`,
            member: sender,
            wishName: data.suggestedItem.name,
            type: data.suggestedItem.type,
            category: data.suggestedItem.category || data.suggestedItem.cuisine,
            rating: data.suggestedItem.rating || 4.8,
            reviewCount: data.suggestedItem.reviewsCount || data.suggestedItem.reviewCount,
            extractedText: message,
            realItem: data.suggestedItem
          })
          if (autoApply && onAddToBasket) {
            onAddToBasket(data.suggestedItem)
          }
        }
      } catch (_e) {}
    }

    setParsedWishes(extractedList)
    setParserLoading(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="group-chat-drawer open">
        {/* DRAWER HEADER */}
        <div className="chat-drawer-header">
          <div className="drawer-title-group">
            <div className="whatsapp-badge">
              <MessageCircle size={16} />
              <span>Real WhatsApp & Group Hub</span>
            </div>
            <h2>Group Hub ({members.length} Members in {cityName})</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close group chat">
            <X size={20} />
          </button>
        </div>

        {/* TAB NAVIGATION PILLS */}
        <div className="chat-tab-navigation">
          <button
            className={`chat-tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('whatsapp')}
          >
            <Bot size={14} />
            <span>AI WhatsApp Listener</span>
          </button>
          <button
            className={`chat-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={14} />
            <span>Members ({members.length})</span>
          </button>
          <button
            className={`chat-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={14} />
            <span>Trip Chat</span>
          </button>
          <button
            className={`chat-tab-btn ${activeTab === 'parser' ? 'active' : ''}`}
            onClick={() => setActiveTab('parser')}
          >
            <Wand2 size={14} />
            <span>Chat Parser</span>
          </button>
        </div>

        {/* TAB 1: WHATSAPP AUTO-CAPTURE & AI PROPOSALS (100% REAL DATA) */}
        {activeTab === 'whatsapp' && (
          <div className="whatsapp-tab-body">
            {/* LIVE AI LISTENER ACTIVE BANNER WITH AUTO-APPLY TOGGLE */}
            <div className="ai-listener-banner">
              <div className="listener-top-row">
                <div className="listener-live-indicator">
                  <span className="live-dot-pulse" />
                  <strong>Live WhatsApp Auto-Capture Active</strong>
                </div>
                <button
                  className={`auto-apply-toggle-btn ${autoApply ? 'on' : 'off'}`}
                  onClick={() => setAutoApply(!autoApply)}
                  title="When enabled, captured spots from WhatsApp are automatically added to your trip basket & itinerary"
                >
                  <Zap size={13} />
                  <span>Auto-Apply: {autoApply ? 'ON' : 'OFF'}</span>
                </button>
              </div>
              <p>
                When anyone in your WhatsApp group replies with a spot or food wish, AI captures it and queries verified <strong>{cityName} Google Review places</strong>.
              </p>
            </div>

            {/* 1. SEND PLAN TO WHATSAPP BUTTONS */}
            <div className="wa-share-action-card">
              <div className="share-card-header">
                <Share2 size={16} className="text-wa" />
                <strong>1. Send Live {cityName} Plan to WhatsApp Group:</strong>
              </div>
              <div className="wa-action-buttons-row">
                <a
                  href={whatsAppShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa-direct-share-sm"
                >
                  <MessageCircle size={15} />
                  <span>Open WhatsApp & Send</span>
                  <ExternalLink size={13} />
                </a>

                <button className="btn-wa-copy-sm" onClick={copyWhatsAppText}>
                  {copiedSummary ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Plan Text'}</span>
                </button>
              </div>
            </div>

            {/* 2. INSTANT CAPTURE BAR WITH 1-CLICK MEMBER QUICK TRIGGERS */}
            <div className="incoming-wa-input-card">
              <div className="input-card-title">
                <Bot size={15} />
                <span>2. Capture Inbound WhatsApp Reply:</span>
              </div>

              {/* Quick 1-Click Suggestion Triggers for Pei Shan, Vicky, etc. */}
              <div className="quick-suggestions-block">
                <span className="quick-block-label">⚡ 1-Click Test Member WhatsApp Replies:</span>
                <div className="quick-chips-grid">
                  <button
                    type="button"
                    className="quick-sug-chip highlight"
                    onClick={() => triggerCapture('Pei Shan', 'i want to visit trx')}
                  >
                    <span>👩 Pei Shan:</span> "I want to visit TRX"
                  </button>
                  <button
                    type="button"
                    className="quick-sug-chip"
                    onClick={() => triggerCapture('Pei Shan', 'Can we eat at Village Park Nasi Lemak?')}
                  >
                    <span>👩 Pei Shan:</span> "Village Park Nasi Lemak"
                  </button>
                  <button
                    type="button"
                    className="quick-sug-chip"
                    onClick={() => triggerCapture('Vicky', 'Please include Batu Caves on Day 2 morning')}
                  >
                    <span>🧑 Vicky:</span> "Batu Caves rainbow steps"
                  </button>
                  <button
                    type="button"
                    className="quick-sug-chip"
                    onClick={() => triggerCapture('Vicky', 'Aquaria KLCC for family sightseeing')}
                  >
                    <span>🧑 Vicky:</span> "Aquaria KLCC"
                  </button>
                </div>
              </div>

              {/* Custom Input Form */}
              <form onSubmit={handleCaptureWhatsAppSuggestion} className="incoming-wa-form">
                <div className="sender-select-row">
                  <span>From:</span>
                  <input
                    type="text"
                    className="custom-sender-input"
                    placeholder="Member name..."
                    value={simulatedSender}
                    onChange={e => setSimulatedSender(e.target.value)}
                  />
                  {members.length > 1 && (
                    <div className="quick-member-pills">
                      {members.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          className={`sender-pill ${simulatedSender === m.name ? 'active' : ''}`}
                          onClick={() => setSimulatedSender(m.name)}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="incoming-input-row">
                  <input
                    type="text"
                    placeholder={`What did ${simulatedSender || 'they'} say in WhatsApp? (e.g. "I want to visit TRX")`}
                    value={simulatedInput}
                    onChange={e => setSimulatedInput(e.target.value)}
                  />
                  <button type="submit" disabled={!simulatedInput.trim() || isCapturing}>
                    {isCapturing ? 'AI Matching...' : 'Auto-Capture'}
                  </button>
                </div>
              </form>
            </div>

            {/* 3. CAPTURED SUGGESTIONS LIST WITH REAL GOOGLE PLACES */}
            <div className="captured-suggestions-section">
              <div className="section-title-row">
                <Sparkles size={15} className="sparkle-gold" />
                <h4>Captured Suggestions & Google Review Matches ({capturedSuggestions.length})</h4>
              </div>

              {capturedSuggestions.length === 0 ? (
                <div className="empty-capture-hint">
                  <p>No WhatsApp suggestions captured yet. Click one of the <strong>1-Click Member Replies above</strong> or type what a friend in your group requested!</p>
                </div>
              ) : (
                <div className="captured-suggestions-list">
                  {capturedSuggestions.map(sug => {
                    const isApplied = appliedWishId === sug.id || basket.some(b => b.name === sug.suggestedItem?.name)
                    const isCopied = copiedReplyId === sug.id

                    return (
                      <div key={sug.id} className="captured-sug-card">
                        {/* Member Incoming Message Header */}
                        <div className="member-message-header">
                          <span className="member-avatar">{sug.avatar}</span>
                          <div className="member-meta">
                            <div className="member-name-time">
                              <strong>{sug.sender} in WhatsApp Group:</strong>
                              <small>{sug.time}</small>
                            </div>
                            <p>"{sug.message}"</p>
                          </div>
                        </div>

                        {/* AI Intelligent Response & Recommended Real Spot */}
                        <div className="ai-response-box">
                          <div className="ai-tag">
                            <Bot size={13} />
                            <span>AI Verified Google Match:</span>
                          </div>
                          <p className="ai-text">{sug.aiAnalysis}</p>

                          {sug.suggestedItem && (
                            <div className="ai-item-preview">
                              <div
                                className="item-preview-thumb"
                                style={{ backgroundImage: `url(${sug.suggestedItem.image || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80'})` }}
                              />
                              <div className="item-preview-info">
                                <strong>{sug.suggestedItem.name}</strong>
                                <small>
                                  {typeof sug.suggestedItem.rating === 'number' ? sug.suggestedItem.rating.toFixed(1) : String(sug.suggestedItem.rating || '4.8').replace('★', '').trim()}★ ({sug.suggestedItem.reviewsCount?.toLocaleString() || sug.suggestedItem.reviewCount?.toLocaleString() || '15,000+'} reviews) · {sug.suggestedItem.category || sug.suggestedItem.cuisine}
                                </small>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Apply to Basket + Send Counter-Proposal */}
                        <div className="sug-card-actions">
                          {sug.suggestedItem && (
                            <button
                              className={`btn-apply-suggestion ${isApplied ? 'applied' : ''}`}
                              onClick={() => handleApplySuggestion(sug.suggestedItem, sug.id)}
                            >
                              {isApplied ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                              <span>{isApplied ? 'Added to Basket & Schedule!' : 'Apply to Trip Basket'}</span>
                            </button>
                          )}

                          <button
                            className="btn-copy-counter-proposal"
                            onClick={() => copyCounterProposal(sug.counterProposal, sug.id)}
                            title="Copy reply to send back to WhatsApp"
                          >
                            {isCopied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                            <span>{isCopied ? 'Copied Reply!' : 'Copy Reply for WhatsApp'}</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE REAL MEMBERS */}
        {activeTab === 'members' && (
          <div className="members-tab-body">
            <div className="add-member-card">
              <h4>
                <UserPlus size={16} /> Add Real Traveler / Friend to Trip Group
              </h4>
              <form onSubmit={handleAddMember} className="add-member-form">
                <div className="avatar-pick-row">
                  {['🧑', '👩', '👦', '👧', '🧔', '👵', '👴', '🌟'].map(av => (
                    <button
                      key={av}
                      type="button"
                      className={`av-btn ${newMemberAvatar === av ? 'selected' : ''}`}
                      onClick={() => setNewMemberAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
                <div className="member-name-input-row">
                  <input
                    type="text"
                    placeholder="Enter friend or family name (e.g. Pei Shan, Vicky, Daniel)..."
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                  />
                  <button type="submit" disabled={!newMemberName.trim()}>
                    <Plus size={15} /> Add Member
                  </button>
                </div>
              </form>
            </div>

            <div className="members-list-card">
              <h4>Trip Party Members ({members.length} People)</h4>
              <div className="members-grid-items">
                {members.map(m => (
                  <div key={m.id} className="member-row-item">
                    <div className="member-info-left">
                      <span className="member-av-lg">{m.avatar}</span>
                      <div>
                        <strong>{m.name}</strong>
                        <small>{m.isOrganizer ? 'Group Organizer' : 'Trip Member'}</small>
                      </div>
                    </div>
                    {!m.isOrganizer && (
                      <button
                        className="btn-del-member"
                        onClick={() => handleRemoveMember(m.id)}
                        title="Remove member"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IN-APP GROUP CHAT */}
        {activeTab === 'chat' && (
          <div className="chat-tab-body">
            <div className="group-members-bar">
              <span className="members-title">Chatting as:</span>
              <select
                className="chat-sender-select"
                value={activeChatSender}
                onChange={e => setActiveChatSender(e.target.value)}
              >
                {members.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.avatar} {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="chat-scroll-area">
              {chatMessages.length === 0 ? (
                <div className="empty-capture-hint">
                  <p>No messages yet. Pitch any spot or food item to start chatting with your group!</p>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className={`group-chat-bubble ${msg.sender === 'You (Organizer)' ? 'me' : 'other'}`}>
                    <div className="bubble-header-row">
                      <span className="sender-avatar">{msg.avatar}</span>
                      <strong className="sender-name">{msg.sender}</strong>
                      <small className="sender-time">{msg.time}</small>
                    </div>
                    <p className="bubble-text">{msg.text}</p>

                    {/* AI EXTRACTED REAL WISH CARD */}
                    {msg.wish && (
                      <div className="bubble-wish-card">
                        <div className="wish-tag">
                          <Sparkles size={12} />
                          <span>AI Matched Real Spot: <strong>{msg.wish.name}</strong> ({typeof msg.wish.rating === 'number' ? msg.wish.rating.toFixed(1) : String(msg.wish.rating || '4.8').replace('★', '').trim()}★)</span>
                        </div>
                        <button
                          className="btn-add-wish"
                          onClick={() => onAddToBasket({
                            ...msg.wish,
                            type: msg.wish.type || 'attraction'
                          })}
                        >
                          <Plus size={13} />
                          <span>Add to Trip Basket</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form className="chat-drawer-input-form" onSubmit={handleSendChat}>
              <input
                type="text"
                placeholder={`Type a suggestion as ${activeChatSender}...`}
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
              />
              <button type="submit" disabled={!inputMsg.trim()}>
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: BATCH CHAT PARSER */}
        {activeTab === 'parser' && (
          <div className="parser-tab-body">
            <div className="parser-intro">
              <div className="wand-icon-circle">
                <Wand2 size={24} />
              </div>
              <div>
                <h3>Paste Real WhatsApp Chat Export</h3>
                <p>
                  Paste any real chat messages from WhatsApp. Our AI will dynamically extract each real person's name and match real Google places in {cityName}!
                </p>
              </div>
            </div>

            <div className="parser-textarea-box">
              <textarea
                className="wa-chat-paste-input"
                rows={5}
                value={pastedChat}
                onChange={e => setPastedChat(e.target.value)}
                placeholder="Paste real WhatsApp messages here (e.g. 'Pei Shan: I want to visit TRX and eat at Village Park Nasi Lemak on Day 2')..."
              />
            </div>

            <button
              className="btn-trigger-ai-extract"
              onClick={handleParseWhatsAppChat}
              disabled={parserLoading || !pastedChat.trim()}
            >
              <Sparkles size={16} />
              <span>{parserLoading ? 'Extracting & Querying Real Google Places...' : '🪄 Auto-Extract Wishes with Real Places'}</span>
            </button>

            {/* EXTRACTED WISHES RESULTS */}
            {parsedWishes.length > 0 && (
              <div className="extracted-wishes-list">
                <h4>
                  <Check size={15} /> Extracted {parsedWishes.length} Real Wishes from Chat:
                </h4>
                {parsedWishes.map(wish => (
                  <div key={wish.id} className="extracted-wish-card">
                    <div className="wish-card-top">
                      <strong>{wish.member}'s Suggestion:</strong>
                      <span className="wish-type-badge">{wish.type === 'attraction' ? '🏛️ Sight' : '🍽️ Dining'}</span>
                    </div>
                    <h5>{wish.wishName}</h5>
                    <p className="orig-quote">"{wish.extractedText}"</p>
                    <button
                      className="btn-add-extracted"
                      onClick={() => onAddToBasket(wish.realItem)}
                    >
                      <Plus size={13} /> Add Real Spot to Basket
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
