import React, { useState } from 'react'
import {
  DollarSign, Zap, ArrowLeft, ShieldCheck, CheckCircle2,
  Calendar, MapPin, Umbrella, Clock, Phone, Share2
} from 'lucide-react'
import StepBudgetSplitter from './StepBudgetSplitter'
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
  const [activeTab, setActiveTab] = useState('splitter') // 'splitter' | 'planb'

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
            <span className="stage-phase-badge intrip">Stage 2 · Travelling Companion</span>
            <h1 className="stage-headline-title">In-Trip Expenses, Receipt Scanner & Plan B</h1>
            <p className="stage-headline-sub">
              Scan restaurant receipts on the go, itemize food & drinks across squad members, settle debts with 1-click, and access zero-panic contingencies.
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
            <span>1. 🧾 Expense Splitter & Receipt Scanner</span>
          </button>
          <button
            className={`travelling-tab-btn ${activeTab === 'planb' ? 'active' : ''}`}
            onClick={() => setActiveTab('planb')}
          >
            <Zap size={16} />
            <span>2. ⚡ Plan B Contingency</span>
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
              onNextStep={() => setActiveTab('planb')}
              onPrevStep={onBackToDashboard}
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
              onPrevStep={() => setActiveTab('splitter')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
