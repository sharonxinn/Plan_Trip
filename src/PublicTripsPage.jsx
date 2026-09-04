import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ArrowLeft, Users, MapPin, Calendar, Wallet, Plus, Minus, X, Check,
  Compass, Utensils, ThumbsUp, Crown, Lock, Unlock, LogOut, RefreshCw,
  Share2, Sparkles, DoorOpen, Receipt
} from 'lucide-react'

const AVATAR_CHOICES = ['🧭', '🌊', '🏔️', '🎒', '🍜', '📸', '🛺', '🗺️', '🌅', '🎡', '🏝️', '⛺']
const CURRENCIES = ['MYR', 'SGD', 'USD', 'EUR', 'THB', 'JPY']
const IDENTITY_KEY = 'plantrip_traveller'
const MEMBERSHIP_KEY = 'plantrip_memberships'

const MALAYSIA_CITIES = [
  { city: 'Kuala Lumpur', state: 'Federal Territory', tag: 'Capital & Skyline' },
  { city: 'Penang (George Town)', state: 'Penang', tag: 'UNESCO Heritage & Food' },
  { city: 'Langkawi Island', state: 'Kedah', tag: 'Duty-Free Islands & Geoforest' },
  { city: 'Melaka (Malacca)', state: 'Melaka', tag: 'UNESCO Colonial Heritage' },
  { city: 'Kota Kinabalu', state: 'Sabah (Borneo)', tag: 'Mount Kinabalu & Tropical Seas' },
  { city: 'Semporna & Sipadan Islands', state: 'Sabah (Borneo)', tag: 'Diving & Floating Villas' },
  { city: 'Ipoh', state: 'Perak', tag: 'Limestone Temples & Coffee' },
  { city: 'Cameron Highlands', state: 'Pahang', tag: 'Tea Plantations & Strawberry' },
  { city: 'Genting Highlands', state: 'Pahang', tag: 'Theme Parks & Skyworlds' },
  { city: 'Kuching', state: 'Sarawak (Borneo)', tag: 'Orangutans & Gastronomy' },
  { city: 'Redang & Perhentian Islands', state: 'Terengganu', tag: 'Crystal Turquoise Waters' },
  { city: 'Johor Bahru & Desaru Coast', state: 'Johor', tag: 'Legoland & Luxury Coast' }
]

const BUDGET_PRESETS = [
  { id: 'budget', label: 'Budget ($)', amount: 1800, desc: 'Hostels, public transit, street food' },
  { id: 'balanced', label: 'Balanced ($$)', amount: 3800, desc: '3-4★ hotels, mixed dining, top sights' },
  { id: 'premium', label: 'Premium ($$$)', amount: 7200, desc: '4-5★ boutique stays, fine dining' },
  { id: 'luxury', label: 'Luxury ($$$$)', amount: 14000, desc: '5★ luxury resorts, Michelin dining' }
]

const VIBE_OPTIONS = [
  'Local Food', 'Heritage & Culture', 'Nature & Views',
  'Thrills & Theme Parks', 'Markets & Malls', 'Chill & Cafes',
  'Halal Friendly', 'Vegetarian', 'Gluten Free'
]

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const fmtDate = d => {
  if (!d) return 'Dates TBD'
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}
const fmtRange = (a, b) => {
  if (!a && !b) return 'Dates flexible'
  if (a && b) return `${fmtDate(a)} – ${fmtDate(b)}`
  return fmtDate(a || b)
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error || `Request failed (${res.status})`)
  return payload
}

