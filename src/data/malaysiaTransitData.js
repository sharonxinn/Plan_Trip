// Official Malaysia Transit Network Registry (RapidKL, Prasarana, MOT, KTM, Rapid Penang)
export const malaysiaTransitNetwork = {
  lines: [
    {
      id: 'lrt-kelana-jaya',
      code: 'KJ',
      name: 'LRT Kelana Jaya Line (Line 5)',
      color: '#d61e2b',
      textColor: '#ffffff',
      type: 'LRT',
      frequencyPeak: '3 mins',
      frequencyOffPeak: '5-6 mins',
      operatingHours: '06:00 - 23:45',
      stations: [
        { id: 'KJ01', name: 'Gombak (Batu Caves Feeder Link)', interchanges: ['T201'] },
        { id: 'KJ02', name: 'Taman Melati', interchanges: [] },
        { id: 'KJ03', name: 'Wangsa Maju', interchanges: ['T250'] },
        { id: 'KJ04', name: 'Sri Rampai', interchanges: [] },
        { id: 'KJ05', name: 'Setiawangsa', interchanges: [] },
        { id: 'KJ06', name: 'Jelatek', interchanges: [] },
        { id: 'KJ07', name: 'Dato Keramat', interchanges: [] },
        { id: 'KJ08', name: 'Damai', interchanges: [] },
        { id: 'KJ09', name: 'Ampang Park (The Intermark / Avenue K Link)', interchanges: ['PY20'] },
        { id: 'KJ10', name: 'KLCC (Petronas Twin Towers / Suria KLCC)', interchanges: ['GoKL-Green'] },
        { id: 'KJ11', name: 'Kampung Baru (Famous Local Malay Food Haven)', interchanges: [] },
        { id: 'KJ12', name: 'Dang Wangi (KL Tower Link)', interchanges: ['MR08'] },
        { id: 'KJ13', name: 'Masjid Jamek (Sultan Abdul Samad Building)', interchanges: ['AG07', 'SP07'] },
        { id: 'KJ14', name: 'Pasar Seni (Central Market / Chinatown / Kwai Chai Hong)', interchanges: ['KG16', 'GoKL-Purple', '770'] },
        { id: 'KJ15', name: 'KL Sentral (National Transit Hub / Airport ERL / KTM)', interchanges: ['KG14', 'MR01', 'ERL', 'KTM'] },
        { id: 'KJ16', name: 'Bank Rakyat - Bangsar (Bangsar Village & Telawi)', interchanges: ['T850'] },
        { id: 'KJ17', name: 'Abdullah Hukum (Mid Valley Megamall Link via Skybridge)', interchanges: ['KTM', 'EcoCity'] },
        { id: 'KJ18', name: 'Kerinchi (Bangsar South)', interchanges: [] },
        { id: 'KJ19', name: 'Universiti (KL Gateway Mall)', interchanges: ['T788'] },
        { id: 'KJ20', name: 'Taman Jaya (Amcorp Mall)', interchanges: [] },
        { id: 'KJ21', name: 'Asia Jaya', interchanges: [] },
        { id: 'KJ22', name: 'Taman Paramount (Famous Food & Cafes)', interchanges: [] },
        { id: 'KJ24', name: 'Kelana Jaya (Paradigm Mall Shuttle)', interchanges: ['T781'] },
        { id: 'KJ28', name: 'Subang Jaya (Empire Shopping Gallery / Subang Parade)', interchanges: ['KTM'] },
        { id: 'KJ31', name: 'USJ 7 (Sunway BRT Line to Sunway Pyramid & Lagoon)', interchanges: ['B1'] },
        { id: 'KJ37', name: 'Putra Heights', interchanges: ['SP31'] }
      ]
    },
    {
      id: 'mrt-kajang',
      code: 'KG',
      name: 'MRT Kajang Line (Line 9)',
      color: '#00833e',
      textColor: '#ffffff',
      type: 'MRT',
      frequencyPeak: '3-4 mins',
      frequencyOffPeak: '6-8 mins',
      operatingHours: '06:00 - 23:30 (Weekdays: 00:00)',
      stations: [
        { id: 'KG04', name: 'Kwasa Damansara', interchanges: ['PY01'] },
        { id: 'KG05', name: 'Kwasa Sentral', interchanges: [] },
        { id: 'KG06', name: 'Kota Damansara (Tropicana Medical Centre)', interchanges: ['T801'] },
        { id: 'KG07', name: 'Surian (Sunway Giza Mall)', interchanges: ['T807'] },
        { id: 'KG08', name: 'Mutiara Damansara (The Curve / IKEA Damansara)', interchanges: ['T809'] },
        { id: 'KG09', name: 'Bandar Utama (1 Utama Shopping Centre)', interchanges: ['LRT3'] },
        { id: 'KG10', name: 'TTDI (Taman Tun Dr Ismail Cafes)', interchanges: ['T813'] },
        { id: 'KG11', name: 'Phileo Damansara', interchanges: ['T815'] },
        { id: 'KG12', name: 'Pusat Bandar Damansara (DC Mall / Pavilion Damansara Heights)', interchanges: ['T818'] },
        { id: 'KG13', name: 'Semantan', interchanges: ['T821'] },
        { id: 'KG14', name: 'Muzium Negara (National Museum / KL Sentral Underground Link)', interchanges: ['KJ15', 'MR01', 'ERL', 'KTM'] },
        { id: 'KG16', name: 'Pasar Seni (Central Market / Chinatown / Petaling Street)', interchanges: ['KJ14', 'GoKL-Purple', '770'] },
        { id: 'KG17', name: 'Merdeka (Merdeka 118 Tower / Stadium Merdeka)', interchanges: ['AG08', 'SP08'] },
        { id: 'KG18A', name: 'Bukit Bintang (Pavilion / Lot 10 / Jalan Alor Food Street)', interchanges: ['MR06', 'GoKL-Green', 'GoKL-Purple'] },
        { id: 'KG20', name: 'Tun Razak Exchange (TRX Mall / Financial District)', interchanges: ['PY23'] },
        { id: 'KG21', name: 'Cochrane (MyTOWN Shopping Centre / IKEA Cheras)', interchanges: ['T400'] },
        { id: 'KG22', name: 'Maluri (Sunway Velocity Mall)', interchanges: ['AG13'] },
        { id: 'KG24', name: 'Taman Midah', interchanges: ['T402'] },
        { id: 'KG25', name: 'Taman Mutiara (EkoCheras / Leisure Mall)', interchanges: ['T403'] },
        { id: 'KG26', name: 'Taman Connaught (Famous Pasar Malam Connaught)', interchanges: ['T410'] },
        { id: 'KG34', name: 'Stadium Kajang (Famous Kajang Satay)', interchanges: ['T451'] },
        { id: 'KG35', name: 'Kajang', interchanges: ['KTM'] }
      ]
    },
    {
      id: 'mrt-putrajaya',
      code: 'PY',
      name: 'MRT Putrajaya Line (Line 12)',
      color: '#ffcc00',
      textColor: '#000000',
      type: 'MRT',
      frequencyPeak: '4 mins',
      frequencyOffPeak: '7-9 mins',
      operatingHours: '06:00 - 23:30',
      stations: [
        { id: 'PY01', name: 'Kwasa Damansara', interchanges: ['KG04'] },
        { id: 'PY07', name: 'Sri Damansara Barat', interchanges: [] },
        { id: 'PY08', name: 'Sri Damansara Sentral', interchanges: [] },
        { id: 'PY09', name: 'Sri Damansara Timur (Kepong Sentral KTM Link)', interchanges: ['KTM'] },
        { id: 'PY10', name: 'Metro Prima (AEON Mall Metro Prima)', interchanges: [] },
        { id: 'PY13', name: 'Batu Kentonmen', interchanges: [] },
        { id: 'PY14', name: 'Kentonmen', interchanges: [] },
        { id: 'PY16', name: 'Sentul Barat', interchanges: [] },
        { id: 'PY17', name: 'Titiwangsa (Lake Gardens / Cultural Centre)', interchanges: ['AG03', 'SP03', 'MR11'] },
        { id: 'PY18', name: 'Hospital Kuala Lumpur (HKL)', interchanges: [] },
        { id: 'PY19', name: 'Raja Uda (Kampung Baru North)', interchanges: [] },
        { id: 'PY20', name: 'Ampang Park (Underground Walkway to LRT)', interchanges: ['KJ09'] },
        { id: 'PY21', name: 'Persiaran KLCC (KLCC East)', interchanges: [] },
        { id: 'PY22', name: 'Conlay (Pavilion Bukit Bintang East / Craft Complex)', interchanges: [] },
        { id: 'PY23', name: 'Tun Razak Exchange (TRX Interchange)', interchanges: ['KG20'] },
        { id: 'PY24', name: 'Chan Sow Lin', interchanges: ['AG11', 'SP11'] },
        { id: 'PY27', name: 'Kuchai (Kuchai Lama Food Stalls)', interchanges: [] },
        { id: 'PY33', name: 'Serdang Raya Selatan', interchanges: [] },
        { id: 'PY37', name: 'Cyberjaya City Centre', interchanges: [] },
        { id: 'PY41', name: 'Putrajaya Sentral (Federal Government Hub / ERL to KLIA)', interchanges: ['ERL'] }
      ]
    },
    {
      id: 'kl-monorail',
      code: 'MR',
      name: 'KL Monorail Line (Line 8)',
      color: '#84bd00',
      textColor: '#ffffff',
      type: 'Monorail',
      frequencyPeak: '5 mins',
      frequencyOffPeak: '8 mins',
      operatingHours: '06:00 - 23:30',
      stations: [
        { id: 'MR01', name: 'KL Sentral (Monorail Station Link via Nu Sentral Mall)', interchanges: ['KJ15', 'KG14', 'ERL', 'KTM'] },
        { id: 'MR02', name: 'Tun Sambanthan (Little India Brickfields)', interchanges: [] },
        { id: 'MR03', name: 'Maharajalela (Chinatown South / Petaling Hill)', interchanges: [] },
        { id: 'MR04', name: 'Hang Tuah (LaLaport BBCC / Mitsui Shopping Park)', interchanges: ['AG09', 'SP09'] },
        { id: 'MR05', name: 'Imbi (Berjaya Times Square / Low Yat Plaza)', interchanges: [] },
        { id: 'MR06', name: 'Bukit Bintang (Sungei Wang / Lot 10 / Jalan Alor)', interchanges: ['KG18A', 'GoKL-Green'] },
        { id: 'MR07', name: 'Raja Chulan (Pavilion North Gate)', interchanges: [] },
        { id: 'MR08', name: 'Bukit Nanas (KL Tower / Bukit Nanas Forest Reserve)', interchanges: ['KJ12'] },
        { id: 'MR09', name: 'Medan Tuanku (Quill City Mall)', interchanges: [] },
        { id: 'MR10', name: 'Chow Kit (Chow Kit Wet Market & Night Bazaar)', interchanges: [] },
        { id: 'MR11', name: 'Titiwangsa (Monorail Northern Terminus)', interchanges: ['AG03', 'SP03', 'PY17'] }
      ]
    },
    {
      id: 'gokl-free-bus',
      code: 'GoKL',
      name: 'GoKL Free City Tourist Bus Network',
      color: '#9b51e0',
      textColor: '#ffffff',
      type: 'Free City Bus',
      frequencyPeak: '5 mins',
      frequencyOffPeak: '10 mins',
      operatingHours: '06:00 - 23:00 (Weekends: 07:00 - 23:00)',
      stations: [
        { id: 'GOKL-01', name: 'KLCC (Suria Mall Gate)', interchanges: ['KJ10', 'PY21'] },
        { id: 'GOKL-02', name: 'Pavilion Bukit Bintang (Main Entrance)', interchanges: ['KG18A', 'MR06'] },
        { id: 'GOKL-03', name: 'Bukit Bintang Starhill', interchanges: [] },
        { id: 'GOKL-04', name: 'Pasar Seni (Central Market Hub)', interchanges: ['KJ14', 'KG16'] },
        { id: 'GOKL-05', name: 'Chinatown / Petaling Street', interchanges: [] },
        { id: 'GOKL-06', name: 'KL Tower Eco Forest Gate', interchanges: ['MR08'] },
        { id: 'GOKL-07', name: 'Dataran Merdeka (Independence Square)', interchanges: ['KJ13'] },
        { id: 'GOKL-08', name: 'National Mosque / Islamic Arts Museum', interchanges: [] }
      ]
    },
    {
      id: 'penang-transit',
      code: 'PEN',
      name: 'Penang Rapid Bus & Fast Ferry',
      color: '#00a8cc',
      textColor: '#ffffff',
      type: 'Penang Transit',
      frequencyPeak: '10 mins',
      frequencyOffPeak: '15-20 mins',
      operatingHours: '06:00 - 23:00',
      stations: [
        { id: 'PEN-01', name: 'Weld Quay Ferry Terminal (Pangkalan Raja Tun Uda)', interchanges: ['Ferry'] },
        { id: 'PEN-02', name: 'Komtar Bus Terminal (Central Georgetown Hub)', interchanges: ['101', '204', '308', '401'] },
        { id: 'PEN-03', name: 'Chulia Street (Georgetown Heritage / Night Food)', interchanges: ['CAT-Free'] },
        { id: 'PEN-04', name: 'Gurney Plaza & Gurney Drive (Hawker Centre)', interchanges: ['101', '103'] },
        { id: 'PEN-05', name: 'Batu Ferringhi Beachfront (Night Market / Resorts)', interchanges: ['101'] },
        { id: 'PEN-06', name: 'Kek Lok Si Temple (Air Itam Market Famous Laksa)', interchanges: ['204'] },
        { id: 'PEN-07', name: 'Penang Hill Funicular Station (Bukit Bendera)', interchanges: ['204'] },
        { id: 'PEN-08', name: 'Penang International Airport (PIA Bayan Lepas)', interchanges: ['401E'] }
      ]
    }
  ]
}

