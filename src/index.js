const { getStationDepartures, getWeather, getForecast } = require('./fetch')
const { drawBoard } = require('./display')
const constants = require('./constants')


const { 
  SUBWAY_STATION_ID,
  WEATHER_STATION_ID,
  FORECAST_STATION_ID,
  FORECAST_COORDS,
  DISPLAY_UPDATE_SEC,
  DIRECTIONS
} = constants
const { SOUTH } = DIRECTIONS

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const main = async () => {
  const [departures, weather, forecast] = await Promise.all([
    getStationDepartures(SUBWAY_STATION_ID, SOUTH),
    // getWeather(WEATHER_STATION_ID),
    // getForecast(FORECAST_STATION_ID, FORECAST_COORDS)
  ])
  .catch(ex =>
    console.error(`Fetching API data failed with error: ${ex}`)
  )
  drawBoard(departures, weather, forecast)
  .catch(ex => 
    console.error(`drawBoard failed with error: ${ex.stack}.\nResponse: ${JSON.stringify(departures, null, 2)}`))

  await sleep(DISPLAY_UPDATE_SEC * 1000)
  return await main()
}

main()
