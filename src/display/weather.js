const { images } = require('./image')
const constants = require('../constants')
const {
  drawText,
  getTextWidth,
  tintImage,
  getInterpolatedColor,
  getTimeSpecificWeatherIcon
} = require('./utils')


const { COLORS, GRADIENTS, WEATHER_ICON_MAP } = constants

// display color-coded temperature integer
const drawTemperature = (ctx, layout, temperature) => {
  if (temperature === null) {
    return layout.cursorPosition
  }
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
  if (humidity === null) {
    return layout.cursorPosition
  }
  const color = getInterpolatedColor(
    humidity,
    GRADIENTS.HUMIDITY,
    { min: 0, max: 1 }
  )
  layout.cursorPosition = drawText(
    ctx,
    Math.round(humidity * 100).toString(),
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
const drawWeatherIcon = (ctx, layout, icon) => {
  const { weather } = layout.images

  // sometimes the description is an empty string; skip this function if so
  if (!icon) {
    console.warn('Empty weather icon; skipping draw.')
    return layout.cursorPosition
  }

  // we'll calculate whether to use the day or night variant of an icon based
  // on sum position rather than letting the API do it for us
  const timeAgnosticIcon = icon.replace(/-day|-night/, '')
  let filename = getTimeSpecificWeatherIcon(WEATHER_ICON_MAP[timeAgnosticIcon])
  if (!filename) {
    console.warn(`No weather icon for: '${icon}'`)
    filename = 'not_available'
  }

  ctx.drawImage(weather[filename],
    layout.cursorPosition,
    layout.top
  )

  return layout.cursorPosition + layout.imageWidth + layout.spacing
}

const getWindDisplaySpeed = ({ gust, speed }) => {
  const gustFactor = gust - speed
  const showGust = gustFactor > 5
  const displaySpeed = showGust ? gust : speed
  return {
    displaySpeed,
    showGust
  }
}


// display color-coded wind gust or speed and a direction indicator
const drawWind = (ctx, layout, wind) => {
  const { directions } = layout.images
  const { displaySpeed, showGust } = getWindDisplaySpeed(wind)
  const color = getInterpolatedColor(
    displaySpeed,
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
      directions[wind.direction],
      showGust ? COLORS.ORANGE : COLORS.GREEN
    ),
    layout.cursorPosition,
    layout.top
  )
  layout.cursorPosition += layout.imageWidth
  return drawText(
    ctx,
    Math.round(displaySpeed).toString(),
    { x: layout.cursorPosition + 1, y: layout.top },
    color
  ) + layout.spacing
}

const getTimeString = () =>
  new Date().toLocaleTimeString([], {
    timeStyle: 'short',
    // Note: Due to a bug in ECMAScript, `hour12: false` displays the first
    // hour of the day as "24" instaed of "0". This should be fixed in the
    // future, but for now using `hourCycle: 'h23'` as a workaround.
    // ref: https://github.com/moment/luxon/issues/726#issuecomment-675151145
    hourCycle: 'h23'
  })
    .replace(':', '') // remove the colon separator
    .replace(/^0/, '') // remove leading zero

// display the current 24-hour time without leading zero or colon separator
// (not shown due to space constraints)
const drawTime = (ctx, layout) =>
  drawText(
    ctx,
    getTimeString(),
    { x: layout.cursorPosition, y: layout.top }
  ) + layout.spacing

// returns how many spaces to include between segments on the weather display,
// based on total text width
const getSpacing = (weather) => {
  const {
    temperature,
    humidity,
    wind
  } = weather

  // sum all the variable widths within the weather display
  const totalWidth = [
    getTimeString(),
    Math.round(temperature),
    Math.round(humidity * 100),
    Math.round(getWindDisplaySpeed(wind).displaySpeed)
  ]
    .filter(x => x !== null)
    .reduce((acc, cur) =>
      acc + getTextWidth(cur.toString())
      , 0)

  // max "breakpoint" for 3 spaces: based on variable text width +
  // fixed elements' width (icons, static text)
  return totalWidth > 29 ? 2 : 3
}

// draw current weather conditions along the top of the board
const drawWeather = (ctx, weather) => {
  const {
    temperature,
    icon,
    humidity,
    wind
  } = weather

  const layout = {
    cursorPosition: 0,
    top: 0,
    // space between different segments like time & temperature
    spacing: getSpacing(weather),
    images,
    imageWidth: 5
  }

  layout.cursorPosition = drawTime(ctx, layout)
  layout.cursorPosition = drawTemperature(ctx, layout, temperature)
  layout.cursorPosition = drawWeatherIcon(ctx, layout, icon)
  layout.cursorPosition = drawHumidity(ctx, layout, humidity)
  layout.cursorPosition = drawWind(ctx, layout, wind)
}

module.exports = {
  drawWeather
}