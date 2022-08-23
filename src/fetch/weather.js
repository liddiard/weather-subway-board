const axios = require('axios')

const fetchWeather = async (stationId) => {
  const { 
    data: { 
      properties: { 
        textDescription,
        temperature,
        windDirection,
        windSpeed,
        windGust,
        relativeHumidity 
      } 
    } 
  } = await axios.get(`https://api.weather.gov/stations/${stationId}/observations/latest`)
  return {
    textDescription,
    temperature,
    windDirection,
    windSpeed,
    windGust,
    relativeHumidity
  }
}

// https://study.com/learn/lesson/cardinal-intermediate-directions-map-compass.html
const degreeToIntermediateDirection = (degree) => {
  if (degree >= 377.5 || degree < 22.5) {
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

const isObject = (value) =>
  typeof value === 'object' && value !== null

const parseWeather = (response) => {
  const flattened = Object.entries(response)
  .reduce((acc, [key, val]) => ({
    ...acc,
    [key]: isObject(val) ? val.value : val
  }), {})
  const { windSpeed, windGust, windDirection } = flattened
  flattened.windDirection = windSpeed > 0 ? degreeToIntermediateDirection(windDirection) : 'Ø'
  // flattened.isGusting = typeof windGust === 'number' && windGust / windSpeed > 1.1
  return flattened
}

const getWeather = async (stationId) => {
  const response = await fetchWeather(stationId)
  return parseWeather(response)
}

module.exports = {
  getWeather
}