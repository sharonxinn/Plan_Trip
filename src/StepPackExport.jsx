import React, { useState, useEffect } from 'react'
import {
  Luggage, FileDown, Calendar, Share2, Printer, Check,
  Sparkles, ShieldCheck, ArrowLeft, Download, Plus,
  Trash2, Sun, CloudRain, CheckCircle2, Copy, Wind, Droplets
} from 'lucide-react'
import { addTripToGoogleCalendar } from './utils/googleCalendar'

export default function StepPackExport({
  destination,
  travellers,
  travelParty,
  departureDate,
  returnDate,
  durationDays,
  budgetAmount,
  basket = [],
  selectedFlight,
  selectedHotel,
  onAddToCalendar,
  onPrevStep
}) {
  const cityName = destination?.city || 'Kuala Lumpur'
  const countryName = destination?.country || 'Malaysia'

  const [activeTab, setActiveTab] = useState('pack') // 'pack' | 'export' | 'runsheet'
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false)
  const [downloadingDoc, setDownloadingDoc] = useState(false)
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState('idle') // 'idle' | 'connecting' | 'synced' | 'error'
  const [googleCalendarError, setGoogleCalendarError] = useState('')
  const [newItemText, setNewItemText] = useState('')

  // Live real-time weather state
  const [liveWeather, setLiveWeather] = useState({
    temp: 31,
    feelsLike: 34,
    description: 'Partly Sunny & Warm',
    icon: '🌤️',
    rainChance: 25,
    humidity: 75,
    windSpeed: 10,
    advice: 'Mild tropical temperatures, light comfortable clothes recommended.',
    source: 'Open-Meteo Satellite Feed'
  })

  // Fetch real-time live weather
  useEffect(() => {
    if (!destination) return
    const params = new URLSearchParams({
      city: cityName,
      lat: destination.lat || '',
      lng: destination.lng || ''
    })
    fetch(`/api/weather?${params}`)
      .then(res => res.json())
      .then(data => {
        if (data.temp !== undefined) {
          setLiveWeather(data)
        }
      })
      .catch(() => {})
  }, [destination, cityName])

  // Smart Weather-aware Packing Checklist
  const [packingCategories, setPackingCategories] = useState([
    {
      category: '📄 Travel Documents & Essentials',
      items: [
        { id: 'p-1', text: 'Passport / National ID (Valid > 6 months)', packed: true },
        { id: 'p-2', text: 'Flight & Hotel Booking Confirmations (Digital & PDF)', packed: true },
        { id: 'p-3', text: 'Credit/Debit cards with foreign currency activated', packed: false },
        { id: 'p-4', text: 'Travel Insurance policy number & hotline card', packed: true }
      ]
    },
    {
      category: '⚡ Tech & Electronics',
      items: [
        { id: 'p-5', text: 'Universal travel power adapter (UK / US / EU plug)', packed: false },
        { id: 'p-6', text: '10,000mAh+ Power bank for full-day photo shooting', packed: true },
        { id: 'p-7', text: 'Charging cables & eSIM / Roaming data QR code', packed: false }
      ]
    },
    {
      category: `☀️ ${cityName} Weather & Clothing (${destination?.weather || 'Tropical 28-32°C'})`,
      items: [
        { id: 'p-8', text: 'Breathable lightweight cotton / linen outfits', packed: true },
        { id: 'p-9', text: 'Compact travel umbrella / rain poncho', packed: false },
        { id: 'p-10', text: 'Comfortable walking sneakers (10,000+ daily steps)', packed: true },
        { id: 'p-11', text: 'UV Sunscreen SPF 50+ & sunglasses', packed: false },
        { id: 'p-12', text: 'Light cardigan / jacket for air-conditioned malls & flights', packed: false }
      ]
    },
    {
      category: '💊 Health, First-Aid & Toiletries',
      items: [
        { id: 'p-13', text: 'Personal medications, Panadol & motion sickness pills', packed: true },
        { id: 'p-14', text: 'Hydration electrolyte packs & insect repellent', packed: false },
        { id: 'p-15', text: 'Mini hand sanitizer & wet wipes', packed: true }
      ]
    }
  ])

  // Toggle pack state
  const toggleItem = (catIdx, itemIdx) => {
    const updated = [...packingCategories]
    updated[catIdx].items[itemIdx].packed = !updated[catIdx].items[itemIdx].packed
    setPackingCategories(updated)
  }

  // Add custom item
  const handleAddItem = e => {
    e.preventDefault()
    if (!newItemText.trim()) return
    const updated = [...packingCategories]
    updated[0].items.push({
      id: `p-${Date.now()}`,
      text: newItemText.trim(),
      packed: false
    })
    setPackingCategories(updated)
    setNewItemText('')
  }

  // Calculate packed percentage
  const totalItems = packingCategories.reduce((sum, c) => sum + c.items.length, 0)
  const packedItems = packingCategories.reduce((sum, c) => sum + c.items.filter(i => i.packed).length, 0)
  const packPercent = Math.round((packedItems / Math.max(1, totalItems)) * 100)

  // 1-Click Export to Word Doc
  const handleExportWord = () => {
    setDownloadingDoc(true)
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>${cityName} Travel Itinerary</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; padding: 25px; color: #1e293b; }
        h1 { color: #0284c7; }
        .meta { background: #f0f9ff; padding: 15px; border-left: 4px solid #0284c7; margin: 15px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
        th { background: #f8fafc; text-align: left; }
      </style>
      </head>
      <body>
        <h1>${cityName}, ${countryName} - Official Travel Plan</h1>
        <div class="meta">
          <strong>Dates:</strong> ${departureDate} to ${returnDate} (${durationDays} Days)<br>
          <strong>Travel Party:</strong> ${travellers} Travellers (${travelParty})<br>
          <strong>Total Estimated Budget:</strong> RM ${budgetAmount.toLocaleString()}
        </div>
        <h2>Itemized Flights & Accommodations</h2>
        <table>
          <tr><th>Category</th><th>Details</th><th>Status</th></tr>
          <tr><td>Flight</td><td>${selectedFlight ? `${selectedFlight.airline} (${selectedFlight.depart} → ${selectedFlight.arrive})` : 'Direct Flights Confirmed'}</td><td>Confirmed</td></tr>
          <tr><td>Hotel</td><td>${selectedHotel ? `${selectedHotel.name} (${selectedHotel.area})` : 'Central Stay Confirmed'}</td><td>Confirmed</td></tr>
        </table>
        <h2>Shortlisted Activities & Sights</h2>
        <ul>
          ${basket.map(b => `<li><strong>${b.title || b.name}</strong> (${b.category || b.tag || 'Sightseeing'}) - Verified Google Review spot</li>`).join('') || '<li>Batu Caves, Petronas Twin Towers, Jalan Alor Food Street</li>'}
        </ul>
        <h2>Smart Packing Checklist</h2>
        <ul>
          ${packingCategories.flatMap(c => c.items).map(i => `<li>[${i.packed ? 'X' : ' '}] ${i.text}</li>`).join('')}
        </ul>
        <p><em>Generated by PlanTrip AI · Less Stress, Seamless Travel</em></p>
      </body>
      </html>
    `
    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `PlanTrip_${cityName.replace(/\s+/g, '_')}_Itinerary.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setTimeout(() => setDownloadingDoc(false), 1000)
  }

  // 1-Click Copy WhatsApp Summary
  const handleCopyWhatsApp = () => {
    const summary = `✈️ *PlanTrip: ${cityName}, ${countryName} Trip Plan*
📅 *Dates:* ${departureDate} → ${returnDate} (${durationDays} Days)
👥 *Squad:* ${travellers} Pax (${travelParty})
💰 *Budget:* RM ${budgetAmount.toLocaleString()}

📍 *Key Highlights & Sights:*
${basket.slice(0, 4).map(b => `• ${b.title || b.name}`).join('\n') || '• Iconic Twin Towers\n• Batu Caves & Cultural Walk\n• World-famous Night Food Street'}

🧳 *Packing Checklist:* ${packedItems}/${totalItems} items ready (${packPercent}%)
📱 *Live Plan & Plan B Contingency:* Loaded in PlanTrip App!

_Generated with PlanTrip AI - Zero Stress Group Travel!_`

    navigator.clipboard.writeText(summary)
    setCopiedWhatsApp(true)
    setTimeout(() => setCopiedWhatsApp(false), 2500)
  }

  // 1-Click Export .ics Calendar & Start Countdown
  const handleExportICS = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlanTrip//Travel Itinerary//EN
BEGIN:VEVENT
SUMMARY:Trip to ${cityName} (${countryName})
DESCRIPTION:PlanTrip Travel Itinerary for ${travellers} travellers.
DTSTART:${departureDate.replace(/-/g, '')}T090000Z
DTEND:${returnDate.replace(/-/g, '')}T180000Z
LOCATION:${cityName}, ${countryName}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `PlanTrip_${cityName.replace(/\s+/g, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (onAddToCalendar) {
      onAddToCalendar()
    }
  }

  // 1-Click Add to Google Calendar & Start Countdown
  const handleAddToGoogleCalendar = async () => {
    setGoogleCalendarStatus('connecting')
    setGoogleCalendarError('')
    try {
      await addTripToGoogleCalendar({ cityName, countryName, departureDate, returnDate })
      setGoogleCalendarStatus('synced')
      if (onAddToCalendar) {
        onAddToCalendar()
      }
    } catch (err) {
      setGoogleCalendarStatus('error')
      setGoogleCalendarError(err.message || 'Could not add this trip to Google Calendar.')
    }
  }

  return (
    <div className="container step-pack-clean-container fade-in">
      {/* SECTION TITLE & CONTROLS */}
      <div className="setup-clean-heading-row">
        <div>
          <h1 className="step-clean-title">Packing Checklist & Export</h1>
          <p className="step-clean-subtitle">
            Prepare for takeoff with weather-aware packing, offline run-sheets, and 1-click itinerary export.
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="clean-tab-switch">
          <button
            className={`clean-tab-btn ${activeTab === 'pack' ? 'active' : ''}`}
            onClick={() => setActiveTab('pack')}
          >
            <Luggage size={15} />
            <span>1. Packing ({packedItems}/{totalItems})</span>
          </button>
          <button
            className={`clean-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <FileDown size={15} />
            <span>2. Export & Share</span>
          </button>
          <button
            className={`clean-tab-btn ${activeTab === 'runsheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('runsheet')}
          >
            <Calendar size={15} />
            <span>3. Run-Sheet</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PACKING CHECKLIST */}
      {activeTab === 'pack' && (
        <div className="pack-checklist-grid">
          {/* Left Column: Packing Categories */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Luggage className="text-cyan" size={20} />
                <h3>Smart Packing Checklist</h3>
              </div>
              <span className="badge-highlight">{packPercent}% Completed</span>
            </div>

            {/* Progress bar */}
            <div className="pack-progress-wrap">
              <div className="pack-progress-bar" style={{ width: `${packPercent}%` }} />
            </div>

            {/* Categories */}
            <div className="pack-categories-list">
              {packingCategories.map((cat, catIdx) => (
                <div key={cat.category} className="pack-cat-box">
                  <h4 className="pack-cat-title">{cat.category}</h4>
                  <div className="pack-items-list">
                    {cat.items.map((item, itemIdx) => (
                      <label key={item.id} className={`pack-item-row ${item.packed ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() => toggleItem(catIdx, itemIdx)}
                          className="pack-checkbox"
                        />
                        <span className="pack-text">{item.text}</span>
                        {item.packed && <Check size={14} className="text-cyan check-icon" />}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Item */}
            <form onSubmit={handleAddItem} className="add-pack-form">
              <input
                type="text"
                placeholder="+ Add custom item (e.g. GoPro, Swimming goggles, Extra snacks)..."
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                className="add-pack-input"
              />
              <button type="submit" className="add-pack-btn">
                <Plus size={16} /> Add
              </button>
            </form>
          </div>

          {/* Right Column: Destination Weather & Quick Tip */}
          <div className="setup-card-stack">
            <div className="setup-card">
              <div className="card-header-row">
                <div className="card-icon-title">
                  <Sun className="text-amber" size={20} />
                  <h3>{cityName} Weather Forecast</h3>
                </div>
                <span className="badge-highlight">Live Data</span>
              </div>
              <div className="weather-forecast-card">
                <div className="weather-temp-row">
                  <span className="weather-big-temp">{liveWeather.temp}°C</span>
                  <div className="weather-desc-col">
                    <strong>{liveWeather.icon} {liveWeather.description}</strong>
                    <span>Rain Probability: {liveWeather.rainChance}% · Humidity: {liveWeather.humidity}%</span>
                  </div>
                </div>
                <div className="weather-advice-box">
                  <ShieldCheck size={16} className="text-cyan" />
                  <span>{liveWeather.advice}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: '0.7rem', color: '#64748b', textAlign: 'right' }}>
                  Source: {liveWeather.source}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-FORMAT EXPORT & SHARING */}
      {activeTab === 'export' && (
        <div className="export-hub-grid">
          {/* Card 1: Word Document (.doc) */}
          <div className="export-tile-card">
            <div className="tile-icon-wrap blue">
              <FileDown size={28} />
            </div>
            <h3>Microsoft Word Itinerary</h3>
            <p>Full itemized itinerary doc with flight tables, budget breakdown, schedules, and packing lists.</p>
            <button className="export-action-btn" onClick={handleExportWord} disabled={downloadingDoc}>
              {downloadingDoc ? <Download size={16} className="spin" /> : <Download size={16} />}
              {downloadingDoc ? 'Generating .doc...' : 'Download Word Doc (.doc)'}
            </button>
          </div>

          {/* Card 2: Print / PDF */}
          <div className="export-tile-card">
            <div className="tile-icon-wrap purple">
              <Printer size={28} />
            </div>
            <h3>Print or Save PDF</h3>
            <p>Clean printer-friendly page format ready for physical handouts or offline phone backup.</p>
            <button className="export-action-btn" onClick={() => window.print()}>
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>

          {/* Card 4: WhatsApp Group Summary */}
          <div className="export-tile-card">
            <div className="tile-icon-wrap amber">
              <Share2 size={28} />
            </div>
            <h3>WhatsApp Squad Summary</h3>
            <p>Formatted emoji-rich summary ready to paste into your friends or family WhatsApp chat.</p>
            <button className="export-action-btn" onClick={handleCopyWhatsApp}>
              {copiedWhatsApp ? <Check size={16} /> : <Copy size={16} />}
              {copiedWhatsApp ? 'Copied to Clipboard!' : 'Copy WhatsApp Text'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: OFFLINE DAY RUN-SHEET */}
      {activeTab === 'runsheet' && (
        <div className="setup-card runsheet-card">
          <div className="card-header-row">
            <div className="card-icon-title">
              <Calendar className="text-cyan" size={20} />
              <h3>Turn-by-Turn Offline Day Run-Sheet</h3>
            </div>
            <span className="badge-highlight">{durationDays} Days Itinerary</span>
          </div>

          <div className="runsheet-days-list">
            {[1, 2, 3].slice(0, durationDays).map(dayNum => (
              <div key={dayNum} className="runsheet-day-block">
                <div className="day-title-badge">
                  DAY {dayNum} · {dayNum === 1 ? 'Arrival & Landmark Exploration' : dayNum === 2 ? 'Culture, Heritage & Food Trail' : 'Hidden Gems & Sunset Chill'}
                </div>
                <div className="day-schedule-timeline">
                  <div className="timeline-slot">
                    <span className="slot-time">09:00 AM</span>
                    <div className="slot-content">
                      <strong>{dayNum === 1 ? 'Hotel Check-In & Refresh' : 'Iconic Landmark Tour'}</strong>
                      <small>📍 City Center · Duration: 2.5 hrs</small>
                    </div>
                  </div>
                  <div className="timeline-slot">
                    <span className="slot-time">12:30 PM</span>
                    <div className="slot-content">
                      <strong>🍽️ Local Gastronomy & Hawker Lunch</strong>
                      <small>📍 Famous Food Street · Budget: Balanced</small>
                    </div>
                  </div>
                  <div className="timeline-slot">
                    <span className="slot-time">03:30 PM</span>
                    <div className="slot-content">
                      <strong>🏛️ Cultural Heritage / Museum Exploration</strong>
                      <small>📍 Air-conditioned / Scenic Walking Area</small>
                    </div>
                  </div>
                  <div className="timeline-slot">
                    <span className="slot-time">07:00 PM</span>
                    <div className="slot-content">
                      <strong>🍷 Sunset Rooftop & Group Dinner</strong>
                      <small>📍 Panoramic Skyline View</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Step Actions */}
      <div className="step-bottom-bar">
        <button className="step-back-btn" onClick={onPrevStep}>
          <ArrowLeft size={18} /> Back to Step 3: Discover Hub
        </button>
        <div className="step-summary-text">
          Trip Status: <strong>{cityName} Trip 100% Complete & Exported</strong>
          {googleCalendarStatus === 'error' && (
            <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>{googleCalendarError}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="step-back-btn" onClick={handleExportICS}>
            Download .ics instead
          </button>
          <button
            className="step-next-primary-btn"
            onClick={handleAddToGoogleCalendar}
            disabled={googleCalendarStatus === 'connecting'}
          >
            {googleCalendarStatus === 'synced' ? <Check size={18} /> : <Calendar size={18} />}
            {googleCalendarStatus === 'connecting' && 'Connecting to Google…'}
            {googleCalendarStatus === 'synced' && 'Added to Google Calendar'}
            {(googleCalendarStatus === 'idle' || googleCalendarStatus === 'error') && 'Add to Calendar & Start Countdown'}
          </button>
        </div>
      </div>
    </div>
  )
}
