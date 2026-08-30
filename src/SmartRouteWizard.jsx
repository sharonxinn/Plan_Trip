import React, { useState, useEffect } from 'react'
import {
  Sparkles, Calendar, Clock, MapPin, Check, ArrowRight,
  ArrowLeft, Sliders, ShieldCheck, Zap, X, Star, Utensils
} from 'lucide-react'
import { generateSmartItinerary } from './utils/routeOptimizer'

export default function SmartRouteWizard({
  isOpen,
  onClose,
  destination,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  durationDays,
  bucketList = [],
  onGeneratedRoute
}) {
  if (!isOpen) return null

  const cityName = destination?.city || 'Penang'
  const countryName = destination?.country || 'Malaysia'

  // Wizard Sub-Step: 1 | 2 | 3
  const [wizardStep, setWizardStep] = useState(1)

  // Step 2: Confirmed Spots Configuration
  const [selectedSpotsConfig, setSelectedSpotsConfig] = useState(() => {
    return bucketList.map(item => ({
      ...item,
      confirmed: true,
      isMustVisit: true,
      assignedDay: 'auto' // 'auto' | '1' | '2' | '3' ...
    }))
  })

  // Synchronize when bucketList or modal opens
  useEffect(() => {
    if (bucketList && bucketList.length > 0) {
      setSelectedSpotsConfig(bucketList.map(item => ({
        ...item,
        confirmed: true,
        isMustVisit: item.isMustVisit ?? true,
        assignedDay: item.assignedDay || 'auto'
      })))
    }
  }, [bucketList, isOpen])

  // Step 3: Starting Point & Arrival Time
  const defaultHubs = {
    'Ipoh': { name: 'Ipoh Railway Station (怡保火车站)', lat: 4.5975, lng: 101.0734 },
    'Penang': { name: 'Penang Sentral / Georgetown Ferry Hub', lat: 5.4164, lng: 100.3327 },
    'Kuala Lumpur': { name: 'KL Sentral / KLIA Terminal 1', lat: 3.1343, lng: 101.6865 },
    'Tokyo': { name: 'Tokyo Station / Haneda Airport', lat: 35.6812, lng: 139.7671 },
    'Bangkok': { name: 'Suvarnabhumi Airport / Siam Center', lat: 13.7563, lng: 100.5018 }
  }

  const defaultHub = (cityName && defaultHubs[cityName]) || (cityName && Object.keys(defaultHubs).find(k => cityName.includes(k)) && defaultHubs[Object.keys(defaultHubs).find(k => cityName.includes(k))]) || {
    name: `${cityName} Central Station / Arrival Hub`,
    lat: destination?.lat || 5.4164,
    lng: destination?.lng || 100.3327
  }

  const [startingPointName, setStartingPointName] = useState(defaultHub.name)
  const [arrivalTimeStr, setArrivalTimeStr] = useState('10:00 AM')
  const [pace, setPace] = useState('balanced') // 'relaxed' | 'balanced' | 'packed'
  const [isGenerating, setIsGenerating] = useState(false)

  // Synchronize starting point when destination changes
  useEffect(() => {
    setStartingPointName(defaultHub.name)
  }, [destination?.city])

  // Toggle Spot Confirmation
  const toggleSpotConfirmed = (id) => {
    setSelectedSpotsConfig(prev => prev.map(s => s.id === id ? { ...s, confirmed: !s.confirmed } : s))
  }

  // Toggle Must-Visit
  const toggleMustVisit = (id) => {
    setSelectedSpotsConfig(prev => prev.map(s => s.id === id ? { ...s, isMustVisit: !s.isMustVisit } : s))
  }

  // Change Assigned Day
  const handleAssignDay = (id, dayVal) => {
    setSelectedSpotsConfig(prev => prev.map(s => s.id === id ? { ...s, assignedDay: dayVal } : s))
  }

  // 1-Click AI Auto Assign
  const handleAIAutoAssign = () => {
    const days = Math.max(1, durationDays)
    setSelectedSpotsConfig(prev => prev.map((s, idx) => ({
      ...s,
      confirmed: true,
      assignedDay: ((idx % days) + 1).toString()
    })))
  }

  // Generate Smart Route Execution
  const handleExecuteGeneration = () => {
    setIsGenerating(true)
    const confirmedItems = selectedSpotsConfig.filter(s => s.confirmed)

    setTimeout(() => {
      const result = generateSmartItinerary({
        durationDays,
        startingPoint: {
          name: startingPointName,
          lat: destination?.lat || defaultHub.lat,
          lng: destination?.lng || defaultHub.lng
        },
        arrivalTimeStr,
        confirmedItems,
        pace
      })

      onGeneratedRoute(result)
      setIsGenerating(false)
      onClose()
    }, 700)
  }

  return (
    <div className="smart-wizard-backdrop" onClick={onClose}>
      <div className="smart-wizard-modal" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="wizard-header-row">
          <div className="wizard-title-group">
            <div className="wizard-icon-badge">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="wizard-modal-title">⚡ Generate Smart Route 一键智能行程</h2>
              <p className="wizard-subtitle">
                3-Step non-backtracking route optimization for {cityName}, {countryName}
              </p>
            </div>
          </div>
          <button className="wizard-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 3-STEP PROGRESS STEPPER */}
        <div className="wizard-stepper-bar">
          <div className={`wizard-step-node ${wizardStep >= 1 ? 'active' : ''} ${wizardStep === 1 ? 'current' : ''}`}>
            <span className="step-badge">1</span>
            <span className="step-title">出行日期与天数</span>
          </div>
          <div className="wizard-step-line" />
          <div className={`wizard-step-node ${wizardStep >= 2 ? 'active' : ''} ${wizardStep === 2 ? 'current' : ''}`}>
            <span className="step-badge">2</span>
            <span className="step-title">确认愿望清单</span>
          </div>
          <div className="wizard-step-line" />
          <div className={`wizard-step-node ${wizardStep >= 3 ? 'active' : ''} ${wizardStep === 3 ? 'current' : ''}`}>
            <span className="step-badge">3</span>
            <span className="step-title">起点与抵达时间</span>
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="wizard-body-content">
          {/* ================= STEP 1: DATES & DURATION ================= */}
          {wizardStep === 1 && (
            <div className="wizard-step-panel fade-in">
              <h3 className="panel-section-title">📅 第一步：输入出行日期与游玩天数</h3>
              <p className="panel-section-desc">
                选择你的出发与返程日期，系统将根据天数自动优化每日游玩节奏。
              </p>

              <div className="dates-inputs-grid">
                <div className="date-input-box">
                  <label>出发日期 (Departure)</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={e => onDepartureDateChange(e.target.value)}
                    className="wizard-date-input"
                  />
                </div>
                <div className="date-input-box">
                  <label>返程日期 (Return)</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => onReturnDateChange(e.target.value)}
                    className="wizard-date-input"
                  />
                </div>
              </div>

              <div className="duration-highlight-card">
                <div className="duration-pill">
                  <strong>{durationDays} Days · {Math.max(1, durationDays - 1)} Nights ({durationDays}D{Math.max(1, durationDays - 1)}N)</strong>
                </div>
                <span>✨ Destination: <strong>{cityName}, {countryName}</strong></span>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CONFIRM & ASSIGN BUCKET LIST ================= */}
          {wizardStep === 2 && (
            <div className="wizard-step-panel fade-in">
              <div className="panel-header-flex">
                <div>
                  <h3 className="panel-section-title">📍 第二步：确认与勾选群里丢过的地点</h3>
                  <p className="panel-section-desc">
                    勾选 Confirm 哪些一定要去、哪些想排在第几天，或点击交由 AI 推荐安排。
                  </p>
                </div>
                <button className="btn-ai-auto-assign" onClick={handleAIAutoAssign}>
                  <Sparkles size={14} /> AI 推荐智能分配
                </button>
              </div>

              <div className="wizard-spots-list">
                {selectedSpotsConfig.map(spot => (
                  <div key={spot.id} className={`wizard-spot-row ${spot.confirmed ? 'confirmed' : 'unconfirmed'}`}>
                    <label className="spot-checkbox-label">
                      <input
                        type="checkbox"
                        checked={spot.confirmed}
                        onChange={() => toggleSpotConfirmed(spot.id)}
                        className="spot-checkbox"
                      />
                      <div className="spot-info-col">
                        <div className="spot-title-line">
                          <strong>{spot.name}</strong>
                          {spot.suggestedBy && (
                            <span className="spot-suggester-tag">👤 {spot.suggestedBy}</span>
                          )}
                        </div>
                        <span className="spot-cat-text">{spot.category || spot.type}</span>
                      </div>
                    </label>

                    {spot.confirmed && (
                      <div className="spot-controls-group">
                        <button
                          type="button"
                          className={`btn-must-visit-toggle ${spot.isMustVisit ? 'active' : ''}`}
                          onClick={() => toggleMustVisit(spot.id)}
                          title="Mark as Must-Visit"
                        >
                          <Star size={13} fill={spot.isMustVisit ? '#f59e0b' : 'none'} color={spot.isMustVisit ? '#f59e0b' : '#94a3b8'} />
                          <span>{spot.isMustVisit ? '必去 ⭐' : '可选'}</span>
                        </button>

                        <select
                          value={spot.assignedDay}
                          onChange={e => handleAssignDay(spot.id, e.target.value)}
                          className="spot-day-select"
                        >
                          <option value="auto">🤖 AI 智能安排</option>
                          {Array.from({ length: durationDays }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d.toString()}>Day {d}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 3: STARTING POINT & ARRIVAL TIME ================= */}
          {wizardStep === 3 && (
            <div className="wizard-step-panel fade-in">
              <h3 className="panel-section-title">🚀 第三步：输入起点枢纽与抵达时间</h3>
              <p className="panel-section-desc">
                系统将以此为起点，计算经纬度距离，绝不走回头路，避开未开门时段！
              </p>

              <div className="form-group-field">
                <label>起点 / 抵步枢纽 (Starting Point Hub)</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="text-cyan input-icon" />
                  <input
                    type="text"
                    value={startingPointName}
                    onChange={e => setStartingPointName(e.target.value)}
                    placeholder={`e.g. ${cityName} Railway Station, Airport, or Hotel...`}
                    className="wizard-text-input"
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-field">
                  <label>Day 1 抵达 / 出发时间 (Arrival Time)</label>
                  <div className="input-with-icon">
                    <Clock size={16} className="text-amber input-icon" />
                    <select
                      value={arrivalTimeStr}
                      onChange={e => setArrivalTimeStr(e.target.value)}
                      className="wizard-select"
                    >
                      <option value="08:00 AM">08:00 AM (Early Bird Morning)</option>
                      <option value="09:00 AM">09:00 AM (Standard Morning)</option>
                      <option value="10:00 AM">10:00 AM (Recommended 10:00 AM)</option>
                      <option value="11:30 AM">11:30 AM (Pre-Lunch Arrival)</option>
                      <option value="01:30 PM">01:30 PM (Afternoon Arrival)</option>
                      <option value="03:30 PM">03:30 PM (Late Afternoon Check-In)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-field">
                  <label>行程节奏 (Trip Pace)</label>
                  <div className="input-with-icon">
                    <Sliders size={16} className="text-cyan input-icon" />
                    <select
                      value={pace}
                      onChange={e => setPace(e.target.value)}
                      className="wizard-select"
                    >
                      <option value="relaxed">☕ 轻松休闲 (Relaxed 2-3 spots/day)</option>
                      <option value="balanced">⚡ 黄金平衡 (Balanced 4 spots/day)</option>
                      <option value="packed">🚀 高效特种兵 (High Pace 5-6 spots/day)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="smart-optimizer-summary-box">
                <div className="summary-icon-title">
                  <Zap size={18} className="text-cyan" />
                  <strong>智能排程引擎准备就绪：</strong>
                </div>
                <ul>
                  <li>✅ 自动计算每个地点的经纬度距离，按最短非循环路径排定（不走回头路）。</li>
                  <li>✅ 对齐营业时间与用餐时段（早茶 ➔ 上午景点 ➔ 午餐 ➔ 下午茶/室内 ➔ 日落 ➔ 晚餐）。</li>
                  <li>✅ 一键生成完整多日时间轴与 Google Maps 导航连线路网！</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="wizard-footer-row">
          {wizardStep > 1 ? (
            <button className="btn-wizard-back" onClick={() => setWizardStep(prev => prev - 1)}>
              <ArrowLeft size={16} /> 上一步
            </button>
          ) : (
            <button className="btn-wizard-cancel" onClick={onClose}>
              取消
            </button>
          )}

          {wizardStep < 3 ? (
            <button className="btn-wizard-next" onClick={() => setWizardStep(prev => prev + 1)}>
              下一步 <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn-wizard-generate-execute"
              onClick={handleExecuteGeneration}
              disabled={isGenerating}
            >
              {isGenerating ? <Zap size={16} className="spin" /> : <Sparkles size={16} />}
              {isGenerating ? 'AI 正在计算最优路线...' : '⚡ 一键生成智能行程 (Generate Smart Route)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
