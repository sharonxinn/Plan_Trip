// Route Optimizer Utility for PlanTrip
// Calculates geographic distances (Haversine), optimizes route sequences (No Backtracking),
// and schedules multi-day itineraries based on starting point, arrival time, and place categories.

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}

/**
 * Estimates driving travel duration in minutes based on distance in km
 */
export function estimateDriveMinutes(distanceKm) {
  if (distanceKm <= 0.5) return 3
  // City traffic estimate: ~25 km/h average + 2 mins traffic light buffer
  const mins = Math.round((distanceKm / 22) * 60) + 3
  return Math.max(4, Math.min(60, mins))
}

/**
 * Formats minutes from midnight into 12-hour AM/PM string (e.g. 600 -> "10:00 AM")
 */
export function minutesToTimeString(totalMinutes) {
  const normalized = (totalMinutes + 1440) % 1440
  const hours24 = Math.floor(normalized / 60)
  const mins = normalized % 60
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`
  return `${hours12}:${minsStr} ${period}`
}

/**
 * Parses time string like "10:00 AM" or "14:30" into minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 600 // default 10:00 AM
  const str = timeStr.trim().toUpperCase()
  const isPM = str.includes('PM')
  const isAM = str.includes('AM')
  const clean = str.replace(/[^0-9:]/g, '')
  const parts = clean.split(':').map(Number)
  let h = parts[0] || 10
  const m = parts[1] || 0
  if (isPM && h < 12) h += 12
  if (isAM && h === 12) h = 0
  return h * 60 + m
}

/**
 * Sorts an array of locations using Nearest-Neighbor heuristic to eliminate backtracking
 */
export function optimizeSequenceNoBacktracking(startCoord, locations) {
  if (!locations || locations.length <= 1) return locations || []
  
  const remaining = [...locations]
  const ordered = []
  let currentCoord = startCoord || { lat: remaining[0].lat, lng: remaining[0].lng }

  while (remaining.length > 0) {
    let nearestIndex = 0
    let minDistance = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateDistanceKm(
        currentCoord.lat, currentCoord.lng,
        remaining[i].lat, remaining[i].lng
      )
      if (dist < minDistance) {
        minDistance = dist
        nearestIndex = i
      }
    }

    const nextSpot = remaining.splice(nearestIndex, 1)[0]
    ordered.push({
      ...nextSpot,
      distanceFromPrevKm: minDistance === Infinity ? 0 : minDistance
    })
    currentCoord = { lat: nextSpot.lat, lng: nextSpot.lng }
  }

  return ordered
}

/**
 * Generates an optimized Multi-Day Smart Itinerary from confirmed bucket list items
 */
export function generateSmartItinerary({
  durationDays = 3,
  startingPoint = { name: 'Ipoh Railway Station', lat: 4.5975, lng: 101.0734 },
  arrivalTimeStr = '10:00 AM',
  confirmedItems = [],
  pace = 'balanced' // 'relaxed' | 'balanced' | 'packed'
}) {
  const totalDays = Math.max(1, Math.min(14, Number(durationDays) || 3))
  const startMinutes = parseTimeToMinutes(arrivalTimeStr)
  
  // Categorize items
  const pinnedDays = {}
  for (let d = 1; d <= totalDays; d++) {
    pinnedDays[d] = confirmedItems.filter(i => Number(i.assignedDay) === d)
  }
  
  const unpinned = confirmedItems.filter(i => !i.assignedDay || i.assignedDay === 'auto')

  // Distribute spots across days
  const dayBuckets = {}
  for (let d = 1; d <= totalDays; d++) {
    dayBuckets[d] = [...pinnedDays[d]]
  }

  let currentDay = 1
  for (const item of unpinned) {
    if (!dayBuckets[currentDay]) dayBuckets[currentDay] = []
    
    // Find day with least items
    let minDay = 1
    let minCount = Infinity
    for (let d = 1; d <= totalDays; d++) {
      if (dayBuckets[d].length < minCount) {
        minCount = dayBuckets[d].length
        minDay = d
      }
    }
    dayBuckets[minDay].push(item)
  }

  // Schedule each day's timeline
  const itineraryDays = []
  let totalKmAllDays = 0

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const rawItems = dayBuckets[dayNum] || []
    
    // Starting coordinate for this day
    const dayStartCoord = dayNum === 1
      ? { lat: startingPoint.lat, lng: startingPoint.lng }
      : rawItems[0] ? { lat: rawItems[0].lat, lng: rawItems[0].lng } : { lat: startingPoint.lat, lng: startingPoint.lng }

    const optimizedSpots = optimizeSequenceNoBacktracking(dayStartCoord, rawItems)

    // Build timeline slots
    let currentClock = dayNum === 1 ? startMinutes : 540 // Day 2+ starts 09:00 AM
    const scheduledSpots = []
    let dayKm = 0

    // Add starting hub entry on Day 1
    if (dayNum === 1) {
      const firstDist = optimizedSpots[0]?.distanceFromPrevKm || 1.2
      scheduledSpots.push({
        id: `start-hub-day-1`,
        name: startingPoint.name || 'Arrival Hub',
        type: 'start_hub',
        category: 'Arrival & Starting Hub',
        timeSlot: minutesToTimeString(currentClock),
        durationMins: 15,
        lat: startingPoint.lat,
        lng: startingPoint.lng,
        notes: `Arrive at ${minutesToTimeString(currentClock)} · Meet up & luggage drop`,
        transitToNextMinutes: estimateDriveMinutes(firstDist),
        transitToNextKm: firstDist
      })
      currentClock += 15 + estimateDriveMinutes(firstDist)
    }

    optimizedSpots.forEach((spot, idx) => {
      const isDining = spot.type === 'restaurant' || spot.category?.includes('Dining') || spot.cuisine || spot.category?.includes('Cafe')
      const stayDurationMins = isDining ? 60 : spot.estimatedHours ? Math.round(parseFloat(spot.estimatedHours) * 60) || 75 : 75
      
      const prevCoord = idx === 0
        ? dayStartCoord
        : { lat: optimizedSpots[idx - 1].lat, lng: optimizedSpots[idx - 1].lng }

      const distFromPrev = calculateDistanceKm(prevCoord.lat, prevCoord.lng, spot.lat, spot.lng)
      dayKm += distFromPrev

      const arriveTime = minutesToTimeString(currentClock)
      const departTime = minutesToTimeString(currentClock + stayDurationMins)

      const nextSpot = optimizedSpots[idx + 1]
      const distToNext = nextSpot ? calculateDistanceKm(spot.lat, spot.lng, nextSpot.lat, nextSpot.lng) : 0
      const driveToNextMins = nextSpot ? estimateDriveMinutes(distToNext) : 0

      scheduledSpots.push({
        ...spot,
        stepNumber: scheduledSpots.length + 1,
        timeSlot: `${arriveTime} - ${departTime}`,
        arriveTime,
        departTime,
        stayDurationMins,
        transitToNextMinutes: driveToNextMins,
        transitToNextKm: distToNext,
        distanceFromPrevKm: distFromPrev,
        suggestedReason: spot.suggestedBy ? `Suggested by ${spot.suggestedBy}` : isDining ? 'Selected Gastronomy' : 'Key Landmark'
      })

      currentClock += stayDurationMins + driveToNextMins
    })

    totalKmAllDays += Number(dayKm.toFixed(1))

    // Construct Google Maps multi-stop navigation link for this day
    const allWaypoints = [
      dayNum === 1 ? startingPoint.name : null,
      ...optimizedSpots.map(s => s.name || `${s.lat},${s.lng}`)
    ].filter(Boolean)

    const googleMapsMultiStopUrl = `https://www.google.com/maps/dir/${allWaypoints.map(encodeURIComponent).join('/')}`

    itineraryDays.push({
      dayNumber: dayNum,
      title: `Day ${dayNum} · ${optimizedSpots[0]?.category || 'Highlights'} & Route`,
      dateLabel: `Day ${dayNum}`,
      totalSpots: scheduledSpots.length,
      dayTotalKm: Number(dayKm.toFixed(1)),
      spots: scheduledSpots,
      googleMapsMultiStopUrl
    })
  }

  return {
    totalDays,
    startingPoint,
    arrivalTimeStr,
    totalSpotsScheduled: confirmedItems.length,
    totalEstimatedKm: Number(totalKmAllDays.toFixed(1)),
    days: itineraryDays
  }
}
