import React, { useState, useEffect, useMemo } from 'react'
import {
  DollarSign, PieChart, Users, ArrowRight, ArrowLeft, Plus,
  Trash2, Check, ShieldCheck, Zap, Receipt, Calculator,
  Share2, Sparkles, TrendingUp, AlertTriangle, Coins, RefreshCw
} from 'lucide-react'

export default function StepBudgetSplitter({
  budgetAmount,
  setBudgetAmount,
  budgetTier,
  setBudgetTier,
  travellers,
  durationDays,
  members = [],
  basket = [],
  selectedFlight,
  selectedHotel,
  onNextStep,
  onPrevStep
}) {
  const [currency, setCurrency] = useState('MYR')
  const [activeTab, setActiveTab] = useState('allocator') // 'allocator' | 'splitter'
  const [ratesData, setRatesData] = useState({
    MYR: 1.0, USD: 0.22, SGD: 0.30, EUR: 0.21, GBP: 0.18, JPY: 34.2, THB: 8.1,
    AUD: 0.35, KRW: 305, VND: 5600, IDR: 3600, CNY: 1.62
  })
  const [ratesSource, setRatesSource] = useState('Live Forex Feed')
  
  // Fetch real-time live currency exchange rates
  useEffect(() => {
    fetch('/api/currency/rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates) {
          setRatesData(data.rates)
          if (data.source) setRatesSource(data.source)
        }
      })
      .catch(() => {})
  }, [])

  // Currency symbols mapping
  const currencySymbols = {
    MYR: { symbol: 'RM', name: 'Malaysian Ringgit' },
    USD: { symbol: '$', name: 'US Dollar' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    THB: { symbol: '฿', name: 'Thai Baht' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    KRW: { symbol: '₩', name: 'South Korean Won' },
    VND: { symbol: '₫', name: 'Vietnamese Dong' },
    IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' }
  }

  const currRate = ratesData[currency] || 1.0
  const curr = {
    symbol: currencySymbols[currency]?.symbol || currency,
    rate: currRate,
    name: currencySymbols[currency]?.name || currency
  }

  // Presets
  const budgetPresets = [
    { id: 'budget', label: 'Budget ($)', baseAmount: 1800, desc: 'Hostels, public transit, street food' },
    { id: 'balanced', label: 'Balanced ($$)', baseAmount: 3800, desc: '3-4★ hotels, mixed dining, top sights' },
    { id: 'premium', label: 'Premium ($$$)', baseAmount: 7200, desc: '4-5★ boutique stays, fine dining, private tours' },
    { id: 'luxury', label: 'Luxury ($$$$)', baseAmount: 14000, desc: '5★ luxury resorts, Michelin dining, VIP experiences' }
  ]

  // Handle Preset Pick
  const handleSelectPreset = preset => {
    setBudgetTier(preset.id)
    setBudgetAmount(preset.baseAmount)
  }

  // Handle Custom Input
  const handleAmountChange = val => {
    const num = Math.max(100, Number(val) || 0)
    setBudgetAmount(num)
    if (num < 2200) setBudgetTier('budget')
    else if (num <= 5000) setBudgetTier('balanced')
    else if (num <= 9500) setBudgetTier('premium')
    else setBudgetTier('luxury')
  }

  const safeBudgetAmount = Math.max(100, Number(budgetAmount) || 3800)

  // Dynamic Healthy Budget Ratios
  const categoryAllocations = useMemo(() => {
    const total = safeBudgetAmount
    return {
      accommodation: { label: '🏨 Stays & Accommodation', pct: 35, amount: Math.round(total * 0.35), icon: '🏨' },
      flightsTransport: { label: '✈️ Flights & Transit', pct: 25, amount: Math.round(total * 0.25), icon: '✈️' },
      foodDining: { label: '🍽️ Food & Dining', pct: 20, amount: Math.round(total * 0.20), icon: '🍽️' },
      activities: { label: '🎟️ Activities & Attractions', pct: 15, amount: Math.round(total * 0.15), icon: '🎟️' },
      contingency: { label: '🛡️ Emergency & Buffer Fund', pct: 5, amount: Math.round(total * 0.05), icon: '🛡️' }
    }
  }, [safeBudgetAmount])

  // Real Cost Incurred so far from Basket & Selections
  const actualCostSoFar = useMemo(() => {
    let sum = 0
    if (selectedFlight) sum += (selectedFlight.totalPrice || selectedFlight.price || 400)
    if (selectedHotel) sum += (selectedHotel.totalPrice || selectedHotel.price || 600)
    basket.forEach(item => {
      if (item.type === 'attraction' || item.category) {
        sum += 35 * travellers
      } else {
        const tierCost = item.priceTier === '$' ? 18 : item.priceTier === '$$' ? 45 : item.priceTier === '$$$' ? 120 : 250
        sum += tierCost * travellers
      }
    })
    return sum
  }, [basket, selectedFlight, selectedHotel, travellers])

  const perPersonPlanned = Math.round(budgetAmount / Math.max(1, travellers))
  const remainingBudget = Math.max(0, budgetAmount - actualCostSoFar)
  const isOverBudget = actualCostSoFar > budgetAmount

  // --- GROUP EXPENSE SPLITTER STATE ---
  const [expenses, setExpenses] = useState([
    { id: 'exp-1', title: 'Roundtrip Flights (AirAsia)', amount: 1200, paidBy: members[0]?.name || 'You (Organizer)', category: 'Flights' },
    { id: 'exp-2', title: '4-Star Hotel Booking', amount: 950, paidBy: members[0]?.name || 'You (Organizer)', category: 'Stays' },
    { id: 'exp-3', title: 'Signature Seafood Dinner', amount: 320, paidBy: members[1]?.name || 'Pei Shan', category: 'Dining' },
    { id: 'exp-4', title: 'Grab Taxi & Airport Transfers', amount: 140, paidBy: members[2]?.name || 'Vicky', category: 'Transport' }
  ])

  const [newExpTitle, setNewExpTitle] = useState('')
  const [newExpAmount, setNewExpAmount] = useState('')
  const [newExpPaidBy, setNewExpPaidBy] = useState(members[0]?.name || 'You (Organizer)')
  const [copiedSettlement, setCopiedSettlement] = useState(false)

  // Add new real expense
  const handleAddExpense = e => {
    e.preventDefault()
    if (!newExpTitle.trim() || !newExpAmount) return
    const newExp = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      amount: Math.max(1, Number(newExpAmount) || 0),
      paidBy: newExpPaidBy,
      category: 'General'
    }
    setExpenses([...expenses, newExp])
    setNewExpTitle('')
    setNewExpAmount('')
  }

  // Delete expense
  const handleDeleteExpense = id => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  // Calculate settlement balances ("Who owes who")
  const settlementData = useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const memberCount = Math.max(1, members.length || travellers)
    const fairSharePerPax = totalSpent / memberCount

    // Map how much each member has paid
    const paidByMember = {}
    members.forEach(m => { paidByMember[m.name] = 0 })
    expenses.forEach(e => {
      paidByMember[e.paidBy] = (paidByMember[e.paidBy] || 0) + e.amount
    })

    // Compute balance (positive = gets refund, negative = owes money)
    const balances = []
    Object.keys(paidByMember).forEach(name => {
      const paid = paidByMember[name]
      const net = paid - fairSharePerPax
      balances.push({ name, paid, fairShare: fairSharePerPax, net })
    })

    // Minimal transaction settlement algorithm
    const debtors = balances.filter(b => b.net < -0.5).map(b => ({ ...b, net: -b.net }))
    const creditors = balances.filter(b => b.net > 0.5).map(b => ({ ...b }))
    const transactions = []

    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]
      const settleAmount = Math.min(debtor.net, creditor.net)

      if (settleAmount > 0.5) {
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.round(settleAmount)
        })
      }

      debtor.net -= settleAmount
      creditor.net -= settleAmount

      if (debtor.net <= 0.5) i++
      if (creditor.net <= 0.5) j++
    }

    return { totalSpent, fairSharePerPax: Math.round(fairSharePerPax), balances, transactions }
  }, [expenses, members, travellers])

  // Copy Settlement to Clipboard
  const handleCopySettlement = () => {
    const lines = [
      `💰 PlanTrip Group Expense Settlement`,
      `Total Spent: ${curr.symbol} ${settlementData.totalSpent.toLocaleString()}`,
      `Fair Share Per Person: ${curr.symbol} ${settlementData.fairSharePerPax.toLocaleString()}`,
      ``,
      `--- Minimal Transfers to Settle ---`,
      ...settlementData.transactions.map(t => `👉 ${t.from} pays ${t.to}: ${curr.symbol} ${t.amount}`),
      ``,
      `Generated by PlanTrip AI · Less Stress, Fair Travel!`
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    setCopiedSettlement(true)
    setTimeout(() => setCopiedSettlement(false), 2500)
  }

  return (
    <div className="step-budget-container fade-in">
      {/* Hero Header */}
      <div className="step-hero-card">
        <div className="step-badge-row">
          <span className="step-pill-number">Step 2 of 6</span>
          <span className="step-pill-tag">💰 Smart Budgeting & Group Splitter</span>
          <span className="step-mode-pill budget">
            {curr.symbol} {Math.round(budgetAmount * curr.rate).toLocaleString()} Total ({curr.symbol} {Math.round(perPersonPlanned * curr.rate).toLocaleString()}/pax)
          </span>
        </div>

        <h1 className="step-main-title">
          Smart Budgeting with Zero Financial Stress
        </h1>
        <p className="step-subtitle">
          Allocate your trip funds across stays, dining, and activities with an automated 5% emergency buffer. Split group expenses with 1-click debt settlement so no one has awkward money talks.
        </p>

        {/* Currency & Sub Tabs */}
        <div className="budget-top-controls-row">
          <div className="sub-tab-group">
            <button
              className={`sub-tab-btn ${activeTab === 'allocator' ? 'active' : ''}`}
              onClick={() => setActiveTab('allocator')}
            >
              <PieChart size={16} />
              1. Budget Allocator & Targets
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'splitter' ? 'active' : ''}`}
              onClick={() => setActiveTab('splitter')}
            >
              <Receipt size={16} />
              2. Group Bill Splitter ({expenses.length} Logged)
            </button>
          </div>

          <div className="currency-selector-box">
            <Coins size={16} className="text-cyan" />
            <span className="curr-label">Currency:</span>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="currency-dropdown"
            >
              {Object.keys(currencySymbols).map(k => (
                <option key={k} value={k}>
                  {currencySymbols[k].symbol} ({k}) - {currencySymbols[k].name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: BUDGET ALLOCATOR */}
      {activeTab === 'allocator' && (
        <div className="budget-allocator-grid">
          {/* Left Column: Target Budget Input & Presets */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <DollarSign className="text-cyan" size={20} />
                <h3>Set Total Trip Target</h3>
              </div>
              <span className="badge-highlight">{travellers} Pax · {durationDays} Days</span>
            </div>

            {/* Custom Amount Input Box */}
            <div className="budget-input-hero-box">
              <span className="currency-hero-symbol">{curr.symbol}</span>
              <input
                type="number"
                value={Math.round(budgetAmount * curr.rate)}
                onChange={e => handleAmountChange(Number(e.target.value) / curr.rate)}
                className="budget-hero-input"
                step="50"
                min="100"
              />
              <span className="currency-hero-suffix">{currency} Total</span>
            </div>

            <div className="per-person-indicator">
              = <strong>{curr.symbol} {Math.round(perPersonPlanned * curr.rate).toLocaleString()}</strong> per person ({curr.symbol} {Math.round((perPersonPlanned / durationDays) * curr.rate)}/day)
            </div>

            {/* Tier Preset Buttons */}
            <div className="budget-presets-stack">
              {budgetPresets.map(preset => {
                const isSelected = budgetTier === preset.id
                const converted = Math.round(preset.baseAmount * curr.rate)
                return (
                  <button
                    key={preset.id}
                    className={`budget-preset-tile ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <div className="preset-tile-left">
                      <div className="preset-tile-label">{preset.label}</div>
                      <div className="preset-tile-desc">{preset.desc}</div>
                    </div>
                    <div className="preset-tile-right">
                      <div className="preset-tile-amount">{curr.symbol} {converted.toLocaleString()}</div>
                      {isSelected && <Check size={16} className="text-cyan" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Automated Category Breakdown */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <PieChart className="text-cyan" size={20} />
                <h3>Automated Healthy Category Split</h3>
              </div>
              <span className="badge-highlight">Zero Stress Buffer Included</span>
            </div>

            <div className="category-bars-list">
              {Object.keys(categoryAllocations).map(key => {
                const cat = categoryAllocations[key]
                const convertedAmount = Math.round(cat.amount * curr.rate)
                const isBuffer = key === 'contingency'
                return (
                  <div key={key} className={`category-bar-row ${isBuffer ? 'buffer-row' : ''}`}>
                    <div className="cat-bar-header">
                      <span className="cat-name">{cat.label}</span>
                      <span className="cat-values">
                        <strong className="cat-amount">{curr.symbol} {convertedAmount.toLocaleString()}</strong>
                        <span className="cat-pct">({cat.pct}%)</span>
                      </span>
                    </div>
                    <div className="cat-progress-track">
                      <div
                        className={`cat-progress-fill ${key}`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Budget Health Card */}
            <div className="budget-health-card">
              <div className="health-header">
                <ShieldCheck className="text-emerald" size={20} />
                <div>
                  <strong>Stress-Free Travel Financial Guard</strong>
                  <p>
                    Your 5% contingency buffer ({curr.symbol} {Math.round(categoryAllocations.contingency.amount * curr.rate).toLocaleString()}) protects you against sudden taxi surges, umbrella purchases, or unplanned attraction tickets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GROUP EXPENSE SPLITTER */}
      {activeTab === 'splitter' && (
        <div className="budget-splitter-grid">
          {/* Left Column: Logged Expenses */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Receipt className="text-cyan" size={20} />
                <h3>Logged Group Expenses ({expenses.length})</h3>
              </div>
              <span className="badge-highlight">
                Total Spent: {curr.symbol} {Math.round(settlementData.totalSpent * curr.rate).toLocaleString()}
              </span>
            </div>

            {/* Expense List */}
            <div className="expenses-scroll-list">
              {expenses.map(exp => (
                <div key={exp.id} className="expense-item-row">
                  <div className="exp-info">
                    <div className="exp-title">{exp.title}</div>
                    <div className="exp-meta">
                      Paid by <strong className="text-cyan">{exp.paidBy}</strong> · {exp.category}
                    </div>
                  </div>
                  <div className="exp-amount-col">
                    <span className="exp-amount">
                      {curr.symbol} {Math.round(exp.amount * curr.rate).toLocaleString()}
                    </span>
                    <button
                      className="exp-delete-btn"
                      onClick={() => handleDeleteExpense(exp.id)}
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Expense Form */}
            <form onSubmit={handleAddExpense} className="add-expense-box">
              <h4>+ Log New Group Expense</h4>
              <div className="add-exp-row">
                <input
                  type="text"
                  placeholder="Expense description (e.g. Seafood Dinner, Grab Taxi)..."
                  value={newExpTitle}
                  onChange={e => setNewExpTitle(e.target.value)}
                  className="add-exp-input"
                />
                <input
                  type="number"
                  placeholder={`Amount (${curr.symbol})`}
                  value={newExpAmount}
                  onChange={e => setNewExpAmount(e.target.value)}
                  className="add-exp-num"
                />
              </div>
              <div className="add-exp-bottom-row">
                <div className="paid-by-selector">
                  <label>Paid by:</label>
                  <select
                    value={newExpPaidBy}
                    onChange={e => setNewExpPaidBy(e.target.value)}
                    className="paid-by-select"
                  >
                    {members.map(m => (
                      <option key={m.id || m.name} value={m.name}>
                        {m.avatar || '🧑'} {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="add-exp-submit-btn">
                  <Plus size={16} /> Add Expense
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Automated Settlement Calculator */}
          <div className="setup-card">
            <div className="card-header-row">
              <div className="card-icon-title">
                <Calculator className="text-cyan" size={20} />
                <h3>1-Click Debt Settlement Solver</h3>
              </div>
              <button className="copy-settle-btn" onClick={handleCopySettlement}>
                {copiedSettlement ? <Check size={14} /> : <Share2 size={14} />}
                {copiedSettlement ? 'Copied to WhatsApp!' : 'Share Breakdown'}
              </button>
            </div>

            <p className="section-note">
              Fair share is <strong>{curr.symbol} {Math.round(settlementData.fairSharePerPax * curr.rate).toLocaleString()}</strong> per person. Here is the mathematically minimal number of transfers to settle all accounts:
            </p>

            {/* Transfer Instructions */}
            <div className="transfers-card-list">
              {settlementData.transactions.length === 0 ? (
                <div className="empty-settle-state">
                  <Check size={28} className="text-emerald" />
                  <p>All group expenses are completely balanced! No transfers needed.</p>
                </div>
              ) : (
                settlementData.transactions.map((t, idx) => (
                  <div key={idx} className="settle-transfer-tile">
                    <div className="transfer-from-to">
                      <span className="debtor-name">{t.from}</span>
                      <span className="transfer-arrow">➔ pays ➔</span>
                      <span className="creditor-name">{t.to}</span>
                    </div>
                    <div className="transfer-amount-badge">
                      {curr.symbol} {Math.round(t.amount * curr.rate).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Individual Balances breakdown */}
            <div className="individual-balances-table">
              <h4>Individual Balances</h4>
              {settlementData.balances.map((b, idx) => (
                <div key={idx} className="balance-row">
                  <span className="balance-name">{b.name}</span>
                  <span className="balance-paid">Paid: {curr.symbol} {Math.round(b.paid * curr.rate).toLocaleString()}</span>
                  <span className={`balance-net ${b.net >= 0 ? 'positive' : 'negative'}`}>
                    {b.net >= 0 ? `+${curr.symbol} ${Math.round(b.net * curr.rate).toLocaleString()} (Refund)` : `-${curr.symbol} ${Math.round(Math.abs(b.net) * curr.rate).toLocaleString()} (Owes)`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Step Actions */}
      <div className="step-bottom-bar">
        <button className="step-back-btn" onClick={onPrevStep}>
          <ArrowLeft size={18} /> Back to Step 1
        </button>
        <div className="step-summary-text">
          Budget Target: <strong>{curr.symbol} {Math.round(budgetAmount * curr.rate).toLocaleString()}</strong> ({budgetTier.toUpperCase()})
        </div>
        <button className="step-next-primary-btn" onClick={onNextStep}>
          Proceed to Step 3: Discover & Schedule <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