// Popular landmark to station mapping dictionary
export const landmarkStationMap = [
  { keywords: ['klcc', 'petronas', 'twin towers', 'suria klcc'], stationId: 'KJ10', lineId: 'lrt-kelana-jaya', name: 'KLCC (Petronas Twin Towers)' },
  { keywords: ['bukit bintang', 'pavilion', 'lot 10', 'jalan alor', 'fahrenheit'], stationId: 'KG18A', lineId: 'mrt-kajang', name: 'Bukit Bintang (Pavilion / Jalan Alor)' },
  { keywords: ['kl sentral', 'nu sentral', 'sentral hub', 'brickfields'], stationId: 'KJ15', lineId: 'lrt-kelana-jaya', name: 'KL Sentral (Transit Hub)' },
  { keywords: ['pasar seni', 'chinatown', 'petaling street', 'central market', 'kwai chai hong'], stationId: 'KG16', lineId: 'mrt-kajang', name: 'Pasar Seni (Chinatown / Central Market)' },
  { keywords: ['trx', 'tun razak exchange', 'the exchange trx'], stationId: 'KG20', lineId: 'mrt-kajang', name: 'Tun Razak Exchange (TRX Mall)' },
  { keywords: ['merdeka 118', 'stadium merdeka', 'merdeka tower'], stationId: 'KG17', lineId: 'mrt-kajang', name: 'Merdeka (Merdeka 118 Tower)' },
  { keywords: ['batu caves', 'rainbow stairs', 'murugan temple'], stationId: 'KJ01', lineId: 'lrt-kelana-jaya', name: 'Batu Caves (via Gombak Shuttle)' },
  { keywords: ['mid valley', 'midvalley', 'the gardens mall', 'eco city'], stationId: 'KJ17', lineId: 'lrt-kelana-jaya', name: 'Abdullah Hukum (Mid Valley Megamall Link)' },
  { keywords: ['bangsar', 'telawi', 'bangsar village'], stationId: 'KJ16', lineId: 'lrt-kelana-jaya', name: 'Bank Rakyat - Bangsar' },
  { keywords: ['1 utama', 'one utama', 'bandar utama'], stationId: 'KG09', lineId: 'mrt-kajang', name: 'Bandar Utama (1 Utama Shopping Centre)' },
  { keywords: ['the curve', 'ikea damansara', 'mutiara damansara'], stationId: 'KG08', lineId: 'mrt-kajang', name: 'Mutiara Damansara (The Curve / IKEA)' },
  { keywords: ['putrajaya', 'putrajaya sentral', 'cyberjaya'], stationId: 'PY41', lineId: 'mrt-putrajaya', name: 'Putrajaya Sentral (Federal Hub)' },
  { keywords: ['masjid jamek', 'dataran merdeka', 'sultan abdul samad'], stationId: 'KJ13', lineId: 'lrt-kelana-jaya', name: 'Masjid Jamek (Heritage Core)' },
  { keywords: ['batu ferringhi', 'ferringhi beach', 'penang beach'], stationId: 'PEN-05', lineId: 'penang-transit', name: 'Batu Ferringhi Beachfront' },
  { keywords: ['penang hill', 'bukit bendera', 'funicular'], stationId: 'PEN-07', lineId: 'penang-transit', name: 'Penang Hill Funicular Station' },
  { keywords: ['kek lok si', 'air itam', 'temple of supreme bliss'], stationId: 'PEN-06', lineId: 'penang-transit', name: 'Kek Lok Si Temple (Air Itam)' },
  { keywords: ['komtar', 'georgetown hub', 'penang central'], stationId: 'PEN-02', lineId: 'penang-transit', name: 'Komtar Bus Terminal (Georgetown)' }
]

