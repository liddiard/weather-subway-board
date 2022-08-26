const { images } = require('./image')
const { drawText, tintImage, getInterpolatedColor } = require('./utils')
const constants  = require('../constants')

const { COLORS, GRADIENTS } = constants


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
  let image
  switch (textDescription) {
    case 'Clear':
      image = weather.sun
      break
    case 'Mostly Clear':
      image = weather.sun_with_scattered_clouds
      break
    case 'Partly Cloudy':
      image = weather.sun_with_two_clouds
      break
    case 'Mostly Cloudy':
      image = weather.sun_behind_cloud
      break
    case 'Cloudy':
      image = weather.cloud
      break
    default:
      console.warn(`No weather icon for: '${textDescription}'`)
      image = weather.not_available
      break
  }
  
  ctx.drawImage(image,
    layout.cursorPosition,
    1
  )

  return layout.cursorPosition + 5 + layout.spacing
}

const drawWind = (ctx, layout, { windSpeed, windDirection, windGust }) => {
  ctx.drawImage(
    tintImage(
      layout.images.directions[windDirection],
      windGust ? COLORS.ORANGE : COLORS.GREEN
    ),
    layout.cursorPosition,
    1
  )
  layout.cursorPosition += 5 // "direction" icon width
  return drawText(
    ctx,
    Math.round(windSpeed).toString(),
    { x: layout.cursorPosition + 1, y: 1 }
  )
}

const drawWeather = (ctx, weather) => {
  const {
    temperature,
    textDescription,
    relativeHumidity,
    windDirection,
    windSpeed,
    windGust
  } = weather

  const layout = {
    cursorPosition: 1,
    spacing: 3,
    images
  }

  // temperature
  layout.cursorPosition = drawTemperature(ctx, layout, temperature)

  // TODO: weather image
  layout.cursorPosition = drawWeatherImage(ctx, layout, textDescription)

  // humidity
  layout.cursorPosition = drawHumidity(ctx, layout, relativeHumidity)

  // wind
  drawWind(ctx, layout, { windSpeed, windDirection, windGust })
}

module.exports = {
  drawWeather
}