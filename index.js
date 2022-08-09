const { getStationDepartures } = require('./src/departures')
const { drawBoard } = require('./src/board')
const constants = require('./src/constants')


const { STATION_ID, DISPLAY_CYCLE_SEC, NUM_TO_DISPLAY, DIRECTIONS } = constants
const { NORTH } = DIRECTIONS


let departures = []

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const updateDepartures = async () => {
  departures = await getStationDepartures(STATION_ID, NORTH)
}

const main = async () => {
  if (!departures.length) {
    await updateDepartures()
  }
  for (let i = 0; i < NUM_TO_DISPLAY; i += 2) {
    const isLast = i >= NUM_TO_DISPLAY - 2
    try {
      drawBoard(departures.slice(i, i+2), departures)
    } catch (ex) {
      console.log(`drawBoard failed with error: ${ex}.\nResponse: ${departures}`)
    }
    if (isLast) { // on last iteration of the loop, refresh departures async
      updateDepartures()
    }
    await sleep(DISPLAY_CYCLE_SEC * 1000)
  }
  return await main()
}

main()
