import React, { useEffect, useRef, useState } from 'react'
import { Bot, CheckCircle2, LoaderCircle, MapPin, Send, Sparkles, X } from 'lucide-react'

const emergencyPattern = /passport|medical|injur|sprain|lost|stolen|emergency|danger|police|hospital|sick|delay|cancel|rain|storm|stranded/i

function offlineReply(message, city) {
  const lower = message.toLowerCase()
  if (/^(hi|hello|hey|yo|greetings|morning|good morning|good afternoon)\b/i.test(lower)) {
    return { text: `Hello! I'm your PlanTrip AI companion for ${city}. You can ask me for top local dinner spots, iconic attractions, train directions, or ask me to adjust your daily schedule!` }
  }
  if (lower.includes('passport') || lower.includes('stolen')) {
    return {
      text: `First, make a police report and contact your embassy or consulate in ${city}. Keep digital copies of your passport, report, and flight details together, then tell your accommodation and airline that your documents are being replaced.`,
      steps: ['Move to a safe public place', 'File a police report', 'Contact your embassy or consulate', 'Notify your airline and travel group']
    }
  }
  if (lower.includes('rain') || lower.includes('storm')) {
    return { text: `For rainy weather in ${city}, head to a covered indoor spot like Aquaria KLCC, Petrosains Discovery Centre, the Islamic Arts Museum, or explore the Pavilion mall.` }
  }
  if (lower.includes('food') || lower.includes('eat') || lower.includes('dinner') || lower.includes('restaurant')) {
    return { text: `In ${city}, top dining picks include Village Park Restaurant for authentic Nasi Lemak, Wong Ah Wah on Jalan Alor for street food & BBQ wings, or Bijan for fine Malay dining. Let me know if you'd like to add one to your itinerary!` }
  }
  if (lower.includes('transit') || lower.includes('train') || lower.includes('batu caves') || lower.includes('lrt') || lower.includes('mrt')) {
    return { text: `Public transit in ${city} is fast and cashless! Use a Touch 'n Go card for LRT, MRT, and Monorail. To reach Batu Caves, take the direct KTM Komuter from KL Sentral Platform 3 (RM 2.40).` }
  }
  return { text: `I'm here to help with your ${city} trip! Ask me about top places to eat, sights to see, train directions, or tell me to tweak a day in your schedule.` }
}

export default function GlobalAiAssistant({ destination, country, travelParty, durationDays, budgetAmount, currentPlan, onPlanUpdate }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([{
    id: 'welcome', role: 'assistant',
    text: 'Hi — I can help with places, timing, budgets, transport, or a change of plans. What do you need?'
  }])
  const inputRef = useRef(null)
  const messagesRef = useRef(null)
  const city = destination?.city || 'your destination'

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const sendMessage = async (preset) => {
    const text = (preset || draft).trim()
    if (!text || sending) return
    const userMessage = { id: `user-${Date.now()}`, role: 'user', text }
    setMessages(current => [...current, userMessage])
    setDraft('')
    setSending(true)
    try {
      if (emergencyPattern.test(text)) {
        const response = await fetch('/api/ai/emergency-solve', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ situation: text, city, country: country?.country || country || '', party: travelParty, durationDays, budgetAmount })
        })
        if (!response.ok) throw new Error('assistant unavailable')
        const data = await response.json()
        if (!data.solution) throw new Error('no solution')
        setMessages(current => [...current, {
          id: `assistant-${Date.now()}`, role: 'assistant',
          text: data.solution.summary || data.solution.title,
          steps: data.solution.immediateActions,
          detail: data.solution.itineraryReroute,
          contact: [data.solution.localSafetyResource, data.solution.hotline].filter(Boolean).join(' · ')
        }])
      } else {
        const response = await fetch('/api/ai/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, currentPlan, destination })
        })
        if (!response.ok) throw new Error('assistant unavailable')
        const data = await response.json()
        if (data.updatedPlan && onPlanUpdate) onPlanUpdate(data.updatedPlan)
        setMessages(current => [...current, {
          id: `assistant-${Date.now()}`, role: 'assistant',
          text: data.reply || offlineReply(text, city).text,
          detail: data.changesNotice || ''
        }])
      }
    } catch {
      const fallback = offlineReply(text, city)
      setMessages(current => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', ...fallback }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`global-ai-shell ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="global-ai-window" role="dialog" aria-modal="false" aria-labelledby="global-ai-title">
          <header>
            <span className="global-ai-avatar"><Sparkles size={18}/></span>
            <div><h2 id="global-ai-title">PlanTrip assistant</h2><p><span/> Ready in {city}</p></div>
            <button onClick={() => setOpen(false)} aria-label="Close AI assistant"><X size={18}/></button>
          </header>
          <div className="global-ai-messages" ref={messagesRef} aria-live="polite">
            {messages.map(message => (
              <article key={message.id} className={`global-ai-message ${message.role}`}>
                {message.role === 'assistant' && <span className="message-bot-mark"><Bot size={13}/></span>}
                <div>
                  <p>{message.text}</p>
                  {message.steps?.length > 0 && <ol>{message.steps.map(step => <li key={step}>{step}</li>)}</ol>}
                  {message.detail && <small><CheckCircle2 size={12}/>{message.detail}</small>}
                  {message.contact && <small><MapPin size={12}/>{message.contact}</small>}
                </div>
              </article>
            ))}
            {sending && <div className="global-ai-thinking"><LoaderCircle size={14}/> Thinking through your trip…</div>}
          </div>
          {messages.length === 1 && <div className="global-ai-prompts">
            {['Plan a rainy afternoon', 'Find a good local dinner', 'I lost my passport'].map(prompt => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>)}
          </div>}
          <form onSubmit={event => { event.preventDefault(); sendMessage() }}>
            <textarea ref={inputRef} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() }
            }} placeholder="Ask about your trip…" rows={1}/>
            <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message"><Send size={17}/></button>
          </form>
          <footer>Travel suggestions can change. Check urgent local advice directly.</footer>
        </section>
      )}
      <button 
        className={`global-ai-launcher ${open ? 'is-active' : 'is-floating'}`} 
        onClick={() => setOpen(value => !value)} 
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} 
        aria-expanded={open}
        title="Ask PlanTrip AI Assistant"
      >
        {open ? (
          <span className="ai-close-icon-wrap">
            <X size={24} />
          </span>
        ) : (
          <>
            <span className="ai-launcher-pulse-wave wave-1" aria-hidden="true" />
            <span className="ai-launcher-pulse-wave wave-2" aria-hidden="true" />
            <span className="ai-launcher-shimmer" aria-hidden="true" />
            <span className="ai-bot-motion-wrap">
              <Bot size={27} className="ai-bot-animated-icon" />
            </span>
            <span className="ai-launcher-spark" aria-hidden="true">
              <Sparkles size={12} className="ai-spark-animated-icon" />
            </span>
            <span className="ai-launcher-caption" aria-hidden="true">
              Ask AI
            </span>
          </>
        )}
      </button>
    </div>
  )
}
