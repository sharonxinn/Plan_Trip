import React, { useState } from 'react'
import {
  DollarSign, Zap, ArrowLeft, ShieldCheck, CheckCircle2,
  Calendar, MapPin, Umbrella, Clock, Phone, Share2, Train
} from 'lucide-react'
import StepBudgetSplitter from './StepBudgetSplitter'
import StepMalaysiaTransit from './StepMalaysiaTransit'
import StepPlanBStudio from './StepPlanBStudio'

export default function StageTravelling({
  selectedCity,
  selectedCountry,
  departureDate,
  returnDate,
  durationDays,
  travellers,
  travelParty,
  members = [],
  setMembers,
  budgetAmount,
  budgetTier,
  basket = [],
  onApplyPlanB,
  onBackToDashboard
}) {
  const [activeTab, setActiveTab] = useState('splitter') // 'splitter' | 'transit' | 'planb'

  return (
    <div className="stage-travelling-container fade-in">
      {/* 1. TOP STAGE HEADER */}
      <div className="stage-view-top-header">
        <div className="stage-header-title-col">
          <button className="btn-back-to-dashboard" onClick={onBackToDashboard}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <div className="stage-headline-group">
            <span className="stage-phase-badge intrip">On the trip</span>
            <h1 className="stage-headline-title">Everything you need while you’re away.</h1>
            <p className="stage-headline-sub">
              Split a bill, find your train, or make a backup plan.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="travelling-tab-switcher">
          <button
            className={`travelling-tab-btn ${activeTab === 'splitter' ? 'active' : ''}`}
            onClick={() => setActiveTab('splitter')}
          >
            <DollarSign size={16} />
            <span>Split expenses</span>
          </button>
          <button
            className={`travelling-tab-btn ${activeTab === 'transit' ? 'active' : ''}`}
            onClick={() => setActiveTab('transit')}
          >
            <Train size={16} />
            <span>Local transport</span>
          </button>
          <button
            className={`travelling-tab-btn ${activeTab === 'planb' ? 'active' : ''}`}
            onClick={() => setActiveTab('planb')}
          >
            <Zap size={16} />
            <span>Backup plans</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT */}
      <div className="travelling-tab-content">
        {activeTab === 'splitter' && (
          <div className="travelling-tab-pane fade-in">
            <StepBudgetSplitter
              isTravellingMode={true}
              budgetAmount={budgetAmount}
              setBudgetAmount={() => {}}
              budgetTier={budgetTier}
              setBudgetTier={() => {}}
              travellers={travellers}
              durationDays={durationDays}
              members={members}
              setMembers={setMembers}
              selectedCity={selectedCity}
              travelParty={travelParty}
              basket={basket}
              onNextStep={() => setActiveTab('transit')}
              onPrevStep={onBackToDashboard}
            />
          </div>
        )}

        {activeTab === 'transit' && (
          <div className="travelling-tab-pane fade-in">
            <StepMalaysiaTransit
              selectedCity={selectedCity}
              durationDays={durationDays}
              onNextStep={() => setActiveTab('planb')}
              onPrevStep={() => setActiveTab('splitter')}
            />
          </div>
        )}

        {activeTab === 'planb' && (
          <div className="travelling-tab-pane fade-in">
            <StepPlanBStudio
              destination={selectedCity}
              travellers={travellers}
              travelParty={travelParty}
              departureDate={departureDate}
              returnDate={returnDate}
              durationDays={durationDays}
              budgetAmount={budgetAmount}
              basket={basket}
              onApplyPlanB={onApplyPlanB}
              onNextStep={() => {}}
              onPrevStep={() => setActiveTab('transit')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
