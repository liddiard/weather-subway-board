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

const main = async () => {
  try {
    const [
      departures,
      weather,
      hourlyForecast
    ] = await Promise.all([
      getTrains(SUBWAY_STATION_ID, SOUTH),
      getWeather(WEATHER_STATION_ID),
      getForecast(FORECAST_STATION_ID, FORECAST_GRIDPOINT, { type: 'hourly' })
    ])
    drawBoard(departures, weather, hourlyForecast)
  } catch (ex) {
    console.error(`[${new Date()}] Loop failed with error: ${ex.stack}`)
    return
  }
}

console.log('🏞  Loading images into RAM…')
initImages()
.then(async () => {
  console.log('✅ Image load complete. Starting main loop…')
  let lastUpdatedSec
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const currentSec = new Date().getSeconds()
    if (UPDATE_AT_SECS.has(currentSec) && currentSec !== lastUpdatedSec) {
      await main()
      lastUpdatedSec = currentSec
    }
  }
})
