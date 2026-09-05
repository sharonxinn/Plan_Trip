import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, ArrowUpRight, ChevronRight, Compass, Navigation, Camera, Check, Plus, Luggage, RotateCcw } from 'lucide-react'


export default function OriginDashboard({ selectedCity, selectedCountry, departureDate, returnDate, travellers, budgetAmount, basket = [], isCalendarAdded, onNavigateStage, onOpenDateEditor, onOpenSmartWizard }) {
  const [now, setNow] = useState(Date.now())
  const [imageFailed, setImageFailed] = useState(false)
  const [postcardFlipped, setPostcardFlipped] = useState(false)
  const movePhoto = event => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--photo-x', `${((event.clientX - box.left) / box.width - .5) * 16}px`)
    event.currentTarget.style.setProperty('--photo-y', `${((event.clientY - box.top) / box.height - .5) * 12}px`)
  }
  const resetPhoto = event => {
    event.currentTarget.style.setProperty('--photo-x', '0px')
    event.currentTarget.style.setProperty('--photo-y', '0px')
  }
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer) }, [])
  useEffect(() => setImageFailed(false), [selectedCity?.heroImage])
  const start = new Date(`${departureDate}T00:00:00`)
  const end = new Date(`${returnDate}T23:59:59`)
  const days = Math.max(0, Math.ceil((start - now) / 86400000))
  const status = now > end ? 'Trip completed' : now >= start ? 'Enjoy your trip' : `${days} days to go`
  const date = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const spots = selectedCity?.attractions?.slice(0, 3) || []
  return (
    <main className="trip-home">
      <div className="trip-home-heading"><div><p>Your travel space</p><h1>A little closer to going.</h1></div><button className="trip-text-button" onClick={onOpenDateEditor}><Calendar size={17}/> Edit trip</button></div>
      <section className="trip-overview" aria-label="Your trip overview">
        <div className={`trip-postcard ${postcardFlipped ? 'is-flipped' : ''}`} onPointerMove={movePhoto} onPointerLeave={resetPhoto}>
        <div className="trip-postcard-turn">
        <div className={`trip-photo ${imageFailed ? 'trip-photo-fallback' : ''}`} aria-hidden={postcardFlipped}>
          {!imageFailed && selectedCity?.heroImage && <img src={selectedCity.heroImage} alt={`View of ${selectedCity.city}`} onError={() => setImageFailed(true)} />}
          <div className="trip-photo-caption"><span><MapPin size={15}/>{selectedCountry?.country || 'Your destination'}</span><h2>{selectedCity?.city || 'Your next trip'}</h2></div>
          <span className="trip-luggage-tag"><span className="trip-tag-hole"/>{status}</span>
        </div>
        <div className="trip-postcard-back" aria-hidden={!postcardFlipped}>
          <MapPin size={30}/><p>A postcard from</p><h2>{selectedCity?.city || 'your next adventure'}</h2>
          <span>{selectedCity?.state || selectedCountry?.country}</span>
          <div className="trip-postcard-lines"><strong>On the wish list</strong>{spots.map(spot => <p key={spot.id}>{spot.name}</p>)}{!spots.length && <p>Your next adventure starts with a place.</p>}</div>
        </div>
        </div>
        <button className="trip-flip-button" aria-pressed={postcardFlipped} onClick={() => setPostcardFlipped(value => !value)}><RotateCcw size={15}/>{postcardFlipped ? 'Back to photo' : 'Flip postcard'}</button>
        </div>
        <div className="trip-details"><h2>Let’s get your trip together.</h2><p>A few good places. Your favourite people. Room for the unexpected.</p>
          <button className="trip-detail-row" onClick={onOpenDateEditor}><Calendar size={20}/><span><small>Travel dates</small><strong>{date(departureDate)} – {date(returnDate)} {start.getFullYear()}</strong></span><ChevronRight size={17}/></button>
          <button className="trip-detail-row" onClick={onOpenDateEditor}><Users size={20}/><span><small>Travelling together</small><strong>{travellers} {travellers === 1 ? 'person' : 'people'}</strong></span><ChevronRight size={17}/></button>
          <div className="trip-budget"><span>Trip budget</span><strong>RM {Number(budgetAmount || 0).toLocaleString()}</strong></div>
          <button className="trip-primary" onClick={() => onNavigateStage('planning')}>Continue planning <ArrowUpRight size={19}/></button>
          {isCalendarAdded && <span className="trip-calendar-note"><Check size={14}/> Added to calendar</span>}
        </div>
      </section>
      <nav className="trip-shortcuts" aria-label="Trip tools">
        {[{ id: 'planning', icon: Compass, title: 'Make a plan', text: 'Places, stays & the group budget' }, { id: 'travelling', icon: Navigation, title: 'On the trip', text: 'Directions, expenses & backup plans' }, { id: 'memory', icon: Camera, title: 'Keep the memories', text: 'Photos, postcards & your trip recap' }].map(({ id, icon: Icon, title, text }) => <button key={id} onClick={() => onNavigateStage(id)}><span className={`trip-tool-icon ${id}`}><Icon size={23}/></span><span><strong>{title}</strong><small>{text}</small></span><ChevronRight size={18}/></button>)}
      </nav>
      <div className="trip-bottom-grid">
        <section className="trip-places"><div className="trip-section-heading"><div><h2>Get to know {selectedCity?.city || 'your destination'}</h2><p>A few places to start exploring.</p></div><button className="trip-text-button" onClick={() => onNavigateStage('planning')}>Explore <ArrowUpRight size={16}/></button></div>
          <div className="trip-place-list">{spots.map(spot => <button key={spot.id} className="trip-place" onClick={() => onNavigateStage('planning')}><div className="trip-place-image"><img src={spot.image} alt="" loading="lazy" onError={event => { event.currentTarget.style.visibility = 'hidden' }}/></div><span><strong>{spot.name}</strong><small>{spot.category}</small></span><ArrowUpRight size={18}/></button>)}{!spots.length && <p>Choose a destination in your plan to discover places nearby.</p>}</div>
        </section>
        <aside className="trip-route-note"><span className="trip-note-icon"><Luggage size={23}/></span><svg className="trip-route-sketch" viewBox="0 0 230 65" aria-hidden="true"><path className="trip-route-track" d="M12 48 C45 48 35 12 76 16 S120 65 158 38 S187 10 218 15"/><path className="trip-route-ink" pathLength="1" d="M12 48 C45 48 35 12 76 16 S120 65 158 38 S187 10 218 15"/><circle cx="12" cy="48" r="5"/><circle cx="115" cy="40" r="5"/><circle cx="218" cy="15" r="5"/></svg><h2>Less zigzag.<br/>More exploring.</h2><p>Turn your saved places into a day-by-day route, with time to get between stops.</p><button className="trip-route-button" onClick={onOpenSmartWizard}><Plus size={17}/> Build my route</button><span className="trip-saved-note">{basket.length ? `${basket.length} items in your trip basket` : 'Start with the places you want to see'}</span></aside>
      </div>
    </main>
  )
}
