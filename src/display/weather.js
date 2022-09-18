const { images } = require('./image')
const constants  = require('../constants')
const {
  drawText,
  tintImage,
  getInterpolatedColor,
  getTimeSpecificWeatherIcon 
} = require('./utils')

const { COLORS, GRADIENTS, WEATHER_DESCRIPTION_TO_IMAGE } = constants

// display color-coded temperature integer
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

// display color-coded humidity as integer with percent sign
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

// display the current weather image based on text description, or log a
// warning and display a placeholder if current description doesn't have an
// image mapping so we know to add it (could not find an exhaustive list of
// possible weather descriptions)
const drawWeatherIcon = (ctx, layout, textDescription) => {
  const { weather } = layout.images
  let filename = getTimeSpecificWeatherIcon(WEATHER_DESCRIPTION_TO_IMAGE[textDescription])
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

// display wind speed and direction indicator, color-coded by gust (if gusting),
// or by non-gust speed
const drawWind = (ctx, layout, { speed, direction, gust }) => {
  const { directions } = layout.images
  const color = getInterpolatedColor(
    gust || speed,
    GRADIENTS.WIND,
    { min: 5, max: 30 }
  )
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
    { x: layout.cursorPosition + 1, y: layout.top },
    color
  ) + layout.spacing
}

// display the current 24-hour time without leading zero or colon separator
// (not shown due to space constraints)
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
    })
    .replace(':', '') // remove the colon separator
    .replace(/^0/, ''), // remove leading zero
    { x: layout.cursorPosition, y: layout.top }
  ) + layout.spacing

// draw current weather conditions along the top of the board
const drawWeather = (ctx, weather) => {
  const {
    temperature,
    textDescription,
    relativeHumidity,
    wind
  } = weather

  const layout = {
    cursorPosition: 0,
    top: 0,
    spacing: 2, // space between different parts like time & temperature
    images,
    imageWidth: 5
  }

  layout.cursorPosition = drawTime(ctx, layout)
  layout.cursorPosition = drawTemperature(ctx, layout, temperature)
  layout.cursorPosition = drawWeatherIcon(ctx, layout, textDescription)
  layout.cursorPosition = drawHumidity(ctx, layout, relativeHumidity)
  layout.cursorPosition = drawWind(ctx, layout, wind)
}

module.exports = {
  drawWeather
}