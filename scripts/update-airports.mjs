import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceBase = 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main'

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1 }
      else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(field); field = '' }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = '' }
    else field += char
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const headers = rows.shift()
  return rows.filter(rowValues => rowValues.length >= headers.length).map(rowValues => Object.fromEntries(headers.map((header, index) => [header, rowValues[index]])))
}

async function download(name) {
  const response = await fetch(`${sourceBase}/${name}`)
  if (!response.ok) throw new Error(`Unable to download ${name}: ${response.status}`)
  return parseCsv(await response.text())
}

const [airportRows, countryRows] = await Promise.all([download('airports.csv'), download('countries.csv')])
const countries = new Map(countryRows.map(country => [country.code, country.name]))
const typeRank = { large_airport: 3, medium_airport: 2, small_airport: 1, seaplane_base: 0 }

const candidates = airportRows
  .filter(airport => airport.iata_code && airport.type !== 'closed_airport' && airport.type !== 'heliport' && airport.type !== 'balloonport')
  .map(airport => ({
    code: airport.iata_code,
    city: airport.municipality || airport.name.replace(/\s+(International\s+)?Airport.*$/i, ''),
    airport: airport.name,
    country: countries.get(airport.iso_country) || airport.iso_country,
    countryCode: airport.iso_country,
    lat: Number(airport.latitude_deg),
    lng: Number(airport.longitude_deg),
    scheduled: airport.scheduled_service === 'yes',
    type: airport.type,
    keywords: airport.keywords || ''
  }))
  .sort((left, right) => Number(right.scheduled) - Number(left.scheduled) || (typeRank[right.type] || 0) - (typeRank[left.type] || 0) || left.city.localeCompare(right.city))

const unique = [...new Map(candidates.map(airport => [airport.code, airport])).values()]
await mkdir(path.join(root, 'src', 'data'), { recursive: true })
await writeFile(path.join(root, 'src', 'data', 'airports.json'), `${JSON.stringify(unique)}\n`, 'utf8')
console.log(`Bundled ${unique.length.toLocaleString()} active IATA-coded airports from OurAirports.`)
