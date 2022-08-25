const suncalc = require('suncalc')

const { getImages } = require('./utils')
const { drawText, drawPixel, getInterpolatedColor } = require('./utils')
const constants  = require('../constants')


const { GRADIENTS, LOCATION_COORDINATES } = constants

const getGraphPointColor = (period) => {
  const startTime = new Date(period.startTime)
  // Periods are 60 minutes long. Add 30 minutes to the start time to get the
  // midpoint of the forecast time, and use that time to derive the dot color.
  const middleTime = new Date(startTime.getTime() + 30*60*1000);
  const { altitude } = suncalc.getPosition(middleTime, ...LOCATION_COORDINATES)
  return getInterpolatedColor(altitude, GRADIENTS.SUN, { min: -0.3, max: 0.3 })
}

const drawGraphLine = (ctx, forecast, width) => {
  const periods = forecast.slice(0, width)
  const minTemperature = Math.min(
    ...forecast.map(f => f.temperature)
  )
  const bottom = 26
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    const { temperature } = period
    const degreesAboveMin = temperature - minTemperature
    const color = getGraphPointColor(period)
    drawPixel(ctx, color, { x: i, y: bottom - degreesAboveMin })
  }
}

const drawForecast = async (ctx, forecast) => {
  const images = await getImages()
  const width = 58

  drawGraphLine(ctx, forecast, width)
}

module.exports = {
  drawForecast
}