const axios = require('axios')

const fetchForecast = async (stationId, coordinates, options = {}) => {
  const type = options.type || ''
  const { 
    data: { 
      properties: { 
        periods
      } 
    } 
  } = await axios.get(`https://api.weather.gov/gridpoints/${stationId}/${coordinates.join()}/forecast/${type}?units=si`)
  .catch(err => console.error(err))
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
  getForecast
}