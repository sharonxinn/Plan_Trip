import React, { useState } from 'react'
import {
  Users, Vote, MessageCircle, Sparkles, Share2, Check,
  ThumbsUp, ThumbsDown, Heart, Plus, UserPlus, Send, Bot,
  ArrowRight, ArrowLeft, ShieldCheck, Zap, Copy, ExternalLink
} from 'lucide-react'

export default function StepGroupRoom({
  destination,
  travellers,
  travelParty,
  members = [],
  setMembers,
  basket = [],
  onAddToBasket,
  onNextStep,
  onPrevStep
}) {
  const cityName = destination?.city || 'Kuala Lumpur'
  const countryName = destination?.country || 'Malaysia'

  const [activeTab, setActiveTab] = useState('voting') // 'voting' | 'mediator' | 'whatsapp-sync'
  const [copiedLink, setCopiedLink] = useState(false)
  
  // Real destination voting candidates
  const [votes, setVotes] = useState({})

  React.useEffect(() => {
    const initial = {}
    const pool = (basket.length > 0 ? basket : destination?.attractions || []).slice(0, 5)
    pool.forEach((item, idx) => {
      const name = item.name || item.title || `${cityName} Hallmark Spot`
      const upCount = Math.max(1, members.length - (idx % 2))
      initial[name] = {
        up: upCount,
        down: idx === 3 ? 1 : 0,
        votedBy: members.slice(0, upCount).map(m => m.name)
      }
    })
    setVotes(initial)
  }, [destination, cityName, basket.length, members.length])

  // AI Dispute Mediator state
  const [debatePrompt, setDebatePrompt] = useState('')
  const [debateSolutions, setDebateSolutions] = useState([
    {
      id: 'd-1',
      question: 'Pei Shan wants a relaxing beach/cafe afternoon, but Marcus wants an adrenaline outdoor hike.',
      solution: '✨ AI Compromise Plan: Morning 09:00 - Marcus hikes the scenic Canopy Walk at KL Forest Eco Park while Pei Shan enjoys artisanal coffee at the base cafe. At 12:30 PM, meet for a scenic lakeside lunch at Tamarind Springs together! Zero drama.',
      agreed: true
    },
    {
      id: 'd-2',
      question: 'Vicky is strictly vegetarian, but everyone else wants famous local street satay & seafood.',
      solution: '✨ AI Compromise Plan: Dine at Hutong Lot 10 Food Court or Central Market Gourmet Arcade—featuring both Michelin-acclaimed satay grills and premier Buddhist vegetarian claypot stalls under one air-conditioned roof.',
      agreed: true
    }
  ])
  const [mediatorLoading, setMediatorLoading] = useState(false)

  // WhatsApp Pasted Chat Parser state
  const [pastedChat, setPastedChat] = useState('')
  const [extractedWishes, setExtractedWishes] = useState([])
  const [parserLoading, setParserLoading] = useState(false)

  // Cast vote on activity
  const handleVote = (title, type) => {
    setVotes(prev => {
      const current = prev[title] || { up: 0, down: 0, votedBy: [] }
      const hasUp = type === 'up'
      return {
        ...prev,
        [title]: {
          up: hasUp ? current.up + 1 : current.up,
          down: !hasUp ? current.down + 1 : current.down,
          votedBy: [...current.votedBy, 'You']
        }
      }
    })
  }

  // Settle Custom Debate with AI
  const handleSettleDebate = e => {
    e.preventDefault()
    if (!debatePrompt.trim()) return
    setMediatorLoading(true)
    setTimeout(() => {
      const newSol = {
        id: `d-${Date.now()}`,
        question: debatePrompt.trim(),
        solution: `✨ AI Compromise Plan for "${debatePrompt.trim()}": We suggest a 50/50 split day. Start with the priority activity in the morning (10:00 - 13:00), followed by the alternative activity at sunset (17:00 - 19:30) with a shared dining venue that satisfies all dietary preferences.`,
        agreed: false
      }
      setDebateSolutions([newSol, ...debateSolutions])
      setDebatePrompt('')
      setMediatorLoading(false)
    }, 700)
  }

  // Parse WhatsApp Chat Log
  const handleParseChat = () => {
    if (!pastedChat.trim()) return
    setParserLoading(true)
    setTimeout(() => {
      const detected = [
        { sender: 'Pei Shan', wish: 'Must visit a good cafe with matcha or pastries', type: 'Dining' },
        { sender: 'Marcus', wish: 'Wants to see the skyline view at night', type: 'Attraction' },
        { sender: 'Vicky', wish: 'Avoid spicy food for lunch on Day 2', type: 'Dietary' }
      ]
      setExtractedWishes(detected)
      setParserLoading(false)
    }, 800)
  }

  // Copy Squad Room Invite Link
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`https://plantrip.app/join?trip=${cityName.toLowerCase()}&room=squad-${Date.now().toString().slice(-4)}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  return (
    <div className="step-group-container fade-in">
      {/* Hero Header */}
      <div className="step-hero-card">
        <div className="step-badge-row">
          <span className="step-pill-number">Step 5 of 6</span>
          <span className="step-pill-tag">👥 Group Collaboration Room</span>
          <span className="step-mode-pill group">{members.length} Squad Members Synced</span>
        </div>

        <h1 className="step-main-title">
          Collaborate & Sync Without the Group Chat Chaos
        </h1>
        <p className="step-subtitle">
          Vote on must-see places in real-time, resolve group disagreements with our AI Travel Mediator, and extract wishlist spots directly from your WhatsApp conversations.
        </p>

        {/* Sub Tab Navigation */}
        <div className="budget-top-controls-row">
          <div className="sub-tab-group">
            <button
              className={`sub-tab-btn ${activeTab === 'voting' ? 'active' : ''}`}
              onClick={() => setActiveTab('voting')}
            >
              <Vote size={16} />
              1. Squad Activity Voting ({Object.keys(votes).length})
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'mediator' ? 'active' : ''}`}
              onClick={() => setActiveTab('mediator')}
            >
              <Bot size={16} />
              2. AI Dispute Mediator
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'whatsapp-sync' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp-sync')}
            >
              <MessageCircle size={16} />
              3. WhatsApp Chat Log Parser
            </button>
          </div>

          <button className="invite-squad-btn" onClick={handleCopyInvite}>
            {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
            {copiedLink ? 'Invite Link Copied!' : 'Invite Friends (+ Link)'}
          </button>
        </div>
      </div>

      {/* TAB 1: SQUAD ACTIVITY VOTING */}
      {activeTab === 'voting' && (
        <div className="group-voting-grid">
          {/* Left Column: Place Voting Arena */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Vote className="text-cyan" size={20} />
                <h3>Vote on Shortlisted Attractions & Dining</h3>
              </div>
              <span className="badge-highlight">Live Squad Consensus</span>
            </div>

            <div className="voting-items-list">
              {Object.keys(votes).map(placeTitle => {
                const vote = votes[placeTitle]
                const totalVotes = vote.up + vote.down
                const approvalPct = totalVotes > 0 ? Math.round((vote.up / totalVotes) * 100) : 100
                const isFavorite = approvalPct >= 80

                return (
                  <div key={placeTitle} className="voting-card-tile">
                    <div className="voting-info">
                      <div className="vote-title-row">
                        <strong className="place-vote-title">{placeTitle}</strong>
                        {isFavorite && (
                          <span className="favorite-squad-badge">
                            🔥 {approvalPct}% Squad Favorite
                          </span>
                        )}
                      </div>
                      <div className="vote-meta-text">
                        Voted by: {vote.votedBy.join(', ') || 'Pending votes'}
                      </div>
                    </div>

                    <div className="voting-actions-col">
                      <div className="vote-buttons-row">
                        <button
                          className="vote-action-btn up"
                          onClick={() => handleVote(placeTitle, 'up')}
                          title="Vote Yes"
                        >
                          <ThumbsUp size={15} />
                          <span>{vote.up}</span>
                        </button>
                        <button
                          className="vote-action-btn down"
                          onClick={() => handleVote(placeTitle, 'down')}
                          title="Vote No"
                        >
                          <ThumbsDown size={15} />
                          <span>{vote.down}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Squad Roster & Sync Status */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Users className="text-cyan" size={20} />
                <h3>Squad Members Online ({members.length})</h3>
              </div>
              <span className="badge-highlight">100% Synced</span>
            </div>

            <div className="squad-roster-list">
              {members.map((m, idx) => (
                <div key={m.id || idx} className="squad-member-row">
                  <span className="squad-avatar">{m.avatar || '🧑'}</span>
                  <div className="squad-info">
                    <div className="squad-name-line">
                      <strong>{m.name}</strong>
                      {idx === 0 && <span className="organizer-tag">Host</span>}
                    </div>
                    <span className="squad-vibe-sub">Active in voting · Vibe synced</span>
                  </div>
                  <span className="online-dot-badge">● Online</span>
                </div>
              ))}
            </div>

            <div className="voting-consensus-tip">
              <ShieldCheck size={18} className="text-emerald" />
              <p>
                <strong>Zero Regret Guarantee:</strong> Any activity with over 75% squad approval is automatically scheduled into the prime morning/afternoon itinerary slots.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI DISPUTE MEDIATOR */}
      {activeTab === 'mediator' && (
        <div className="group-mediator-grid">
          {/* Left: Active Compromises */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Bot className="text-cyan" size={20} />
                <h3>AI Dispute Compromise Solutions</h3>
              </div>
              <span className="badge-highlight">Zero Drama Engine</span>
            </div>

            <div className="dispute-solutions-list">
              {debateSolutions.map(deb => (
                <div key={deb.id} className="dispute-card-tile">
                  <div className="dispute-question-row">
                    <span className="debate-icon">⚖️</span>
                    <strong>{deb.question}</strong>
                  </div>
                  <div className="dispute-answer-box">
                    <p>{deb.solution}</p>
                  </div>
                  <div className="dispute-status-row">
                    <span className="agreed-tag">
                      <Check size={12} /> Squad Agreed & Scheduled
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Settle New Debate Form */}
            <form onSubmit={handleSettleDebate} className="new-debate-form">
              <h4>🤖 Have a Group Disagreement? Let AI Settle It:</h4>
              <div className="debate-input-row">
                <input
                  type="text"
                  placeholder="e.g. Marcus wants late night bar, Pei Shan wants sunrise hike, how to balance?"
                  value={debatePrompt}
                  onChange={e => setDebatePrompt(e.target.value)}
                  className="debate-input"
                />
                <button type="submit" className="debate-submit-btn" disabled={mediatorLoading}>
                  {mediatorLoading ? 'Mediating...' : 'Settle Debate'}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Why AI Mediation Works */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Sparkles className="text-cyan" size={20} />
                <h3>Why Group Trips Love PlanTrip</h3>
              </div>
            </div>
            <div className="mediator-tips-list">
              <div className="mediator-tip-item">
                <div className="tip-icon">🤝</div>
                <div className="tip-text">
                  <strong>Balanced Itinerary Distribution:</strong> Alternates between high-energy activities and relaxing cafe breaks so both introverts and extroverts stay happy.
                </div>
              </div>
              <div className="mediator-tip-item">
                <div className="tip-icon">🍱</div>
                <div className="tip-text">
                  <strong>Inclusive Multi-Vendor Food Centers:</strong> Recommends top dining venues where meat-lovers and strict vegetarians can sit together without compromising taste.
                </div>
              </div>
              <div className="mediator-tip-item">
                <div className="tip-icon">💰</div>
                <div className="tip-text">
                  <strong>Fair Split & Transparency:</strong> Eliminates awkward payment discussions with real-time math and minimal transfer settlement.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP CHAT PARSER */}
      {activeTab === 'whatsapp-sync' && (
        <div className="setup-card whatsapp-sync-card">
          <div className="card-header-row">
            <div className="card-icon-title">
              <MessageCircle className="text-cyan" size={20} />
              <h3>Import Wishlist from WhatsApp Group Chat</h3>
            </div>
            <span className="badge-highlight">AI Text Extractor</span>
          </div>

          <p className="section-note">
            Copy and paste your messy WhatsApp conversation with friends. Our AI instantly extracts who wants to eat what, where everyone wants to visit, and any dietary restrictions!
          </p>

          <div className="whatsapp-parser-box">
            <textarea
              placeholder="Paste WhatsApp messages here, e.g.:
[10:15 AM] Pei Shan: Can we please go to that viral cafe in KL?
[10:18 AM] Marcus: I want to see the Petronas towers at night!
[10:20 AM] Vicky: Remember I can't eat beef or seafood."
              value={pastedChat}
              onChange={e => setPastedChat(e.target.value)}
              className="chat-paste-area"
              rows={4}
            />
            <button
              className="parse-chat-btn"
              onClick={handleParseChat}
              disabled={parserLoading || !pastedChat.trim()}
            >
              {parserLoading ? 'Extracting Wishes...' : '⚡ Extract Travel Wishes & Sync'}
            </button>
          </div>

          {/* Extracted Wishes */}
          {extractedWishes.length > 0 && (
            <div className="extracted-wishes-container">
              <h4>🎯 Extracted Squad Wishes ({extractedWishes.length}):</h4>
              <div className="wishes-list">
                {extractedWishes.map((w, idx) => (
                  <div key={idx} className="wish-tile">
                    <span className="wish-sender">👤 {w.sender}:</span>
                    <span className="wish-text">"{w.wish}"</span>
                    <span className="wish-type-badge">{w.type}</span>
                    <button className="add-wish-btn" onClick={() => alert(`Added "${w.wish}" to itinerary shortlist!`)}>
                      + Add to Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Step Actions */}
      <div className="step-bottom-bar">
        <button className="step-back-btn" onClick={onPrevStep}>
          <ArrowLeft size={18} /> Back to Step 4: Plan B Studio
        </button>
        <div className="step-summary-text">
          Squad Status: <strong>{members.length} Members</strong> · Consensus High
        </div>
        <button className="step-next-primary-btn" onClick={onNextStep}>
          Proceed to Step 6: Pack & Export <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