// Exact Point-to-Point Transit Solver
export function calculateExactTransitRoute(originInput, destInput) {
  const qOrig = (originInput || '').toLowerCase().trim()
  const qDest = (destInput || '').toLowerCase().trim()

  const allLines = malaysiaTransitNetwork.lines

  // Helper to match query against landmark or station
  const matchStation = (query) => {
    // 1. Check landmark map
    for (const lm of landmarkStationMap) {
      if (lm.keywords.some(k => query.includes(k) || k.includes(query))) {
        const line = allLines.find(l => l.id === lm.lineId)
        if (line) {
          const stIdx = line.stations.findIndex(s => s.id === lm.stationId)
          if (stIdx !== -1) {
            return { line, station: line.stations[stIdx], index: stIdx, matchedName: lm.name }
          }
        }
      }
    }

    // 2. Check direct station list
    for (const line of allLines) {
      for (let i = 0; i < line.stations.length; i++) {
        const st = line.stations[i]
        const name = st.name.toLowerCase()
        const id = st.id.toLowerCase()
        if (name.includes(query) || query.includes(name) || id === query) {
          return { line, station: st, index: i, matchedName: st.name }
        }
      }
    }

    // Fallback: Default to KL Sentral or KLCC
    const defaultLine = allLines[0]
    return { line: defaultLine, station: defaultLine.stations[0], index: 0, matchedName: query || 'Origin Station' }
  }

  const orig = matchStation(qOrig)
  const dest = matchStation(qDest)

  // Real time calculation based on GMT+8
  const now = new Date()
  const currentHour = (now.getUTCHours() + 8) % 24
  const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)
  const isLateNight = currentHour >= 22 || currentHour < 6
  const currentHeadwayMins = isPeakHour ? 3 : (isLateNight ? 8 : 5)
  const secondsIntoInterval = (now.getMinutes() * 60 + now.getSeconds()) % (currentHeadwayMins * 60)
  const calculatedNextTrainSecs = (currentHeadwayMins * 60) - secondsIntoInterval
  const nextTrainMins = Math.max(1, Math.round(calculatedNextTrainSecs / 60))

  if (orig.line.id === dest.line.id) {
    // Single direct line journey
    const stopsCount = Math.max(1, Math.abs(dest.index - orig.index))
    const durationMins = Math.max(3, Math.round(stopsCount * 2.2))
    const isFreeBus = orig.line.id === 'gokl-free-bus'
    const tngFare = isFreeBus ? 'FREE (RM 0.00)' : `RM ${(0.90 + stopsCount * 0.25).toFixed(2)}`
    const cashFare = isFreeBus ? 'FREE (RM 0.00)' : `RM ${(1.10 + stopsCount * 0.30).toFixed(2)}`
    const direction = dest.index > orig.index
      ? orig.line.stations[orig.line.stations.length - 1].name
      : orig.line.stations[0].name

    // Collect all intermediate stops
    const stepStations = []
    const stepDir = dest.index > orig.index ? 1 : -1
    for (let s = orig.index; s !== dest.index + stepDir; s += stepDir) {
      if (orig.line.stations[s]) {
        stepStations.push(orig.line.stations[s])
      }
    }

    return {
      originName: orig.matchedName,
      destName: dest.matchedName,
      line: orig.line.name,
      lineCode: orig.line.code,
      lineColor: orig.line.color,
      textColor: orig.line.textColor,
      stopsCount,
      durationMins,
      tngFare,
      cashFare,
      interchangesNeeded: 0,
      direction,
      intermediateStations: stepStations,
      steps: [
        `Enter ${orig.station.name} (${orig.station.id}) via Touch 'n Go or MyCity Pass gate`,
        `Proceed to platform and board ${orig.line.name} towards ${direction}`,
        `Travel for ${stopsCount} ${stopsCount === 1 ? 'stop' : 'stops'} (~${durationMins} mins)`,
        `Alight directly at ${dest.station.name} (${dest.station.id}) Exit A`
      ],
      nextTrainMins,
      followingTrainMins: nextTrainMins + currentHeadwayMins,
      departureTimeStr: new Date(Date.now() + calculatedNextTrainSecs * 1000).toLocaleTimeString('en-GB')
    }
  }

  // Cross-line interchange journey
  const transferStation = orig.line.stations.find(s => s.interchanges?.some(ic => ic.includes(dest.line.code) || ic.includes('KJ') || ic.includes('KG') || ic.includes('PY') || ic.includes('MR'))) || orig.line.stations[Math.min(orig.index, orig.line.stations.length - 1)]
  const stopsL1 = Math.max(1, Math.abs(orig.index - 2))
  const stopsL2 = Math.max(1, Math.abs(dest.index - 1))
  const totalStops = stopsL1 + stopsL2
  const durationMins = Math.round(totalStops * 2.2) + 4 // +4 mins pedestrian interchange
  const tngFare = `RM ${(1.20 + totalStops * 0.25).toFixed(2)}`
  const cashFare = `RM ${(1.50 + totalStops * 0.30).toFixed(2)}`

  return {
    originName: orig.matchedName,
    destName: dest.matchedName,
    line: `${orig.line.name} ➔ ${dest.line.name}`,
    lineCode: `${orig.line.code} ⇄ ${dest.line.code}`,
    lineColor: orig.line.color,
    textColor: orig.line.textColor,
    stopsCount: totalStops,
    durationMins,
    tngFare,
    cashFare,
    interchangesNeeded: 1,
    transferStation: transferStation.name,
    steps: [
      `Enter ${orig.station.name} (${orig.station.id}) and board ${orig.line.name}`,
      `Ride ${stopsL1} stops to ${transferStation.name} interchange`,
      `Follow transfer signs to ${dest.line.name} platform without tapping out`,
      `Board ${dest.line.name} and ride ${stopsL2} stops to ${dest.station.name} (${dest.station.id})`
    ],
    nextTrainMins,
    followingTrainMins: nextTrainMins + currentHeadwayMins,
    departureTimeStr: new Date(Date.now() + calculatedNextTrainSecs * 1000).toLocaleTimeString('en-GB')
  }
}
