const suncalc = require('suncalc')

const { getImages } = require('./utils')
const { drawText, drawPixel, getInterpolatedColor } = require('./utils')
const constants  = require('../constants')


const { COLORS, GRADIENTS, LOCATION_COORDINATES, FORECAST_GRAPH } = constants
const { TOP, BOTTOM, WIDTH } = FORECAST_GRAPH

const getGraphPointColor = ({ startTime }) => {
  // Periods are 60 minutes long. Add 30 minutes to the start time to get the
  // midpoint of the forecast time, and use that time to derive the dot color.
  const middleTime = new Date(startTime.getTime() + 30*60*1000);
  const { altitude } = suncalc.getPosition(middleTime, ...LOCATION_COORDINATES)
  return getInterpolatedColor(altitude, GRADIENTS.SUN, { min: -0.4, max: 0.4 })
}

const drawGraphLines = (ctx, forecast, width) => {
  const periods = forecast.slice(0, WIDTH)
  const minTemperature = Math.min(
    ...forecast.map(f => f.temperature)
  )
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    const { temperature } = period
    const degreesAboveMin = temperature - minTemperature
    const color = getGraphPointColor(period)
    drawDaySeparator(ctx, period, i)
    drawPixel(ctx, color, { x: i, y: BOTTOM - degreesAboveMin })
  }
}

const drawDaySeparator = (ctx, period, i) => {
  const isMidnight = period.startTime.getHours() === 0
  if (!isMidnight) {
    return
  }
  const { r, g, b } = COLORS.DARK_GRAY
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(i, TOP, 1, BOTTOM - TOP)
}

const drawForecast = async (ctx, forecast) => {
  const images = await getImages()

  drawGraphLines(ctx, forecast)
}

module.exports = {
  drawForecast
}