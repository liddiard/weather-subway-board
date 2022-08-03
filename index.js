const { createClient } = require('mta-realtime-subway-departures')
const constants = require('./constants')

const { STATION_ID, NUM_TO_DISPLAY, DIRECTIONS } = constants
const { NORTH, SOUTH } = DIRECTIONS


// https://api.mta.info/#/AccessKey
const { API_KEY } = process.env
const client = createClient(API_KEY)

if (!API_KEY) {
  throw Error('Missing required environment variable `API_KEY`. Get one here: https://api.mta.info/#/AccessKey ')
}

// convert times from seconds-based Unix timestamps to JS Date objects
const convertResponseDates = (departures) => 
  Object.entries(departures)
  .reduce((acc, [direction, departures]) => ({
    ...acc,
    [direction]: departures.map(d => ({
      ...d, 
      time: new Date(d.time * 1000)
    }))
  }), {})

// only retain the next `NUM_TO_DISPLAY` departures in each direction
const truncateDepartureLists = (departures) => ({
    [NORTH]: departures[NORTH].slice(0, NUM_TO_DISPLAY),
    [SOUTH]: departures[SOUTH].slice(0, NUM_TO_DISPLAY)
  })

// convert the individual "N" and "S" arrays into a single array, with
// departure objects annotated by direction, and sorted by departure time
const flattenResponseList = (departures) => [
    departures[NORTH].map(d => ({ ...d, direction: NORTH })),
    departures[SOUTH].map(d => ({ ...d, direction: SOUTH }))
  ]
  .flat()
  .sort((a, b) => a.time - b.time)

// add a `minutesFromNow` entry to each departure object
const addRelativeTimes = (departures) =>
  departures.map(d => ({
    ...d,
    minutesFromNow: Math.floor((d.time - new Date())/1000/60)
  }))

const getStationDepartures = async (stationId) => {
  let response;
  try {
    response = await client.departures(stationId)
  } catch (ex) {
    throw Error(`Unable to retrieve departures for station ID ${stationId}. Network Error: ${ex.message}`)
  }
  const { departures } = response.lines[0]
  return [
    convertResponseDates,
    truncateDepartureLists,
    flattenResponseList,
    addRelativeTimes
  ]
  .reduce((acc, cur) => 
    cur(acc), departures)
}

const main = async () => {
  const departures = await getStationDepartures(STATION_ID)
  console.log(departures)
}

main()



