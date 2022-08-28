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
    { x: layout.cursorPosition, y: layout.top },
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
    { x: layout.cursorPosition, y: layout.top },
    color
  )
  return drawText(
    ctx,
    '%',
    { x: layout.cursorPosition + 1, y: layout.top }
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
    layout.top
  )

  return layout.cursorPosition + layout.imageWidth + layout.spacing
}

const drawWind = (ctx, layout, { speed, direction, gust }) => {
  const { directions } = layout.images
  ctx.drawImage(
    directions.bg,
    layout.cursorPosition,
    layout.top
  )
  ctx.drawImage(
    tintImage(
      directions[direction],
      gust ? COLORS.ORANGE : COLORS.GREEN
    ),
    layout.cursorPosition,
    layout.top
  )
  layout.cursorPosition += layout.imageWidth
  return drawText(
    ctx,
    Math.round(speed).toString(),
    { x: layout.cursorPosition + 1, y: layout.top }
  ) + layout.spacing
}

const drawTime = (ctx, layout) =>
  drawText(
    ctx,
    new Date().toLocaleTimeString([], {
      timeStyle: 'short',
      // Note: Due to a bug in ECMAScript, `hour12: false` displays the first
      // hour of the day as "24" instaed of "0". This should be fixed in the
      // future, but for now using `hourCycle: 'h23'` as a workaround.
      // ref: https://github.com/moment/luxon/issues/726#issuecomment-675151145
      hourCycle: 'h23'
    }).replace(':', ''),
    { x: layout.cursorPosition, y: layout.top }
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
    top: 0,
    spacing: 2,
    images,
    imageWidth: 5
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