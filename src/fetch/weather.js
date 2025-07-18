const axios = require('axios')
const { cache } = require('./utils')
const constants = require('../constants')

const { UPDATE_FREQUENCY_SECS, WEATHER_COORDINATES } = constants
const { PIRATE_API_KEY } = process.env

if (!PIRATE_API_KEY) {
  throw Error(`Pirate weather API key (PIRATE_API_KEY) is not set.`)
}

const fetchWeather = async (stationId) => {
  const url = new URL(`https://api.pirateweather.net/forecast/${PIRATE_API_KEY}/${WEATHER_COORDINATES.join()}`)
  url.search = new URLSearchParams({
    units: 'ca', // SI, with Wind Speed and Wind Gust in kilometres per hour.
    exclude: ['minutely', 'hourly', 'daily'].join(),
    icon: 'pirate'
  }).toString()
  const {
    data: {
      currently
    }
  } = await axios.get(url)
  return currently
}

// https://study.com/learn/lesson/cardinal-intermediate-directions-map-compass.html
const degreeToIntermediateDirection = (degree) => {
  if (degree >= 337.5 || degree < 22.5) {
    return 'N'
  } else if (degree < 67.5) {
    return 'NE'
  } else if (degree < 112.5) {
    return 'E'
  } else if (degree < 157.5) {
    return 'SE'
  } else if (degree < 202.5) {
    return 'S'
  } else if (degree < 247.5) {
    return 'SW'
  } else if (degree < 292.5) {
    return 'W'
  } else if (degree < 337.5) {
    return 'NW'
  } else {
    throw Error(`Degree out of range: ${degree}`)
  }
}
const getWeather = async (stationId) => {
  const response = await fetchWeather(stationId)
  const {
    icon,
    windBearing,
    windSpeed,
    windGust,
    temperature,
    humidity
  } = response

  const wind = {
    direction: windBearing ?
      degreeToIntermediateDirection(windBearing) :
      'Ø',
    speed: windSpeed,
    gust: windGust
  }

  return {
    icon,
    wind,
    temperature,
    humidity
  }
}

module.exports = {
  getWeather: cache(getWeather, UPDATE_FREQUENCY_SECS.WEATHER)
}