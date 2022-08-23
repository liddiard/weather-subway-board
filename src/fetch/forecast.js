const axios = require('axios')

const fetchForecast = async (stationId, coordinates) => {
  const { 
    data: { 
      properties: { 
        periods
      } 
    } 
  } = await axios.get(`https://api.weather.gov/gridpoints/${stationId}}/${coordinates.join()}}/forecast/hourly?units=si`)
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

const getForecast = async (stationId, coordinates) => {
  const response = await fetchForecast(stationId, coordinates)
  return parseForecast(response)
}

module.exports = {
  getForecast
}