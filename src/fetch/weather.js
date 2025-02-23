const axios = require('axios')
const { cache } = require('./utils')
const constants = require('../constants')

const { UPDATE_FREQUENCY_SECS } = constants

const fetchWeather = async (stationId) => {
  const {
    data: {
      properties
    }
  } = await axios.get(`https://api.weather.gov/stations/${stationId}/observations/latest`)
  return properties
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
    textDescription,
    windDirection,
    windSpeed,
    windGust,
    temperature,
    relativeHumidity
  } = response

  const wind = {
    direction: windDirection.value === null ?
      'Ø' :
      degreeToIntermediateDirection(windDirection.value),
    speed: windSpeed.value === null ? 0 : windSpeed.value,
    gust: windGust.value
  }

  return {
    textDescription,
    wind,
    temperature: temperature.value,
    relativeHumidity: relativeHumidity.value
  }
}

module.exports = {
  getWeather: cache(getWeather, UPDATE_FREQUENCY_SECS.WEATHER)
}