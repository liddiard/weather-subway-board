const { getStationDepartures } = require('./departures')
const { drawBoard } = require('./board')
const constants = require('./constants')


const { STATION_ID, DISPLAY_REFRESH_SEC, NUM_TO_DISPLAY, DIRECTIONS } = constants
const { NORTH } = DIRECTIONS

let departures = []

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const updateDepartures = async () => {
  try {
    departures = await getStationDepartures(STATION_ID, NORTH)
  } catch (ex) {
    console.error(`Unable to fetch latest departures. ${ex}`)
  }
}

const main = async () => {
  updateDepartures()
  drawBoard(departures)
  .catch(ex => 
    console.error(`drawBoard failed with error: ${ex}.\nResponse: ${JSON.stringify(departures, null, 2)}`))
    await sleep(DISPLAY_REFRESH_SEC * 1000)
  }
  return await main()
}

main()
