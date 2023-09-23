const axios = require('axios')
const { cache } = require('./utils')
const { UPDATE_FREQUENCY_SECS } = require('../constants')

const fetchForecast = async (stationId, coordinates, options = {}) => {
  const type = options.type || ''
  const { 
    data: { 
      properties: { 
        periods
      } 
    } 
  } = await axios.get(`https://api.weather.gov/gridpoints/${stationId}/${coordinates.join()}/forecast/${type}?units=si`)
  return periods
}

const parseForecast = (periods) =>
  periods
  .map(period => ({
    ...period,
    startTime: new Date(period.startTime),
    endTime: new Date(period.endTime),
    windSpeed: parseInt(period.windSpeed)
  }))

const getForecast = async (stationId, coordinates, options) => {
  const response = await fetchForecast(stationId, coordinates, options)
  return parseForecast(response)
}

module.exports = {
  getForecast: cache(getForecast, UPDATE_FREQUENCY_SECS.FORECAST)
}