export default function PublicTripsPage({ onBack, defaultCity, defaultCountry, defaultDeparture, defaultReturn }) {
  const [identity, setIdentity] = useState(() => readJSON(IDENTITY_KEY, { name: '', avatar: AVATAR_CHOICES[0] }))
  const [memberships, setMemberships] = useState(() => readJSON(MEMBERSHIP_KEY, {}))

  const [view, setView] = useState('board') // 'board' | 'room'
  const [activeTripId, setActiveTripId] = useState(null)

  const [trips, setTrips] = useState([])
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const saveIdentity = next => {
    setIdentity(next)
    writeJSON(IDENTITY_KEY, next)
  }
  const saveMembership = (tripId, info) => {
    setMemberships(prev => {
      const next = { ...prev, [tripId]: info }
      writeJSON(MEMBERSHIP_KEY, next)
      return next
    })
  }
  const dropMembership = tripId => {
    setMemberships(prev => {
      const next = { ...prev }
      delete next[tripId]
      writeJSON(MEMBERSHIP_KEY, next)
      return next
    })
  }

  const myMemberId = activeTripId ? memberships[activeTripId]?.memberId : null

  // ---- Board polling ----
  const loadBoard = useCallback(async () => {
    try {
      const { data } = await api('/api/public-trips')
      setTrips(data || [])
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view !== 'board') return
    loadBoard()
    const t = setInterval(loadBoard, 6000)
    return () => clearInterval(t)
  }, [view, loadBoard])

  // ---- Room polling ----
  const loadRoom = useCallback(async id => {
    try {
      const { data } = await api(`/api/public-trips/${id}`)
      if (!data) {
        setError('This trip was closed by the host.')
        dropMembership(id)
        setView('board')
        setActiveTripId(null)
        return
      }
      setRoom(data)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (view !== 'room' || !activeTripId) return
    loadRoom(activeTripId)
    const t = setInterval(() => loadRoom(activeTripId), 4000)
    return () => clearInterval(t)
  }, [view, activeTripId, loadRoom])

  const enterRoom = id => {
    setRoom(null)
    setActiveTripId(id)
    setView('room')
  }

  // ---- Actions ----
  const handleCreate = async form => {
    if (!identity.name.trim()) {
      setError('Add your traveller name first (top right).')
      return
    }
    setBusy(true)
    try {
      const { data, youAre } = await api('/api/public-trips', {
        method: 'POST',
        body: { ...form, hostName: identity.name.trim(), hostAvatar: identity.avatar }
      })
      saveMembership(data.id, { memberId: youAre.id, isHost: true })
      setShowCreate(false)
      enterRoom(data.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleJoin = async tripId => {
    if (!identity.name.trim()) {
      setError('Add your traveller name before joining (top right).')
      return
    }
    setBusy(true)
    try {
      const { data, youAre } = await api(`/api/public-trips/${tripId}/join`, {
        method: 'POST',
        body: { name: identity.name.trim(), avatar: identity.avatar, memberId: memberships[tripId]?.memberId }
      })
      saveMembership(data.id, { memberId: youAre.id, isHost: youAre.isHost })
      enterRoom(data.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleLeave = async () => {
    if (!room || !myMemberId) return
    if (!confirm('Leave this trip? You can rejoin while a seat is open.')) return
    setBusy(true)
    try {
      await api(`/api/public-trips/${room.id}/leave`, { method: 'POST', body: { memberId: myMemberId } })
      dropMembership(room.id)
      setView('board')
      setActiveTripId(null)
      setRoom(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handlePropose = async proposal => {
    if (!room || !myMemberId) return
    setBusy(true)
    try {
      const { data } = await api(`/api/public-trips/${room.id}/proposals`, {
        method: 'POST',
        body: { ...proposal, memberId: myMemberId }
      })
      setRoom(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleVote = async pid => {
    if (!room || !myMemberId) return
    try {
      const { data } = await api(`/api/public-trips/${room.id}/proposals/${pid}/vote`, {
        method: 'POST',
        body: { memberId: myMemberId }
      })
      setRoom(data)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleRemoveProposal = async pid => {
    if (!room || !myMemberId) return
    try {
      const { data } = await api(`/api/public-trips/${room.id}/proposals/${pid}`, {
        method: 'DELETE',
        body: { memberId: myMemberId }
      })
      setRoom(data)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleAddExpense = async expense => {
    if (!room || !myMemberId) return
    setBusy(true)
    try {
      const { data } = await api(`/api/public-trips/${room.id}/expenses`, {
        method: 'POST',
        body: { ...expense, memberId: myMemberId }
      })
      setRoom(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleRemoveExpense = async eid => {
    if (!room || !myMemberId) return
    try {
      const { data } = await api(`/api/public-trips/${room.id}/expenses/${eid}`, {
        method: 'DELETE',
        body: { memberId: myMemberId }
      })
      setRoom(data)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleLock = async reopen => {
    if (!room || !myMemberId) return
    setBusy(true)
    try {
      const { data } = await api(`/api/public-trips/${room.id}/lock`, {
        method: 'POST',
        body: { memberId: myMemberId, reopen }
      })
      setRoom(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pubtrip-wrap fade-in">
      <PubTripStyles />

      <div className="pubtrip-container">
        <div className="pubtrip-topbar">
          <button className="pt-back" onClick={view === 'room' ? () => { setView('board'); setActiveTripId(null) } : onBack}>
            <ArrowLeft size={16} />
            <span>{view === 'room' ? 'All open trips' : 'Back to Dashboard'}</span>
          </button>
          <IdentityChip identity={identity} onSave={saveIdentity} />
        </div>

        {error && (
          <div className="pt-error">
            <X size={14} onClick={() => setError('')} style={{ cursor: 'pointer' }} />
            <span>{error}</span>
          </div>
        )}

        {view === 'board' && (
          <BoardView
            trips={trips}
            loading={loading}
            busy={busy}
            memberships={memberships}
            identity={identity}
            showCreate={showCreate}
            setShowCreate={setShowCreate}
            onCreate={handleCreate}
            onJoin={handleJoin}
            onEnter={enterRoom}
            onRefresh={loadBoard}
            defaults={{ defaultCity, defaultCountry, defaultDeparture, defaultReturn }}
          />
        )}

        {view === 'room' && (
          <RoomView
            room={room}
            myMemberId={myMemberId}
            busy={busy}
            onPropose={handlePropose}
            onVote={handleVote}
            onRemoveProposal={handleRemoveProposal}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
            onLeave={handleLeave}
            onLock={handleLock}
            onJoin={() => handleJoin(activeTripId)}
            isMember={Boolean(myMemberId && room?.members?.some(m => m.id === myMemberId))}
          />
        )}
      </div>
    </div>
  )
}

/* ---------------- Identity ---------------- */
function IdentityChip({ identity, onSave }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(identity.name)
  const [avatar, setAvatar] = useState(identity.avatar)

  useEffect(() => { setName(identity.name); setAvatar(identity.avatar) }, [identity])

  return (
    <div className="pt-identity">
      <button className="pt-identity-btn" onClick={() => setOpen(o => !o)}>
        <span className="pt-avatar">{identity.avatar}</span>
        <span>{identity.name || 'Set your name'}</span>
      </button>
      {open && (
        <div className="pt-identity-pop">
          <label className="pt-label">Your traveller name</label>
          <input
            className="pt-input"
            value={name}
            maxLength={24}
            placeholder="e.g. Sam from Penang"
            onChange={e => setName(e.target.value)}
          />
          <label className="pt-label">Pick an avatar</label>
          <div className="pt-avatar-grid">
            {AVATAR_CHOICES.map(a => (
              <button
                key={a}
                className={`pt-avatar-opt ${avatar === a ? 'is-active' : ''}`}
                onClick={() => setAvatar(a)}
              >{a}</button>
            ))}
          </div>
          <button
            className="pt-btn pt-btn-primary pt-full"
            onClick={() => { onSave({ name: name.trim(), avatar }); setOpen(false) }}
          >
            <Check size={14} /> Save
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------------- Board ---------------- */
function BoardView({ trips, loading, busy, memberships, identity, showCreate, setShowCreate, onCreate, onJoin, onEnter, onRefresh, defaults }) {
  return (
    <>
      <div className="pt-hero">
        <div className="pt-hero-icon"><DoorOpen size={22} /></div>
        <div>
          <h1>Open Trips & Travel with Strangers</h1>
          <p>Host a public room with your destination cards, budget tiers, and vibe selectors. Let strangers join, vote on stops, and split shared expenses.</p>
        </div>
        <button className="pt-btn pt-btn-primary" disabled={busy} onClick={() => setShowCreate(v => !v)}>
          <Plus size={15} /> Host a trip
        </button>
      </div>

      {showCreate && (
        <CreateForm
          busy={busy}
          disabled={!identity.name.trim()}
          onCancel={() => setShowCreate(false)}
          onSubmit={onCreate}
          defaults={defaults}
        />
      )}

      <div className="pt-board-head">
        <h2>{trips.length} open {trips.length === 1 ? 'trip' : 'trips'} available</h2>
        <button className="pt-btn pt-btn-ghost pt-sm" onClick={onRefresh}><RefreshCw size={13} /> Refresh</button>
      </div>

      {loading ? (
        <div className="pt-empty">Loading open trips…</div>
      ) : trips.length === 0 ? (
        <div className="pt-empty">
          <Sparkles size={20} />
          <p>No open trips yet. Be the first host — pick your destination city, budget tier, and vibe!</p>
        </div>
      ) : (
        <div className="pt-grid">
          {trips.map(t => {
            const mine = memberships[t.id]?.memberId && t.members.some(m => m.id === memberships[t.id].memberId)
            return (
              <div key={t.id} className="pt-card">
                <div className="pt-card-top">
                  <span className={`pt-status pt-status-${t.status}`}>{t.status}</span>
                  <span className="pt-code" title="Join code">#{t.code}</span>
                </div>
                <h3>{t.title}</h3>
                <div className="pt-meta"><MapPin size={13} /> {t.destinationCity}, {t.destinationCountry}</div>
                <div className="pt-meta"><Calendar size={13} /> {fmtRange(t.departureDate, t.returnDate)}</div>
                <div className="pt-meta"><Wallet size={13} /> {t.currency} {t.budgetTotal.toLocaleString()} ({t.budgetTier || 'Balanced'})</div>
                {t.vibe && <div className="pt-vibe">{t.vibe}</div>}
                <div className="pt-card-people">
                  <div className="pt-avatars">
                    {t.members.slice(0, 6).map(m => <span key={m.id} className="pt-avatar sm" title={m.name}>{m.avatar}</span>)}
                  </div>
                  <span className="pt-pax">
                    {t.members.length}/{t.maxPax} joined · min {t.minPax}
                  </span>
                </div>
                <div className="pt-card-actions">
                  {mine ? (
                    <button className="pt-btn pt-btn-primary pt-full" onClick={() => onEnter(t.id)}>Enter room</button>
                  ) : t.status === 'open' ? (
                    <button className="pt-btn pt-btn-primary pt-full" disabled={busy || !identity.name.trim()} onClick={() => onJoin(t.id)}>
                      <Users size={14} /> Join this trip
                    </button>
                  ) : (
                    <button className="pt-btn pt-btn-ghost pt-full" disabled>{t.status === 'full' ? 'Trip full' : 'Locked by host'}</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {!identity.name.trim() && (
        <p className="pt-hint">Set your traveller name (top right) to host or join.</p>
      )}
    </>
  )
}

function Stepper({ label, value, min, max, onChange }) {
  return (
    <div className="pt-field">
      <label className="pt-label">{label}</label>
      <div className="pt-stepper">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}><Minus size={14} /></button>
        <span>{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}><Plus size={14} /></button>
      </div>
    </div>
  )
}

function CreateForm({ busy, disabled, onCancel, onSubmit, defaults }) {
  const [selectedCityObj, setSelectedCityObj] = useState(() => {
    return MALAYSIA_CITIES.find(c => c.city === defaults.defaultCity) || MALAYSIA_CITIES[0]
  })
  const [title, setTitle] = useState(`${selectedCityObj.city} Weekend Squad Trip`)
  const [dep, setDep] = useState(defaults.defaultDeparture || '2026-09-15')
  const [ret, setRet] = useState(defaults.defaultReturn || '2026-09-18')
  const [minPax, setMinPax] = useState(2)
  const [maxPax, setMaxPax] = useState(6)

  // Budget Tier Selector state matching original
  const [selectedBudgetPreset, setSelectedBudgetPreset] = useState(BUDGET_PRESETS[1]) // Balanced
  const [currency, setCurrency] = useState('MYR')

  // Selected Vibe Tags
  const [selectedVibes, setSelectedVibes] = useState(['Local Food', 'Heritage & Culture', 'Halal Friendly'])

  const toggleVibeTag = vibe => {
    setSelectedVibes(prev =>
      prev.includes(v) ? prev.filter(x => x !== vibe) : [...prev, vibe]
    )
  }

  const handleCitySelect = cityObj => {
    setSelectedCityObj(cityObj)
    setTitle(`${cityObj.city} Weekend Squad Trip`)
  }

  const handlePresetSelect = preset => {
    setSelectedBudgetPreset(preset)
  }

  const submit = e => {
    e.preventDefault()
    onSubmit({
      title: title.trim() || `${selectedCityObj.city} Trip`,
      destinationCity: selectedCityObj.city,
      destinationCountry: 'Malaysia',
      departureDate: dep,
      returnDate: ret,
      minPax,
      maxPax: Math.max(minPax, maxPax),
      budgetTotal: selectedBudgetPreset.amount,
      budgetTier: selectedBudgetPreset.id,
      currency,
      vibe: selectedVibes.join(', ')
    })
  }

  return (
    <form className="pt-create" onSubmit={submit}>
      <h3>Host a new open trip (Stranger Group Planning)</h3>

      <div className="pt-field">
        <label className="pt-label">Trip title</label>
        <input className="pt-input" value={title} maxLength={60} required onChange={e => setTitle(e.target.value)} />
      </div>

      {/* 1. SELECT DESTINATION (ORIGINAL CARDS) */}
      <div className="pt-field">
        <label className="pt-label">1. Choose Destination City in Malaysia</label>
        <div className="pt-city-grid">
          {MALAYSIA_CITIES.map(c => {
            const isSel = selectedCityObj.city === c.city
            return (
              <button
                type="button"
                key={c.city}
                className={`pt-city-card ${isSel ? 'is-active' : ''}`}
                onClick={() => handleCitySelect(c)}
              >
                <div className="pt-city-tag">{c.tag}</div>
                <div className="pt-city-name">{c.city}</div>
                <div className="pt-city-state">{c.state}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-row">
        <div className="pt-field">
          <label className="pt-label">Start date</label>
          <input type="date" className="pt-input" value={dep} onChange={e => setDep(e.target.value)} />
        </div>
        <div className="pt-field">
          <label className="pt-label">End date</label>
          <input type="date" className="pt-input" value={ret} onChange={e => setRet(e.target.value)} />
        </div>
      </div>

      <div className="pt-row">
        <Stepper label="Min pax" value={minPax} min={2} max={20} onChange={setMinPax} />
        <Stepper label="Max pax" value={maxPax} min={minPax} max={20} onChange={setMaxPax} />
      </div>

      {/* 2. CHOOSE BUDGET TIER (ORIGINAL TIERS) */}
      <div className="pt-field">
        <label className="pt-label">2. Trip Budget Tier (Per Person Target)</label>
        <div className="pt-budget-grid">
          {BUDGET_PRESETS.map(p => {
            const isSel = selectedBudgetPreset.id === p.id
            return (
              <button
                type="button"
                key={p.id}
                className={`pt-budget-card ${isSel ? 'is-active' : ''}`}
                onClick={() => handlePresetSelect(p)}
              >
                <div className="pt-b-top">
                  <strong>{p.label}</strong>
                  <span>MYR {p.amount.toLocaleString()}</span>
                </div>
                <div className="pt-b-desc">{p.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-row">
        <div className="pt-field">
          <label className="pt-label">Exact total budget (can override)</label>
          <input
            type="number"
            min="100"
            step="100"
            className="pt-input"
            value={selectedBudgetPreset.amount}
            onChange={e => setSelectedBudgetPreset({ ...selectedBudgetPreset, amount: Number(e.target.value) })}
          />
        </div>
        <div className="pt-field">
          <label className="pt-label">Currency</label>
          <select className="pt-input" value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 3. VIBE & DIETARY SELECTION */}
      <div className="pt-field">
        <label className="pt-label">3. Trip Vibes & Who Should Join</label>
        <div className="pt-vibe-chips">
          {VIBE_OPTIONS.map(v => {
            const isSel = selectedVibes.includes(v)
            return (
              <button
                type="button"
                key={v}
                className={`pt-vibe-chip ${isSel ? 'is-active' : ''}`}
                onClick={() => toggleVibeTag(v)}
              >
                {isSel ? '✓ ' : '+ '}{v}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-create-actions">
        <button type="button" className="pt-btn pt-btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="pt-btn pt-btn-primary" disabled={busy || disabled}>
          <Check size={14} /> Create & Open Room
        </button>
      </div>
      {disabled && <p className="pt-hint">Set your traveller name first (top right).</p>}
    </form>
  )
}

/* ---------------- Room ---------------- */
function RoomView({ room, myMemberId, busy, onPropose, onVote, onRemoveProposal, onAddExpense, onRemoveExpense, onLeave, onLock, onJoin, isMember }) {
  const [showAdd, setShowAdd] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [copiedSettle, setCopiedSettle] = useState(false)

  const isHost = room && myMemberId === room.hostId
  const paxCount = room?.members?.length || 0

  const majority = Math.max(1, Math.ceil(paxCount / 2))
  const committed = useMemo(() => (room?.proposals || []).filter(p => p.votes.length >= majority), [room, majority])
  const committedCost = committed.reduce((s, p) => s + (p.estCost || 0), 0)
  const perPersonBudget = paxCount ? Math.round((room?.budgetTotal || 0)) : room?.budgetTotal || 0
  const overBudget = committedCost > perPersonBudget && perPersonBudget > 0

  const settlement = useMemo(() => {
    const members = room?.members || []
    const expenses = room?.expenses || []
    const paid = {}
    const owed = {}
    members.forEach(m => { paid[m.id] = 0; owed[m.id] = 0 })
    expenses.forEach(e => {
      paid[e.paidById] = (paid[e.paidById] || 0) + Number(e.amount)
      const share = Number(e.amount) / Math.max(1, e.splitAmong.length)
      e.splitAmong.forEach(id => { owed[id] = (owed[id] || 0) + share })
    })
    const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const balances = members.map(m => ({
      id: m.id, name: m.name, avatar: m.avatar,
      paid: paid[m.id] || 0, share: owed[m.id] || 0,
      net: Math.round(((paid[m.id] || 0) - (owed[m.id] || 0)) * 100) / 100
    }))
    const debtors = balances.filter(b => b.net < -0.01).map(b => ({ ...b, net: -b.net }))
    const creditors = balances.filter(b => b.net > 0.01).map(b => ({ ...b }))
    const transactions = []
    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const amt = Math.min(debtors[i].net, creditors[j].net)
      if (amt > 0.01) {
        transactions.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(amt * 100) / 100 })
      }
      debtors[i].net -= amt
      creditors[j].net -= amt
      if (debtors[i].net <= 0.01) i++
      if (creditors[j].net <= 0.01) j++
    }
    return { totalSpent: Math.round(totalSpent * 100) / 100, balances, transactions }
  }, [room])

  const copySettlement = () => {
    const c = room.currency
    const lines = [
      `💰 ${room.title} — bill split`,
      `Total spent: ${c} ${settlement.totalSpent.toLocaleString()}`,
      '',
      '--- Who pays whom ---',
      ...(settlement.transactions.length
        ? settlement.transactions.map(t => `👉 ${t.from} pays ${t.to}: ${c} ${t.amount.toLocaleString()}`)
        : ['All settled up — nobody owes anything.'])
    ]
    try {
      navigator.clipboard.writeText(lines.join('\n'))
      setCopiedSettle(true)
      setTimeout(() => setCopiedSettle(false), 2200)
    } catch {}
  }

  if (!room) return <div className="pt-empty">Loading room…</div>

  const attractions = room.proposals.filter(p => p.type === 'attraction').sort((a, b) => b.votes.length - a.votes.length)
  const restaurants = room.proposals.filter(p => p.type === 'restaurant').sort((a, b) => b.votes.length - a.votes.length)

  const copyCode = () => {
    try { navigator.clipboard.writeText(room.code) } catch {}
  }

  return (
    <div className="pt-room">
      <div className="pt-room-header">
        <div>
          <div className="pt-room-title">
            <h1>{room.title}</h1>
            <span className={`pt-status pt-status-${room.status}`}>{room.status}</span>
          </div>
          <div className="pt-room-meta">
            <span><MapPin size={13} /> {room.destinationCity}, {room.destinationCountry}</span>
            <span><Calendar size={13} /> {fmtRange(room.departureDate, room.returnDate)}</span>
            <button className="pt-code-btn" onClick={copyCode}><Share2 size={12} /> Join code #{room.code}</button>
          </div>
          {room.vibe && <p className="pt-room-vibe">“{room.vibe}”</p>}
        </div>
        <div className="pt-room-actions">
          {!isMember && room.status === 'open' && (
            <button className="pt-btn pt-btn-primary" disabled={busy} onClick={onJoin}><Users size={14} /> Join</button>
          )}
          {isMember && (
            <button className="pt-btn pt-btn-ghost" disabled={busy} onClick={onLeave}><LogOut size={14} /> Leave</button>
          )}
        </div>
      </div>

      <div className="pt-room-cols">
        <aside className="pt-side">
          <div className="pt-panel">
            <h3><Users size={15} /> Travellers</h3>
            <div className="pt-pax-bar">
              <div className="pt-pax-fill" style={{ width: `${Math.min(100, (paxCount / room.maxPax) * 100)}%` }} />
            </div>
            <p className="pt-pax-line">
              <strong>{paxCount}</strong> joined · needs <strong>{room.minPax}</strong> · caps at <strong>{room.maxPax}</strong>
            </p>
            <ul className="pt-member-list">
              {room.members.map(m => (
                <li key={m.id}>
                  <span className="pt-avatar sm">{m.avatar}</span>
                  <span className="pt-member-name">{m.name}{m.id === myMemberId ? ' (you)' : ''}</span>
                  {m.isHost && <span className="pt-host-tag"><Crown size={11} /> host</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-panel">
            <h3><Wallet size={15} /> Shared budget</h3>
            <div className="pt-budget-row"><span>Budget / person</span><strong>{room.currency} {perPersonBudget.toLocaleString()}</strong></div>
            <div className="pt-budget-row"><span>Voted-in stops</span><strong>{room.currency} {committedCost.toLocaleString()}</strong></div>
            <div className={`pt-budget-row pt-budget-total ${overBudget ? 'is-over' : ''}`}>
              <span>{overBudget ? 'Over by' : 'Left / person'}</span>
              <strong>{room.currency} {Math.abs(perPersonBudget - committedCost).toLocaleString()}</strong>
            </div>
            <p className="pt-mini">A stop counts toward the budget once {majority} of {paxCount} {paxCount === 1 ? 'traveller votes' : 'travellers vote'} for it.</p>
          </div>

          {isHost && (
            <div className="pt-panel">
              <h3><Lock size={15} /> Host controls</h3>
              {room.status === 'locked' ? (
                <button className="pt-btn pt-btn-ghost pt-full" disabled={busy} onClick={() => onLock(true)}>
                  <Unlock size={14} /> Reopen trip
                </button>
              ) : (
                <button className="pt-btn pt-btn-primary pt-full" disabled={busy || !room.canLock} onClick={() => onLock(false)}>
                  <Lock size={14} /> Lock the plan
                </button>
              )}
              {!room.canLock && room.status !== 'locked' && (
                <p className="pt-mini">Lock unlocks once {room.minPax} travellers have joined.</p>
              )}
            </div>
          )}
        </aside>

        <main className="pt-main">
          <div className="pt-main-head">
            <h2>Plan it together</h2>
            {isMember && (
              <button className="pt-btn pt-btn-primary pt-sm" onClick={() => setShowAdd(v => !v)}>
                <Plus size={14} /> Propose a place
              </button>
            )}
          </div>

          {!isMember && <p className="pt-hint">Join the trip to propose places and vote.</p>}

          {showAdd && isMember && (
            <AddProposal
              busy={busy}
              onCancel={() => setShowAdd(false)}
              onSubmit={p => { onPropose(p); setShowAdd(false) }}
            />
          )}

          <ProposalColumn
            icon={<Compass size={15} />}
            title="Attractions"
            items={attractions}
            myMemberId={myMemberId}
            hostId={room.hostId}
            currency={room.currency}
            majority={majority}
            canVote={isMember}
            onVote={onVote}
            onRemove={onRemoveProposal}
          />
          <ProposalColumn
            icon={<Utensils size={15} />}
            title="Restaurants"
            items={restaurants}
            myMemberId={myMemberId}
            hostId={room.hostId}
            currency={room.currency}
            majority={majority}
            canVote={isMember}
            onVote={onVote}
            onRemove={onRemoveProposal}
          />

          <div className="pt-col">
            <div className="pt-col-head">
              <Receipt size={15} /> <span>Split the bill</span>
              <span className="pt-col-count">{room.currency} {settlement.totalSpent.toLocaleString()}</span>
            </div>

            {isMember && (
              <button className="pt-btn pt-btn-ghost pt-sm" style={{ marginBottom: 12 }} onClick={() => setShowExpense(v => !v)}>
                <Plus size={14} /> Add an expense
              </button>
            )}

            {showExpense && isMember && (
              <AddExpense
                busy={busy}
                members={room.members}
                myMemberId={myMemberId}
                currency={room.currency}
                onCancel={() => setShowExpense(false)}
                onSubmit={x => { onAddExpense(x); setShowExpense(false) }}
              />
            )}

            {(room.expenses || []).length === 0 ? (
              <p className="pt-col-empty">No expenses logged yet. Add who paid for what and the app works out who owes whom.</p>
            ) : (
              <>
                <div className="pt-exp-list">
                  {[...room.expenses].reverse().map(e => {
                    const canRemove = e.addedById === myMemberId || myMemberId === room.hostId
                    return (
                      <div key={e.id} className="pt-exp">
                        <div>
                          <div className="pt-exp-title">{e.title}</div>
                          <div className="pt-exp-sub">
                            {e.paidByName} paid · split {e.splitAmong.length}-ways
                          </div>
                        </div>
                        <div className="pt-exp-right">
                          <strong>{room.currency} {Number(e.amount).toLocaleString()}</strong>
                          {canRemove && <button className="pt-prop-x" onClick={() => onRemoveExpense(e.id)}><X size={13} /></button>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-settle">
                  <div className="pt-settle-head">
                    <span>Who owes whom</span>
                    <button className="pt-code-btn" onClick={copySettlement}>
                      {copiedSettle ? <Check size={12} /> : <Share2 size={12} />} {copiedSettle ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  {settlement.transactions.length === 0 ? (
                    <p className="pt-mini">Everyone's square — no transfers needed.</p>
                  ) : (
                    settlement.transactions.map((t, idx) => (
                      <div key={idx} className="pt-settle-row">
                        <span>{t.from}</span>
                        <span className="pt-settle-arrow">pays →</span>
                        <span>{t.to}</span>
                        <strong>{room.currency} {t.amount.toLocaleString()}</strong>
                      </div>
                    ))
                  )}
                  <div className="pt-settle-balances">
                    {settlement.balances.map(b => (
                      <div key={b.id} className="pt-bal">
                        <span className="pt-avatar sm">{b.avatar}</span>
                        <span className="pt-bal-name">{b.name}{b.id === myMemberId ? ' (you)' : ''}</span>
                        <span className={`pt-bal-net ${b.net > 0.01 ? 'is-pos' : b.net < -0.01 ? 'is-neg' : ''}`}>
                          {b.net > 0.01 ? `gets back ${room.currency} ${b.net.toLocaleString()}`
                            : b.net < -0.01 ? `owes ${room.currency} ${Math.abs(b.net).toLocaleString()}`
                            : 'settled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function AddExpense({ busy, members, myMemberId, currency, onCancel, onSubmit }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidById, setPaidById] = useState(myMemberId)
  const [splitAmong, setSplitAmong] = useState(members.map(m => m.id))

  const toggle = id => setSplitAmong(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const submit = e => {
    e.preventDefault()
    if (!title.trim() || !(Number(amount) > 0)) return
    onSubmit({
      title: title.trim(),
      amount: Number(amount),
      paidById,
      splitAmong: splitAmong.length ? splitAmong : members.map(m => m.id)
    })
  }

  return (
    <form className="pt-create" onSubmit={submit}>
      <div className="pt-row">
        <div className="pt-field">
          <label className="pt-label">What was it for</label>
          <input className="pt-input" value={title} required placeholder="Dinner at Lou Wong" onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="pt-field">
          <label className="pt-label">Amount ({currency})</label>
          <input type="number" min="0" step="0.01" className="pt-input" value={amount} required placeholder="120" onChange={e => setAmount(e.target.value)} />
        </div>
      </div>
      <div className="pt-field">
        <label className="pt-label">Paid by</label>
        <select className="pt-input" value={paidById} onChange={e => setPaidById(e.target.value)}>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}{m.id === myMemberId ? ' (you)' : ''}</option>)}
        </select>
      </div>
      <div className="pt-field">
        <label className="pt-label">Split among</label>
        <div className="pt-split-grid">
          {members.map(m => (
            <button
              type="button"
              key={m.id}
              className={`pt-split-opt ${splitAmong.includes(m.id) ? 'is-active' : ''}`}
              onClick={() => toggle(m.id)}
            >
              <span className="pt-avatar sm">{m.avatar}</span> {m.name}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-create-actions">
        <button type="button" className="pt-btn pt-btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="pt-btn pt-btn-primary" disabled={busy}><Plus size={14} /> Log expense</button>
      </div>
    </form>
  )
}

function AddProposal({ busy, onCancel, onSubmit }) {
  const [type, setType] = useState('attraction')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [estCost, setEstCost] = useState(0)
  const [note, setNote] = useState('')

  const submit = e => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ type, name: name.trim(), category: category.trim(), estCost: Number(estCost) || 0, note: note.trim() })
  }

  return (
    <form className="pt-create" onSubmit={submit}>
      <div className="pt-type-toggle">
        <button type="button" className={type === 'attraction' ? 'is-active' : ''} onClick={() => setType('attraction')}>
          <Compass size={14} /> Attraction
        </button>
        <button type="button" className={type === 'restaurant' ? 'is-active' : ''} onClick={() => setType('restaurant')}>
          <Utensils size={14} /> Restaurant
        </button>
      </div>
      <div className="pt-row">
        <div className="pt-field">
          <label className="pt-label">Name</label>
          <input className="pt-input" value={name} required placeholder="Kellie's Castle" onChange={e => setName(e.target.value)} />
        </div>
        <div className="pt-field">
          <label className="pt-label">Category <span className="pt-opt">(optional)</span></label>
          <input className="pt-input" value={category} placeholder="Heritage" onChange={e => setCategory(e.target.value)} />
        </div>
      </div>
      <div className="pt-row">
        <div className="pt-field">
          <label className="pt-label">Est. cost / person</label>
          <input type="number" min="0" step="5" className="pt-input" value={estCost} onChange={e => setEstCost(e.target.value)} />
        </div>
        <div className="pt-field">
          <label className="pt-label">Note <span className="pt-opt">(optional)</span></label>
          <input className="pt-input" value={note} placeholder="Best at sunset" onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <div className="pt-create-actions">
        <button type="button" className="pt-btn pt-btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="pt-btn pt-btn-primary" disabled={busy}><Plus size={14} /> Add proposal</button>
      </div>
    </form>
  )
}

function ProposalColumn({ icon, title, items, myMemberId, hostId, currency, majority, canVote, onVote, onRemove }) {
  return (
    <div className="pt-col">
      <div className="pt-col-head">{icon} <span>{title}</span> <span className="pt-col-count">{items.length}</span></div>
      {items.length === 0 ? (
        <p className="pt-col-empty">Nothing proposed yet.</p>
      ) : (
        items.map(p => {
          const voted = p.votes.includes(myMemberId)
          const inPlan = p.votes.length >= majority
          const canRemove = p.addedById === myMemberId || myMemberId === hostId
          return (
            <div key={p.id} className={`pt-prop ${inPlan ? 'is-in' : ''}`}>
              <div className="pt-prop-body">
                <div className="pt-prop-name">
                  {p.name}
                  {inPlan && <span className="pt-in-tag"><Check size={11} /> in plan</span>}
                </div>
                <div className="pt-prop-sub">
                  {p.category && <span>{p.category}</span>}
                  {p.estCost > 0 && <span>{currency} {p.estCost.toLocaleString()}/pax</span>}
                  <span>by {p.addedByName}</span>
                </div>
                {p.note && <div className="pt-prop-note">{p.note}</div>}
              </div>
              <div className="pt-prop-actions">
                <button
                  className={`pt-vote ${voted ? 'is-voted' : ''}`}
                  disabled={!canVote}
                  onClick={() => onVote(p.id)}
                  title={canVote ? 'Vote' : 'Join to vote'}
                >
                  <ThumbsUp size={13} /> {p.votes.length}
                </button>
                {canRemove && (
                  <button className="pt-prop-x" onClick={() => onRemove(p.id)} title="Remove"><X size={13} /></button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

/* ---------------- Scoped styles ---------------- */
function PubTripStyles() {
  return (
    <style>{`
      .pubtrip-wrap { width: 100%; min-height: 100vh; background: var(--bg-primary); padding: 20px 0 80px; }
      .pubtrip-container { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
      .pubtrip-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
      .pt-back { display: inline-flex; align-items: center; gap: 7px; background: var(--bg-card); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-full); padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; font-family: var(--font-body); }
      .pt-back:hover { border-color: var(--border-highlight); }

      .pt-error { display: flex; align-items: center; gap: 8px; background: #FDECEA; color: #B0332C; border: 1px solid #F3C6C1;
        padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; }

      .pt-hero { display: flex; align-items: center; gap: 16px; background: var(--gradient-card); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg); padding: 20px 22px; box-shadow: var(--shadow-lg); margin-bottom: 18px; flex-wrap: wrap; }
      .pt-hero-icon { width: 46px; height: 46px; border-radius: 14px; background: var(--gradient-brand); color: #fff; display: grid; place-items: center; flex-shrink: 0; }
      .pt-hero h1 { font-family: var(--font-heading); font-size: 20px; font-weight: 800; color: var(--text-primary); }
      .pt-hero p { font-size: 13px; color: var(--text-muted); max-width: 620px; margin-top: 3px; }
      .pt-hero .pt-btn { margin-left: auto; }

      .pt-board-head { display: flex; align-items: center; justify-content: space-between; margin: 8px 2px 12px; }
      .pt-board-head h2 { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-secondary); }

      .pt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
      .pt-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 7px; box-shadow: var(--shadow-lg); }
      .pt-card-top { display: flex; align-items: center; justify-content: space-between; }
      .pt-card h3 { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); }
      .pt-meta { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-muted); }
      .pt-vibe { font-size: 12px; color: var(--accent-blue); background: rgba(62,123,108,0.08); padding: 5px 9px; border-radius: 8px; margin-top: 2px; }
      .pt-code { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--text-muted); font-family: var(--font-heading); }
      .pt-status { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; border-radius: var(--radius-full); }
      .pt-status-open { background: rgba(71,122,94,0.14); color: #35674E; }
      .pt-status-full { background: rgba(217,130,43,0.16); color: #A5641C; }
      .pt-status-locked { background: rgba(124,92,183,0.16); color: #5C43A0; }
      .pt-card-people { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
      .pt-avatars, .pt-room-title { display: flex; align-items: center; gap: 6px; }
      .pt-avatar { font-size: 16px; }
      .pt-avatar.sm { font-size: 14px; width: 24px; height: 24px; display: inline-grid; place-items: center; background: var(--bg-secondary); border-radius: var(--radius-full); }
      .pt-pax { font-size: 11.5px; color: var(--text-muted); }
      .pt-card-actions { margin-top: 6px; }

      .pt-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer;
        font-family: var(--font-body); font-weight: 700; font-size: 13px; padding: 9px 16px; border-radius: var(--radius-full); transition: transform .1s ease, opacity .1s ease; }
      .pt-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .pt-btn:not(:disabled):active { transform: scale(0.97); }
      .pt-btn-primary { background: var(--gradient-brand); color: #fff; box-shadow: var(--shadow-glow); }
      .pt-btn-ghost { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border-subtle); }
      .pt-full { width: 100%; }
      .pt-sm { font-size: 12px; padding: 7px 12px; }

      .pt-empty { text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 13px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
      .pt-hint { font-size: 12px; color: var(--text-muted); margin-top: 10px; text-align: center; }

      .pt-identity { position: relative; }
      .pt-identity-btn { display: inline-flex; align-items: center; gap: 7px; background: var(--bg-card); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-full); padding: 7px 13px; font-size: 12.5px; font-weight: 600; color: var(--text-secondary); cursor: pointer; font-family: var(--font-body); }
      .pt-identity-pop { position: absolute; right: 0; top: calc(100% + 8px); width: 260px; background: var(--bg-card); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 14px; box-shadow: var(--shadow-lg); z-index: 40; }
      .pt-avatar-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; margin: 6px 0 12px; }
      .pt-avatar-opt { font-size: 16px; padding: 5px 0; border-radius: 8px; border: 1px solid transparent; background: var(--bg-secondary); cursor: pointer; }
      .pt-avatar-opt.is-active { border-color: var(--accent-cyan); background: #fff; }

      .pt-label { display: block; font-size: 11.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 5px; }
      .pt-opt { font-weight: 500; color: var(--text-muted); }
      .pt-input { width: 100%; padding: 9px 11px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
        font-size: 13px; font-family: var(--font-body); color: var(--text-primary); background: var(--bg-primary); }
      .pt-input:focus { outline: none; border-color: var(--accent-cyan); }

      .pt-create { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 18px; box-shadow: var(--shadow-lg); }
      .pt-create h3 { font-family: var(--font-heading); font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); }
      .pt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
      .pt-field { margin-bottom: 12px; }
      .pt-row .pt-field { margin-bottom: 0; }
      .pt-stepper { display: inline-flex; align-items: center; gap: 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 5px 12px; }
      .pt-stepper button { border: none; background: var(--bg-secondary); width: 26px; height: 26px; border-radius: 7px; display: grid; place-items: center; cursor: pointer; }
      .pt-stepper span { min-width: 22px; text-align: center; font-weight: 700; font-size: 14px; }
      .pt-create-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

      /* City Selector Cards Grid */
      .pt-city-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 6px; }
      .pt-city-card { border: 1px solid var(--border-subtle); background: var(--bg-primary); border-radius: 10px; padding: 10px; text-align: left; cursor: pointer; font-family: var(--font-body); transition: all 0.15s ease; }
      .pt-city-card:hover { border-color: var(--border-highlight); }
      .pt-city-card.is-active { border-color: var(--accent-cyan); background: rgba(45,160,140,0.06); box-shadow: 0 0 0 1px var(--accent-cyan); }
      .pt-city-tag { font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pt-city-name { font-size: 13px; font-weight: 800; color: var(--text-primary); }
      .pt-city-state { font-size: 11px; color: var(--text-muted); }

      /* Budget Tiers Grid */
      .pt-budget-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 6px; }
      .pt-budget-card { border: 1px solid var(--border-subtle); background: var(--bg-primary); border-radius: 10px; padding: 11px; text-align: left; cursor: pointer; font-family: var(--font-body); }
      .pt-budget-card.is-active { border-color: var(--accent-cyan); background: rgba(45,160,140,0.06); box-shadow: 0 0 0 1px var(--accent-cyan); }
      .pt-b-top { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
      .pt-b-desc { font-size: 10.5px; color: var(--text-muted); line-height: 1.35; }

      /* Vibe Chips */
      .pt-vibe-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .pt-vibe-chip { border: 1px solid var(--border-subtle); background: var(--bg-primary); border-radius: var(--radius-full); padding: 5px 11px; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: var(--font-body); color: var(--text-secondary); }
      .pt-vibe-chip.is-active { border-color: var(--accent-cyan); color: var(--accent-cyan); background: rgba(45,160,140,0.08); }

      .pt-room-header { display: flex; justify-content: space-between; gap: 16px; background: var(--gradient-card); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-lg); margin-bottom: 16px; flex-wrap: wrap; }
      .pt-room-title h1 { font-family: var(--font-heading); font-size: 19px; font-weight: 800; color: var(--text-primary); }
      .pt-room-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 8px; font-size: 12.5px; color: var(--text-muted); }
      .pt-room-meta span { display: inline-flex; align-items: center; gap: 5px; }
      .pt-code-btn { display: inline-flex; align-items: center; gap: 5px; border: 1px dashed var(--border-highlight); background: transparent;
        color: var(--accent-cyan); font-weight: 700; font-size: 11.5px; padding: 4px 9px; border-radius: var(--radius-full); cursor: pointer; }
      .pt-room-vibe { font-size: 12.5px; color: var(--accent-blue); margin-top: 8px; font-style: italic; }

      .pt-room-cols { display: grid; grid-template-columns: 300px 1fr; gap: 16px; align-items: start; }
      .pt-side { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 16px; }
      .pt-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 15px; box-shadow: var(--shadow-lg); }
      .pt-panel h3 { display: flex; align-items: center; gap: 7px; font-family: var(--font-heading); font-size: 13.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 10px; }
      .pt-pax-bar { height: 7px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 7px; }
      .pt-pax-fill { height: 100%; background: var(--gradient-brand); border-radius: var(--radius-full); transition: width .3s ease; }
      .pt-pax-line { font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px; }
      .pt-member-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }
      .pt-member-list li { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-secondary); }
      .pt-member-name { flex: 1; }
      .pt-host-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent-amber); }

      .pt-budget-row { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-muted); padding: 5px 0; }
      .pt-budget-row strong { color: var(--text-primary); }
      .pt-budget-total { border-top: 1px solid var(--border-subtle); margin-top: 4px; padding-top: 8px; }
      .pt-budget-total strong { color: var(--accent-emerald); }
      .pt-budget-total.is-over strong { color: var(--accent-rose); }
      .pt-mini { font-size: 10.5px; color: var(--text-muted); margin-top: 8px; line-height: 1.45; }

      .pt-main { display: flex; flex-direction: column; gap: 14px; }
      .pt-main-head { display: flex; align-items: center; justify-content: space-between; }
      .pt-main-head h2 { font-family: var(--font-heading); font-size: 16px; font-weight: 800; color: var(--text-primary); }
      .pt-type-toggle { display: flex; gap: 8px; margin-bottom: 14px; }
      .pt-type-toggle button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-subtle); background: var(--bg-primary);
        padding: 7px 13px; border-radius: var(--radius-full); font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: var(--font-body); color: var(--text-secondary); }
      .pt-type-toggle button.is-active { border-color: var(--accent-cyan); color: var(--accent-cyan); background: #fff; }

      .pt-col { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 15px; box-shadow: var(--shadow-lg); }
      .pt-col-head { display: flex; align-items: center; gap: 7px; font-family: var(--font-heading); font-size: 13.5px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; }
      .pt-col-count { margin-left: auto; background: var(--bg-secondary); border-radius: var(--radius-full); padding: 1px 8px; font-size: 11px; }
      .pt-col-empty { font-size: 12px; color: var(--text-muted); padding: 6px 0; }
      .pt-prop { display: flex; justify-content: space-between; gap: 10px; padding: 11px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); margin-bottom: 8px; }
      .pt-prop.is-in { border-color: var(--accent-emerald); background: rgba(71,122,94,0.05); }
      .pt-prop-name { font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
      .pt-in-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent-emerald); }
      .pt-prop-sub { display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; color: var(--text-muted); margin-top: 4px; }
      .pt-prop-note { font-size: 11.5px; color: var(--text-secondary); margin-top: 5px; }
      .pt-prop-actions { display: flex; align-items: flex-start; gap: 6px; }
      .pt-vote { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--border-subtle); background: var(--bg-primary);
        padding: 6px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 700; color: var(--text-secondary); cursor: pointer; }
      .pt-vote.is-voted { border-color: var(--accent-cyan); color: var(--accent-cyan); background: #fff; }
      .pt-vote:disabled { opacity: 0.5; cursor: not-allowed; }
      .pt-prop-x { border: none; background: var(--bg-secondary); width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; cursor: pointer; color: var(--text-muted); }

      .pt-exp-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
      .pt-exp { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 11px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); }
      .pt-exp-title { font-size: 12.5px; font-weight: 700; color: var(--text-primary); }
      .pt-exp-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
      .pt-exp-right { display: flex; align-items: center; gap: 8px; }
      .pt-exp-right strong { font-size: 12.5px; color: var(--text-primary); }
      .pt-settle { border-top: 1px solid var(--border-subtle); padding-top: 12px; }
      .pt-settle-head { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; }
      .pt-settle-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-secondary); padding: 5px 0; }
      .pt-settle-row strong { margin-left: auto; color: var(--accent-cyan); }
      .pt-settle-arrow { font-size: 11px; color: var(--text-muted); }
      .pt-settle-balances { margin-top: 10px; border-top: 1px dashed var(--border-subtle); padding-top: 10px; display: flex; flex-direction: column; gap: 6px; }
      .pt-bal { display: flex; align-items: center; gap: 8px; font-size: 12px; }
      .pt-bal-name { flex: 1; color: var(--text-secondary); }
      .pt-bal-net { color: var(--text-muted); }
      .pt-bal-net.is-pos { color: var(--accent-emerald); font-weight: 600; }
      .pt-bal-net.is-neg { color: var(--accent-rose); font-weight: 600; }
      .pt-split-grid { display: flex; flex-wrap: wrap; gap: 6px; }
      .pt-split-opt { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--border-subtle); background: var(--bg-primary);
        padding: 5px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font-body); color: var(--text-secondary); }
      .pt-split-opt.is-active { border-color: var(--accent-cyan); color: var(--accent-cyan); background: #fff; }

      @media (max-width: 860px) {
        .pt-room-cols { grid-template-columns: 1fr; }
        .pt-side { position: static; }
        .pt-row { grid-template-columns: 1fr; }
        .pt-hero .pt-btn { margin-left: 0; }
        .pt-budget-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  )
}