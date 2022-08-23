const { getStationDepartures } = require('./departures')
const { drawBoard } = require('./board')
const constants = require('./constants')


const { STATION_ID, DISPLAY_CYCLE_SEC, NUM_TO_DISPLAY, DIRECTIONS } = constants
const { SOUTH } = DIRECTIONS

let departures = []

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const updateDepartures = async () => {
  try {
    departures = await getStationDepartures(STATION_ID, SOUTH)
  } catch (ex) {
    console.error(`Unable to fetch latest departures. ${ex}`)
  }
}

const main = async () => {
  if (!departures.length) {
    await updateDepartures()
  }
  const departuresToDisplay = Math.min(NUM_TO_DISPLAY, departures.length)
  for (let i = 0; i < departuresToDisplay; i += 2) {
    const isLast = i >= departuresToDisplay - 2
    drawBoard(departures.slice(i, i+2), departures)
    .catch(ex => 
      console.error(`drawBoard failed with error: ${ex}.\nResponse: ${JSON.stringify(departures, null, 2)}`))
    
    if (isLast) { // on last iteration of the loop, refresh departures async
      updateDepartures()
    }
    await sleep(DISPLAY_CYCLE_SEC * 1000)
  }
  return await main()
}

main()
