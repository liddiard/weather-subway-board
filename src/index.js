const { getTrains, getWeather, getForecast } = require('./fetch')
const { drawBoard } = require('./display')
const { initImages } = require('./display/image')
const constants = require('./constants')


const { 
  SUBWAY_STATION_ID,
  WEATHER_STATION_ID,
  FORECAST_STATION_ID,
  FORECAST_GRIDPOINT,
  UPDATE_AT_SECS,
  DIRECTIONS
} = constants
const { SOUTH } = DIRECTIONS

const sleep = (sec) => new Promise(resolve => setTimeout(resolve, sec * 1000))

const rejectAfter = (sec) =>
  new Promise((_, reject) =>
    setTimeout(() =>
      reject(`rejectAfter: Timed out after ${sec} sec.`), sec * 1000))

const main = async () => {
  try {
    const [
      departures,
      weather,
      hourlyForecast
    ] = await Promise.allSettled([
      getTrains(SUBWAY_STATION_ID, SOUTH),
      getWeather(WEATHER_STATION_ID),
      getForecast(FORECAST_STATION_ID, FORECAST_GRIDPOINT, { type: 'hourly' })
    ])
    drawBoard(departures, weather, hourlyForecast)
  } catch (ex) {
    console.error(`[${new Date()}] Loop failed with error:\n${ex.stack}`)
    return
  }
}

console.log('🏞  Loading images into RAM…')
initImages()
.then(async () => {
  console.log('✅ Image load complete. Starting main loop…')
  let lastUpdatedSec
  // Update the board at certain seconds clock time. We do this so the time
  // display on the board will be as current as possible.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const currentSec = new Date().getSeconds()
    if (UPDATE_AT_SECS.has(currentSec) && currentSec !== lastUpdatedSec) {
      await Promise.race([
        main(),
        // reject and move on if main takes too long to run
        rejectAfter(20)
      ])
      .catch(ex => console.error(ex))
      lastUpdatedSec = currentSec
    } else {
      // sleep to reduce CPU usage on slow Raspberry Pis
      await sleep(1)
    }
  }
})
