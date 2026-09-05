import React, { useEffect, useRef, useState } from 'react'
import { Bot, CheckCircle2, LoaderCircle, MapPin, Send, Sparkles, X } from 'lucide-react'

const emergencyPattern = /passport|medical|injur|sprain|lost|stolen|emergency|danger|police|hospital|sick|delay|cancel|rain|storm|stranded/i

function offlineReply(message, city) {
  const lower = message.toLowerCase()
  if (lower.includes('passport') || lower.includes('stolen')) {
    return {
      text: `First, make a police report and contact your embassy or consulate in ${city}. Keep digital copies of your passport, report, and flight details together, then tell your accommodation and airline that your documents are being replaced.`,
      steps: ['Move to a safe public place', 'File a police report', 'Contact your embassy or consulate', 'Notify your airline and travel group']
    }
  }
  if (lower.includes('rain') || lower.includes('storm')) {
    return { text: `I’d switch the next outdoor stop in ${city} for a nearby museum, gallery, covered market, or long lunch. Keep the original stop saved and move it to the clearest remaining morning.` }
  }
  if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant')) {
    return { text: `Tell me your budget, dietary needs, and how far you want to travel in ${city}. I can narrow it to a practical meal stop that fits the rest of the day.` }
  }
  return { text: `I’ve noted that for your ${city} trip. Add a little more detail about the day, budget, or people involved and I’ll suggest a practical next step.` }
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
      <button className="global-ai-launcher" onClick={() => setOpen(value => !value)} aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} aria-expanded={open}>
        {open ? <X size={23}/> : <><Bot size={25}/><span className="ai-launcher-spark"><Sparkles size={11}/></span></>}
      </button>
    </div>
  )
}
