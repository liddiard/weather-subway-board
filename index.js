const { getStationDepartures } = require('./departures')
const { displayBoard } = require('./board')
const constants = require('./constants')


const { STATION_ID, DISPLAY_CYCLE_SEC } = constants

let departures = []

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const updateDepartures = async () => {
  departures = await getStationDepartures(STATION_ID)
}

const main = async () => {
  if (!departures.length) {
    await updateDepartures()
  }
  for (let i = 0; i < departures.length; i += 2) {
    const isLast = i >= departures.length - 2
    displayBoard(departures.slice(i, i+2))
    // on the last iteration of the loop, refresh departures async
    if (isLast) {
      updateDepartures()
    }
    await sleep(DISPLAY_CYCLE_SEC * 1000)
  }
  return await main()
}

main()
