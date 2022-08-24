const interpolate = require('color-interpolate')

const { getImages } = require('./utils')
const { drawText, tintImage } = require('./utils')
const constants  = require('../constants')

const { COLORS, GRADIENTS } = constants

const getInterpolatedColor = (value, gradient, bounds) => {
  const { min, max } = bounds

  if (value < min) {
    return gradient[0]
  } else if (value > max) {
    return gradient[gradient.length - 1]
  }

  const range = max - min
  const percent = (value - min) / range
  const colormap = interpolate(gradient)
  const color = colormap(percent)

  // https://stackoverflow.com/a/10971090
  const colorArr = color.substring(4, color.length-1)
  .replace(/ /g, '')
  .split(',')

  return {
    r: colorArr[0],
    g: colorArr[1],
    b: colorArr[2]
  }
}


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
      image = weather.sun_with_scattered_cloud
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

const drawWeather = async (ctx, weather) => {
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
    images: await getImages()
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