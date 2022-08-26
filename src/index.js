const { getTrains, getWeather, getForecast } = require('./fetch')
const { drawBoard } = require('./display')
const { initImages } = require('./display/image')
const constants = require('./constants')


const { 
  SUBWAY_STATION_ID,
  WEATHER_STATION_ID,
  FORECAST_STATION_ID,
  FORECAST_GRIDPOINT,
  DISPLAY_UPDATE_SEC,
  DIRECTIONS
} = constants
const { SOUTH } = DIRECTIONS

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const main = async () => {
  const [
    departures,
    weather,
    dailyForecast,
    hourlyForecast
  ] = await Promise.all([
    getTrains(SUBWAY_STATION_ID, SOUTH),
    getWeather(WEATHER_STATION_ID),
    getForecast(FORECAST_STATION_ID, FORECAST_GRIDPOINT),
    getForecast(FORECAST_STATION_ID, FORECAST_GRIDPOINT, { type: 'hourly' })
  ])
  .catch(ex =>
    console.error(`Fetching API data failed with error: ${ex}`)
  )
  
  drawBoard(departures, weather, dailyForecast, hourlyForecast)

  await sleep(DISPLAY_UPDATE_SEC * 1000)
  return await main()
}

console.log('🏞  Loading images into RAM…')
initImages()
.then(() => {
  console.log('✅ Image load complete. Starting main loop…')
  main()
})
