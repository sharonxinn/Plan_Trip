// Client-side Google Calendar write via Google Identity Services (GIS).
// No backend involved: GIS hands back a short-lived access token directly in
// the browser after a consent popup, which is then used to call the Calendar
// API straight from the client. See Plan_Trip/.env.example for setup.

let tokenClient = null
let cachedToken = null
let cachedTokenExpiresAt = 0

function requestGoogleAccessToken() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    return Promise.reject(new Error('Google Calendar isn\'t configured yet (missing VITE_GOOGLE_CLIENT_ID).'))
  }
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    return Promise.reject(new Error('Google Sign-In script hasn\'t loaded yet — check your connection and try again.'))
  }
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) {
    return Promise.resolve(cachedToken)
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: () => {}
      })
    }
    tokenClient.callback = response => {
      if (response.error) {
        reject(new Error(response.error_description || 'Google Calendar access was not granted.'))
        return
      }
      cachedToken = response.access_token
      cachedTokenExpiresAt = Date.now() + Number(response.expires_in || 3600) * 1000
      resolve(cachedToken)
    }
    tokenClient.error_callback = err => {
      reject(new Error(err?.message || 'Google sign-in was cancelled.'))
    }
    tokenClient.requestAccessToken({ prompt: cachedToken ? '' : 'consent' })
  })
}

// Google's all-day `end.date` is exclusive, so add one day past the return date.
function nextDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function addDays(dateStr, amount) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + amount)
  return d.toISOString().slice(0, 10)
}

// Parses "9:15 AM" / "09:15 AM" into 24h { hours, minutes }.
function parseClockTime(str) {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(String(str || '').trim())
  if (!match) return null
  let hours = Number(match[1]) % 12
  if (/pm/i.test(match[3])) hours += 12
  return { hours, minutes: Number(match[2]) }
}

function formatHM({ hours, minutes }) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function addMinutes({ hours, minutes }, amount) {
  const total = hours * 60 + minutes + amount
  return { hours: Math.floor(((total % 1440) + 1440) % 1440 / 60), minutes: ((total % 60) + 60) % 60 }
}

// Regular spots have arriveTime/departTime; the Day-1 arrival-hub entry only
// has a single timeSlot + durationMins, so its end time is derived.
function getSpotTimeRange(spot) {
  const start = parseClockTime(spot.arriveTime || spot.timeSlot)
  if (!start) return null
  const end = spot.departTime
    ? parseClockTime(spot.departTime)
    : addMinutes(start, spot.stayDurationMins || spot.durationMins || 30)
  return { startHM: formatHM(start), endHM: formatHM(end || start) }
}

export async function addTripToGoogleCalendar({ cityName, countryName, departureDate, returnDate }) {
  const accessToken = await requestGoogleAccessToken()

  const event = {
    summary: `Trip to ${cityName}, ${countryName}`,
    description: 'Added by PlanTrip AI',
    start: { date: departureDate },
    end: { date: nextDay(returnDate) }
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error?.message || `Google Calendar request failed (${response.status})`)
  }

  return response.json()
}

// Creates one timed Google Calendar event per run-sheet activity (not a single
// whole-trip block). onProgress(created, total) fires after each event so the
// UI can show a running count during the sequential sync.
export async function addItineraryToGoogleCalendar(smartItinerary, departureDate, onProgress) {
  const days = smartItinerary?.days || []
  const total = days.reduce((sum, day) => sum + (day.spots?.length || 0), 0)
  if (total === 0) {
    throw new Error('No itinerary activities to sync yet.')
  }

  const accessToken = await requestGoogleAccessToken()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  let created = 0
  for (const day of days) {
    const eventDate = addDays(departureDate, day.dayNumber - 1)
    for (const spot of day.spots || []) {
      const range = getSpotTimeRange(spot)
      if (!range) continue

      const event = {
        summary: spot.name,
        description: [spot.category, spot.suggestedReason].filter(Boolean).join(' · '),
        start: { dateTime: `${eventDate}T${range.startHM}:00`, timeZone },
        end: { dateTime: `${eventDate}T${range.endHM}:00`, timeZone }
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error?.message || `Google Calendar request failed (${response.status})`)
      }

      created++
      onProgress?.(created, total)
    }
  }

  return { created, total }
}
