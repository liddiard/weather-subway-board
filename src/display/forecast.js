const { getImages } = require('./utils')
const { drawText, drawPixel } = require('./utils')
const constants  = require('../constants')

const { COLORS } = constants

const drawGraphLine = (ctx, forecast, width) => {
  const periods = forecast.slice(0, width)
  const minTemperature = Math.min(
    ...forecast.map(f => f.temperature)
  )
  const bottom = 25
  for (let i = 0; i < periods.length; i++) {
    const { temperature } = periods[i]
    const degreesAboveMin = temperature - minTemperature
    drawPixel(ctx, COLORS.WHITE, { x: i, y: bottom - degreesAboveMin })
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