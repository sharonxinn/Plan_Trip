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
