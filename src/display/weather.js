const { images } = require('./image')
const { drawText, tintImage, getInterpolatedColor } = require('./utils')
const constants  = require('../constants')

const { COLORS, GRADIENTS, WEATHER_DESCRIPTION_TO_IMAGE } = constants


const drawTemperature = (ctx, layout, temperature) => {
  const color = getInterpolatedColor(
    temperature,
    GRADIENTS.TEMPERATURE,
    { min: -10, max: 40 }
  )
  return drawText(
    ctx,
    Math.round(temperature).toString(),
    { x: layout.cursorPosition, y: 1 },
    color
  ) + layout.spacing
}

const drawHumidity = (ctx, layout, humidity) => {
  const color = getInterpolatedColor(
    humidity,
    GRADIENTS.HUMIDITY,
    { min: 0, max: 100 }
  )
  layout.cursorPosition = drawText(
    ctx,
    Math.round(humidity).toString(),
    { x: layout.cursorPosition, y: 1 },
    color
  )
  return drawText(
    ctx,
    '%',
    { x: layout.cursorPosition + 1, y: 1 }
  ) + layout.spacing
}

const drawWeatherImage = (ctx, layout, textDescription) => {
  const { weather } = layout.images
  let filename = WEATHER_DESCRIPTION_TO_IMAGE[textDescription]
  if (!filename) {
    console.warn(`No weather icon for: '${textDescription}'`)
    filename = 'not_available'
  }
  
  ctx.drawImage(weather[filename],
    layout.cursorPosition,
    1
  )

  return layout.cursorPosition + 5 + layout.spacing
}

const drawWind = (ctx, layout, { speed, direction, gust }) => {
  const { directions } = layout.images
  ctx.drawImage(
    directions.bg,
    layout.cursorPosition,
    1
  )
  ctx.drawImage(
    tintImage(
      directions[direction],
      gust ? COLORS.ORANGE : COLORS.GREEN
    ),
    layout.cursorPosition,
    1
  )
  layout.cursorPosition += 5 // "direction" icon width
  return drawText(
    ctx,
    Math.round(speed).toString(),
    { x: layout.cursorPosition + 1, y: 1 }
  ) + layout.spacing
}

const drawTime = (ctx, layout) =>
  drawText(
    ctx,
    new Date().toLocaleTimeString([], {
      timeStyle: 'short', hour12: false 
    }).replace(':', ''),
    { x: layout.cursorPosition, y: 1 }
  ) + layout.spacing

const drawWeather = (ctx, weather) => {
  const {
    temperature,
    textDescription,
    relativeHumidity,
    wind
  } = weather

  const layout = {
    cursorPosition: 1,
    spacing: 2,
    images
  }

  layout.cursorPosition = drawTime(ctx, layout)

  // temperature
  layout.cursorPosition = drawTemperature(ctx, layout, temperature)

  // TODO: weather image
  layout.cursorPosition = drawWeatherImage(ctx, layout, textDescription)

  // humidity
  layout.cursorPosition = drawHumidity(ctx, layout, relativeHumidity)

  // wind
  layout.cursorPosition = drawWind(ctx, layout, wind)
}

module.exports = {
  drawWeather
}