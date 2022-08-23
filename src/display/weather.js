const { getImages } = require('./utils')
const { drawText, tintImage } = require('./utils')
const constants  = require('../constants')

const { COLORS } = constants


const drawTemperature = (ctx, layout, temperature) => {
  return drawText(
    ctx,
    Math.round(temperature).toString(),
    { x: layout.cursorPosition, y: 1 }
  ) + layout.spacing
}

const drawHumidity = (ctx, layout, humidity) => {
  return drawText(
    ctx,
    `${Math.round(humidity)}%`,
    { x: layout.cursorPosition, y: 1 }
  ) + layout.spacing
}

const drawWeatherImage = (ctx, layout, textDescription) => {
  const { weather } = layout.images
  let image;
  switch (textDescription) {
    case 'Mostly Clear':
      image = weather.sun_with_scattered_cloud
      break;
    case 'Mostly Cloudy':
      image = weather.sun_behind_cloud
      break;
    default:
      console.log(`No weather icon for: '${textDescription}'`)
      image = weather.not_available
      break;
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