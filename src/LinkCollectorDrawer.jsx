import React, { useState } from 'react'
import {
  Link2, MessageSquare, Plus, Sparkles, Check, Trash2,
  ExternalLink, MapPin, Utensils, Coffee, Landmark, HelpCircle,
  Share2, ArrowRight, ShieldCheck, X, Compass, Copy
} from 'lucide-react'

export default function LinkCollectorDrawer({
  isOpen,
  onClose,
  destination,
  bucketList = [],
  onAddToBucket,
  onRemoveFromBucket,
  onOpenSmartRouteWizard
}) {
  if (!isOpen) return null

  const cityName = destination?.city || 'Ipoh'
  const countryName = destination?.country || 'Malaysia'

  const [inputTab, setInputTab] = useState('single') // 'single' | 'chat_paste'
  const [singleLink, setSingleLink] = useState('')
  const [placeNameInput, setPlaceNameInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('Cafe & Dining')
  const [suggestedByInput, setSuggestedByInput] = useState('You')
  const [chatLogText, setChatLogText] = useState('')
  const [parseStatus, setParseStatus] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Demo suggested members
  const squadMembers = ['You', 'Pei Shan', 'Marcus', 'Vicky', 'Alex', 'Sarah']

  // Handle single link or place addition
  const handleAddSingle = (e) => {
    e.preventDefault()
    const name = placeNameInput.trim() || extractNameFromUrl(singleLink) || `${cityName} Discovered Spot`
    if (!name) return

    const newItem = {
      id: `bucket-${Date.now()}`,
      name,
      title: name,
      category: categoryInput,
      type: categoryInput.includes('Dining') || categoryInput.includes('Cafe') ? 'restaurant' : 'attraction',
      suggestedBy: suggestedByInput,
      rating: 4.8,
      reviewsCount: 3400,
      link: singleLink.trim(),
      lat: (destination?.lat || 4.5975) + (Math.random() - 0.5) * 0.04,
      lng: (destination?.lng || 101.0734) + (Math.random() - 0.5) * 0.04,
      image: categoryInput.includes('Cafe')
        ? 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      isMustVisit: true,
      assignedDay: 'auto'
    }

    onAddToBucket(newItem)
    setPlaceNameInput('')
    setSingleLink('')
    setParseStatus(`✅ Added "${name}" into ${cityName} Bucket List!`)
    setTimeout(() => setParseStatus(null), 3000)
  }

  // Helper to extract a friendly name from Google Maps link
  function extractNameFromUrl(url) {
    if (!url) return ''
    try {
      if (url.includes('/place/')) {
        const part = url.split('/place/')[1]?.split('/')[0]?.split('?')[0]
        return decodeURIComponent(part.replace(/\+/g, ' '))
      }
    } catch (_e) {}
    return ''
  }

  // Parse raw WhatsApp / Group Chat multi-line text
  const handleParseChatLog = (e) => {
    e.preventDefault()
    if (!chatLogText.trim()) return

    const lines = chatLogText.split('\n').filter(l => l.trim().length > 0)
    const detectedItems = []

    lines.forEach((line, idx) => {
      // Regex check for Google Maps link or location keywords
      const hasLink = line.includes('maps.app.goo.gl') || line.includes('goo.gl/maps') || line.includes('google.com/maps')
      const hasRecommend = line.includes('eat') || line.includes('try') || line.includes('go') || line.includes('visit') || line.includes('must') || line.includes('cafe') || line.includes('food') || line.includes('restaurant')

      if (hasLink || hasRecommend || line.length > 5) {
        // Extract sender if standard "Name: text" format
        let sender = squadMembers[(idx + 1) % squadMembers.length]
        let content = line

        if (line.includes(':')) {
          const parts = line.split(':')
          if (parts[0].length < 25) {
            sender = parts[0].trim().replace(/\[.*?\]/g, '').replace(/.*?[AP]M\s+/i, '').trim() || sender
            content = parts.slice(1).join(':').trim()
          }
        }

        // Clean name
        const cleanName = content
          .replace(/https?:\/\/\S+/gi, '')
          .replace(/(we must go to|check out|how about|let's visit|want to try|must eat at)/gi, '')
          .trim() || `${cityName} Recommended Spot ${idx + 1}`

        const isCafe = cleanName.toLowerCase().includes('cafe') || cleanName.toLowerCase().includes('coffee') || cleanName.toLowerCase().includes('bakery') || cleanName.toLowerCase().includes('tea')
        const isFood = cleanName.toLowerCase().includes('food') || cleanName.toLowerCase().includes('restaurant') || cleanName.toLowerCase().includes('noodle') || cleanName.toLowerCase().includes('rice') || cleanName.toLowerCase().includes('bistro')

        detectedItems.push({
          id: `bucket-chat-${Date.now()}-${idx}`,
          name: cleanName.slice(0, 45),
          title: cleanName.slice(0, 45),
          category: isCafe ? 'Cafe & Bakery' : isFood ? 'Local Gastronomy' : 'Scenic & Heritage Landmark',
          type: isCafe || isFood ? 'restaurant' : 'attraction',
          suggestedBy: sender,
          rating: 4.8,
          reviewsCount: 4200,
          link: hasLink ? (line.match(/https?:\/\/\S+/gi)?.[0] || '') : '',
          lat: (destination?.lat || 4.5975) + (Math.random() - 0.5) * 0.04,
          lng: (destination?.lng || 101.0734) + (Math.random() - 0.5) * 0.04,
          image: isCafe
            ? 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          isMustVisit: true,
          assignedDay: 'auto'
        })
      }
    })

    if (detectedItems.length > 0) {
      detectedItems.forEach(item => onAddToBucket(item))
      setParseStatus(`✨ Extracted & collected ${detectedItems.length} spots from group chat into your Bucket List!`)
      setChatLogText('')
    }
  }

  // Pre-load popular sample spots from chat
  const handleLoadSampleChat = () => {
    const sample = `Marcus: Hey guys check out this spot https://maps.app.goo.gl/123 Concubine Lane Heritage Street!
Pei Shan: We have to eat at Restoran Fook Kee (Famous Fried Noodles & Moonlight Hor Fun) for dinner!
Vicky: Can we stop by Nam Heong White Coffee for breakfast egg tarts?
Alex: Don't forget Perak Cave Temple for the scenic limestone murals & mountain view!`
    setChatLogText(sample)
  }

  return (
    <div className="link-collector-backdrop" onClick={onClose}>
      <div className="link-collector-modal" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="collector-header-row">
          <div className="collector-title-group">
            <div className="collector-icon-badge">
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="collector-modal-title">Group Chat Link Collector</h2>
              <p className="collector-subtitle">
                Paste Google Maps links or chat conversations from WhatsApp/messaging apps to auto-collect places into {cityName}'s Bucket List.
              </p>
            </div>
          </div>
          <button className="collector-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* INPUT TABS */}
        <div className="collector-tab-switch">
          <button
            className={`collector-tab-btn ${inputTab === 'single' ? 'active' : ''}`}
            onClick={() => setInputTab('single')}
          >
            <Link2 size={15} /> Single Google Maps Link / Spot
          </button>
          <button
            className={`collector-tab-btn ${inputTab === 'chat_paste' ? 'active' : ''}`}
            onClick={() => setInputTab('chat_paste')}
          >
            <MessageSquare size={15} /> Paste Group Chat Transcript
          </button>
        </div>

        {/* BODY AREA */}
        <div className="collector-body-scroll">
          {/* TAB 1: SINGLE LINK */}
          {inputTab === 'single' && (
            <form onSubmit={handleAddSingle} className="collector-single-form">
              <div className="form-group-field">
                <label>Google Maps Link or Place URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://maps.app.goo.gl/xyz or https://goo.gl/maps/..."
                  value={singleLink}
                  onChange={e => {
                    setSingleLink(e.target.value)
                    const extracted = extractNameFromUrl(e.target.value)
                    if (extracted && !placeNameInput) setPlaceNameInput(extracted)
                  }}
                  className="collector-input"
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group-field">
                  <label>Place Name / Landmark</label>
                  <input
                    type="text"
                    placeholder={`e.g. Restoran Fook Kee, Concubine Lane...`}
                    value={placeNameInput}
                    onChange={e => setPlaceNameInput(e.target.value)}
                    required
                    className="collector-input"
                  />
                </div>

                <div className="form-group-field">
                  <label>Category</label>
                  <select
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    className="collector-select"
                  >
                    <option value="Cafe & Dining">☕ Cafe & Artisan Coffee</option>
                    <option value="Local Gastronomy">🍽️ Restaurant & Street Food</option>
                    <option value="Scenic & Heritage">🏛️ Heritage Landmark & Sights</option>
                    <option value="Nature & Viewpoint">🌿 Nature & Viewpoints</option>
                    <option value="Night Market">🏮 Night Market & Evening</option>
                  </select>
                </div>
              </div>

              <div className="form-group-field">
                <label>Suggested By (Squad Member)</label>
                <select
                  value={suggestedByInput}
                  onChange={e => setSuggestedByInput(e.target.value)}
                  className="collector-select"
                >
                  {squadMembers.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-collector-submit">
                <Plus size={16} /> Add to Trip Bucket List
              </button>
            </form>
          )}

          {/* TAB 2: CHAT TRANSCRIPT PASTE */}
          {inputTab === 'chat_paste' && (
            <form onSubmit={handleParseChatLog} className="collector-chat-form">
              <div className="chat-paste-header-row">
                <label>Paste WhatsApp / WeChat Chat Log</label>
                <button
                  type="button"
                  className="btn-load-sample"
                  onClick={handleLoadSampleChat}
                >
                  ⚡ Load Sample {cityName} Chat
                </button>
              </div>

              <textarea
                rows={5}
                placeholder="Paste group messages here with links, restaurant names, and food wishes..."
                value={chatLogText}
                onChange={e => setChatLogText(e.target.value)}
                className="collector-textarea"
              />

              <button type="submit" className="btn-collector-submit">
                <Sparkles size={16} /> Auto-Extract Places into Bucket List
              </button>
            </form>
          )}

          {/* STATUS BANNER */}
          {parseStatus && (
            <div className="collector-status-alert">
              <ShieldCheck size={16} />
              <span>{parseStatus}</span>
            </div>
          )}

          {/* CURRENT BUCKET LIST PREVIEW */}
          <div className="collector-bucket-section">
            <div className="bucket-section-header">
              <h3>
                🎯 Current Wishlist / Bucket List ({bucketList.length} spots)
              </h3>
              {bucketList.length > 0 && (
                <button
                  className="btn-trigger-smart-route"
                  onClick={() => {
                    onClose()
                    onOpenSmartRouteWizard()
                  }}
                >
                  <Sparkles size={15} /> ⚡ Generate Smart Route
                </button>
              )}
            </div>

            {bucketList.length === 0 ? (
              <div className="bucket-empty-state">
                <MapPin size={28} className="text-muted" />
                <p>No places collected yet. Paste a link or chat message above to begin collecting!</p>
              </div>
            ) : (
              <div className="bucket-items-grid">
                {bucketList.map(item => (
                  <div key={item.id} className="bucket-item-card">
                    <div className="bucket-card-thumb" style={{ backgroundImage: `url(${item.image})` }} />
                    <div className="bucket-card-info">
                      <div className="bucket-name-row">
                        <strong>{item.name}</strong>
                        <button
                          className="btn-remove-bucket"
                          onClick={() => onRemoveFromBucket(item.id)}
                          title="Remove from bucket list"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="bucket-meta-row">
                        <span className="bucket-cat-pill">{item.category}</span>
                        {item.suggestedBy && (
                          <span className="bucket-suggester-tag">
                            👤 {item.suggestedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="collector-footer-row">
          <button className="btn-secondary-close" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary-generate"
            disabled={bucketList.length === 0}
            onClick={() => {
              onClose()
              onOpenSmartRouteWizard()
            }}
          >
            <Sparkles size={16} /> ⚡ Generate Smart Route ({bucketList.length} Places)
          </button>
        </div>
      </div>
    </div>
  )
}
