import React, { useState, useRef, useMemo } from 'react'
import {
  Route, MapPin, Plus, X, ArrowUp, ArrowDown, Repeat,
  ImagePlus, Camera, PieChart as PieChartIcon
} from 'lucide-react'
import { countriesData } from './data/destinationsData'
import Globe3D from './Globe3D'

const STORAGE_KEY = 'plantrip_journey_memory_v1'
const MAX_PHOTOS = 3

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

// Flatten every city across every country into a single pickable list
const ALL_STOPS = countriesData.flatMap(c =>
  c.places.map(p => ({
    id: p.id,
    city: p.city,
    country: c.country,
    flag: c.flag,
    lat: p.lat,
    lng: p.lng
  }))
)
const findStop = id => ALL_STOPS.find(s => s.id === id)
const HOME_STOP = ALL_STOPS.find(s => s.id === 'kuala-lumpur') || ALL_STOPS[0]
const TOKYO_STOP = ALL_STOPS.find(s => s.id === 'tokyo')
const BANGKOK_STOP = ALL_STOPS.find(s => s.id === 'bangkok')

// Validated categorical palette (fixed order — see dataviz skill)
const PIE_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']

export default function JourneyMapPage({
  selectedCity,
  selectedCountry,
  travellers = 1,
  budgetCategories = [],
  initialBudget = 0,
  totalActual = 0
}) {
  const currentStop = selectedCity && selectedCity.lat != null
    ? {
        id: selectedCity.id || 'current-destination',
        city: selectedCity.city,
        country: selectedCountry?.country || '',
        flag: selectedCountry?.flag || '📍',
        lat: selectedCity.lat,
        lng: selectedCity.lng
      }
    : TOKYO_STOP

  const defaultStops = useMemo(() => {
    if (HOME_STOP && currentStop && HOME_STOP.id !== currentStop.id) {
      return [HOME_STOP, currentStop, HOME_STOP]
    }
    return [HOME_STOP, TOKYO_STOP, HOME_STOP].filter(Boolean)
  }, [])

  const saved = readJSON(STORAGE_KEY, null)
  const [stops, setStops] = useState(saved?.stops?.length >= 2 ? saved.stops : defaultStops)
  const [images, setImages] = useState(saved?.images || [])
  const [pickerValue, setPickerValue] = useState('')
  const [activeStopIndex, setActiveStopIndex] = useState(0)
  const fileInputRef = useRef(null)

  const persist = (nextStops, nextImages) => {
    writeJSON(STORAGE_KEY, { stops: nextStops ?? stops, images: nextImages ?? images })
  }

  const addStop = () => {
    const stop = findStop(pickerValue)
    if (!stop) return
    const next = [...stops, stop]
    setStops(next)
    persist(next, undefined)
    setPickerValue('')
  }

  const removeStop = (idx) => {
    const next = stops.filter((_, i) => i !== idx)
    setStops(next)
    persist(next, undefined)
  }

  const moveStop = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= stops.length) return
    const next = [...stops]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setStops(next)
    persist(next, undefined)
  }

  const applyPreset = (preset) => {
    setStops(preset)
    persist(preset, undefined)
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - images.length)
    if (files.length === 0) return
    let pending = files.length
    const collected = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        collected.push(ev.target.result)
        pending -= 1
        if (pending === 0) {
          const next = [...images, ...collected].slice(0, MAX_PHOTOS)
          setImages(next)
          persist(undefined, next)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx) => {
    const next = images.filter((_, i) => i !== idx)
    setImages(next)
    persist(undefined, next)
  }

  // Pie chart geometry
  const pieTotal = budgetCategories.reduce((sum, c) => sum + c.actual, 0) || 1
  let cumulativeAngle = -90
  const pieSlices = budgetCategories.map((cat, i) => {
    const fraction = cat.actual / pieTotal
    const startAngle = cumulativeAngle
    const sweep = fraction * 360
    cumulativeAngle += sweep
    const endAngle = cumulativeAngle
    const toRad = deg => (deg * Math.PI) / 180
    const cx = 110, cy = 110, r = 100
    const x1 = cx + r * Math.cos(toRad(startAngle))
    const y1 = cy + r * Math.sin(toRad(startAngle))
    const x2 = cx + r * Math.cos(toRad(endAngle))
    const y2 = cy + r * Math.sin(toRad(endAngle))
    const largeArc = sweep > 180 ? 1 : 0
    const midAngle = toRad((startAngle + endAngle) / 2)
    const labelX = cx + (r * 0.68) * Math.cos(midAngle)
    const labelY = cy + (r * 0.68) * Math.sin(midAngle)
    return {
      ...cat,
      color: PIE_COLORS[i % PIE_COLORS.length],
      path: `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
      pct: Math.round(fraction * 100),
      labelX,
      labelY
    }
  })

  const activeStopIndexClamped = Math.min(activeStopIndex, stops.length - 1)
  const activeStop = stops[activeStopIndexClamped] || stops[0]

  return (
    <div className="journey-memory-pane fade-in">
      {/* ROUTE MAP BUILDER */}
      <div className="journey-map-card">
        <div className="card-inner-header">
          <h3><Route size={18} className="text-teal" /> Your Journey Route</h3>
          <p>Pick a starting point and add each next stop — we'll draw the direction on the map, just like mult.dev.</p>
        </div>

        <div className="journey-preset-row">
          <button
            className="btn-journey-preset"
            onClick={() => applyPreset([HOME_STOP, TOKYO_STOP, HOME_STOP].filter(Boolean))}
          >
            <Repeat size={13} /> KL → Japan → KL
          </button>
          <button
            className="btn-journey-preset"
            onClick={() => applyPreset([HOME_STOP, BANGKOK_STOP, HOME_STOP].filter(Boolean))}
          >
            <Repeat size={13} /> KL → Thailand → KL
          </button>
        </div>

        <div className="journey-stop-picker-row">
          <select
            className="journey-stop-select"
            value={pickerValue}
            onChange={e => setPickerValue(e.target.value)}
          >
            <option value="">+ Add a stop…</option>
            {countriesData.map(c => (
              <optgroup key={c.code} label={`${c.flag} ${c.country}`}>
                {c.places.map(p => (
                  <option key={p.id} value={p.id}>{p.city}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button className="btn-clean-primary" onClick={addStop} disabled={!pickerValue}>
            <Plus size={15} /> Add Stop
          </button>
        </div>

        {/* Stop order list */}
        <div className="journey-stops-list">
          {stops.map((s, idx) => (
            <div key={`${s.id}-${idx}`} className="journey-stop-chip">
              <span className="stop-order-badge">{idx + 1}</span>
              <span className="stop-flag">{s.flag}</span>
              <span className="stop-name">{s.city}</span>
              <div className="stop-chip-actions">
                <button title="Move earlier" onClick={() => moveStop(idx, -1)} disabled={idx === 0}><ArrowUp size={13} /></button>
                <button title="Move later" onClick={() => moveStop(idx, 1)} disabled={idx === stops.length - 1}><ArrowDown size={13} /></button>
                <button title="Remove stop" onClick={() => removeStop(idx)} disabled={stops.length <= 2}><X size={13} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Earth Route Diagram + Flight-Through Side Panel */}
        <div className="journey-globe-row">
          <div className="journey-globe-wrapper">
            <Globe3D routeStops={stops} onStopReached={(_, idx) => setActiveStopIndex(idx)} />
          </div>

          <div className="journey-playback-panel">
            <div className="playback-current-stop">
              <span className="playback-eyebrow">Currently at</span>
              <h4>
                {activeStop.flag} {activeStop.city}
                <small> · Stop {activeStopIndexClamped + 1} of {stops.length}</small>
              </h4>
            </div>

            <div className="playback-photos">
              <span className="playback-section-label">
                <Camera size={13} /> Memory Photos
              </span>
              {images.length > 0 ? (
                <div className="playback-photos-grid">
                  {images.map((src, idx) => (
                    <img key={idx} src={src} alt={`Trip memory ${idx + 1}`} />
                  ))}
                </div>
              ) : (
                <p className="playback-empty-hint">Add photos below to see them here.</p>
              )}
            </div>

            {pieSlices.length > 0 && (
              <div className="playback-budget">
                <span className="playback-section-label">
                  <PieChartIcon size={13} /> Budget Summary
                </span>
                <strong className="playback-budget-total">RM {totalActual.toLocaleString()} total</strong>
                <div className="playback-budget-rows">
                  {pieSlices.slice(0, 3).map((slice, i) => (
                    <div key={i} className="playback-budget-row">
                      <span className="pie-legend-swatch" style={{ background: slice.color }} />
                      <span>{slice.name}</span>
                      <strong>{slice.pct}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="journey-route-breadcrumb">
          {stops.map(s => s.city).join('  →  ')}
        </p>
      </div>

      {/* PHOTO ALBUM */}
      <div className="journey-photos-card">
        <div className="card-inner-header">
          <h3><Camera size={18} className="text-teal" /> Memory Photos</h3>
          <p>Upload 1–3 photos from this trip to keep alongside the route.</p>
        </div>

        <div className="journey-photos-grid">
          {images.map((src, idx) => (
            <div key={idx} className="journey-photo-thumb">
              <img src={src} alt={`Trip memory ${idx + 1}`} />
              <button className="btn-remove-photo" onClick={() => removeImage(idx)}><X size={13} /></button>
            </div>
          ))}
          {images.length < MAX_PHOTOS && (
            <button className="journey-photo-add-tile" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={22} />
              <span>Add Photo</span>
              <small>{images.length}/{MAX_PHOTOS}</small>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handlePhotoUpload}
        />
      </div>

      {/* BUDGET PIE CHART */}
      {budgetCategories.length > 0 && (
        <div className="journey-budget-pie-card">
          <div className="card-inner-header">
            <h3><PieChartIcon size={18} className="text-teal" /> Budget Split Summary</h3>
            <p>Where the RM {totalActual.toLocaleString()} actual spend went, split across {travellers} traveller{travellers > 1 ? 's' : ''}.</p>
          </div>

          <div className="journey-pie-body">
            <svg viewBox="0 0 220 220" className="journey-pie-svg" role="img" aria-label="Budget split by category">
              {pieSlices.map((slice, i) => (
                <path key={i} d={slice.path} fill={slice.color} stroke="#FFFFFF" strokeWidth="2" />
              ))}
              {pieSlices.filter(s => s.pct >= 8).map((slice, i) => (
                <text
                  key={i}
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                  fill="#FFFFFF"
                >
                  {slice.pct}%
                </text>
              ))}
            </svg>

            <div className="journey-pie-legend">
              {pieSlices.map((slice, i) => (
                <div key={i} className="pie-legend-row">
                  <span className="pie-legend-swatch" style={{ background: slice.color }} />
                  <span className="pie-legend-label">{slice.icon} {slice.name}</span>
                  <span className="pie-legend-value">RM {slice.actual.toLocaleString()} · {slice.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
