# PlanTrip AI — Unified Travel Planning Platform

A modern, real-time travel planning platform featuring:
1. **Interactive 3D Earth Globe**: Explore any city worldwide with real-time geocoding (OpenStreetMap Nominatim).
2. **Google Review-Ranked Attractions & Restaurants**: Real live tourist spots and nearby dining fetched and ranked by Google review ratings and price tiers (`$` to `$$$$`).
3. **Trip Basket**: Add and curate attractions and dining with live budget accumulation.
4. **Multi-Provider Ticket & Stay Comparison**: Compare flights and accommodations with verified live deep-link search engines for **AirAsia**, **Booking.com**, **Trip.com**, and **Skyscanner**.
5. **AI Travel Concierge & Document Generator**: Generates day-by-day itineraries with free credentials (Google Gemini API / smart planner) and exports downloadable **Microsoft Word (.doc)**, **Printable/PDF**, and **Markdown (.md)** files.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

---

## 🌐 Real-Time Data Sources & Integrations

- **3D Globe & Geocoding**: Three.js WebGL Earth + OpenStreetMap Nominatim Live Geocoding API.
- **Attractions**: Real verified tourist attractions + Wikipedia REST API geosearch with verified Google review scores.
- **Dining & Restaurants**: Real restaurants via OpenStreetMap Overpass Live API + verified Google review rankings & price tiers.
- **Flights & Stays**: Live pre-filled deep-link comparison engine for **AirAsia**, **Booking.com**, **Trip.com**, **Skyscanner**, and **Amadeus Live GDS**.
- **AI Agent**: Google Gemini AI (`gemini-1.5-flash` / `gemini-2.0-flash`) free tier support + smart autonomous travel planner.
- **Document Export**: Instant client-side download of rich formatted Word documents (.doc) and PDF print styling.
