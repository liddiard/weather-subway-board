const axios = require('axios')
const constants = require('../constants')

const { VRB } = constants

const fetchWeather = async (stationId) => {
  const { 
    data: { 
      properties: { 
        rawMessage,
        textDescription
      } 
    } 
  } = await axios.get(`https://api.weather.gov/stations/${stationId}/observations/latest`)
  return {
    rawMessage,
    textDescription
  }
}

// https://regex101.com/r/U3QQId/
const extractWindFromMetar = (metar) => {
  const match = metar.match(/(?<angle>\d{3}|VRB)(?<speed>\d+)G?(?<gust>\d+)?KT/)
  if (!match) {
    return { angle: 0, speed: 0, gust: 0 }
  }
  const { angle, speed, gust } = match.groups
  return {
    angle: angle === VRB ? angle : parseInt(angle),
    speed: parseInt(speed),
    gust: gust ? parseInt(gust) : null
  }
}

const parseTemperature = (temperature) =>
  temperature.startsWith('M') ?
    parseInt(temperature.substring(1)) * -1 :
    parseInt(temperature)

// https://regex101.com/r/Ya1frl/
const extractTempDewPointFromMetar = (metar) => {
  const match = metar.match(/\s(?<temperature>M?\d+)\/(?<dewPoint>M?\d+)\s/)
  if (!match) {
    return { temperature: 0, dewPoint: 0 }
  }
  const { temperature, dewPoint } = match.groups
  return {
    temperature: parseTemperature(temperature),
    dewPoint: parseTemperature(dewPoint)
  }
}

// https://bmcnoldy.rsmas.miami.edu/Humidity.html
const calculateRelativeHumidity = (t, dp) =>
  100*(Math.exp((17.625*dp)/(243.04+dp))/Math.exp((17.625*t)/(243.04+t)))

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

const parseWeather = (response) => {
  const { textDescription } = response
  const metar = response.rawMessage

  const wind = extractWindFromMetar(metar)
  wind.direction = wind.angle === VRB || wind.speed === 0 ?
    'Ø' :
    degreeToIntermediateDirection(wind.angle)

  const { temperature, dewPoint } = extractTempDewPointFromMetar(metar)
  const relativeHumidity = calculateRelativeHumidity(temperature, dewPoint)

  return {
    textDescription,
    wind,
    temperature,
    dewPoint,
    relativeHumidity
  }
}

const getWeather = async (stationId) => {
  const response = await fetchWeather(stationId)
  return parseWeather(response)
}

module.exports = {
  getWeather
}