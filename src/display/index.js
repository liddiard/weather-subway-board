const fs = require('fs')
const path = require('path')

const { createCanvas } = require('canvas')
const suncalc = require('suncalc')

const { drawTrains } = require('./trains')
const { drawWeather } = require('./weather')
const { drawForecast } = require('./forecast')
const { getInterpolatedColor } = require('./utils')
const constants = require('../constants')


const {
  MATRIX,
  BOARD_IMAGE_FILE,
  LOCATION_COORDINATES,
  COLORS,
  NIGHT_SHIFT_WARMTH
} = constants
const { WIDTH, HEIGHT } = MATRIX
const { DIM_DISPLAY_AMOUNT } = process.env


// set create `canvas` and `ctx` objects, draw background
const setUpCanvas = () => {
  const canvas = createCanvas(WIDTH, HEIGHT) // LED board dimensions
  const ctx = canvas.getContext('2d')

  // black background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  return { canvas, ctx }
}

// draw a partially transparent black rectangle over the entire image to "dim"
// the display
const drawOpacityMask = (ctx, opacity) => {
  ctx.fillStyle = `rgba(0,0,0, ${opacity})`
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

// tint the display orange when the sun is down (simlar to Night Shift)
const drawNightShiftMask = (ctx) => {
  const { r, g, b } = COLORS.ORANGE
  const { altitude } = suncalc.getPosition(new Date(), ...LOCATION_COORDINATES)
  const opacity = getInterpolatedColor(
    altitude,
    [NIGHT_SHIFT_WARMTH, 0],
    { min: -0.2, max: 0.2 }
  )
  // retain the darkest pixels from each layer
  ctx.globalCompositeOperation = 'darken'
  ctx.fillStyle = `rgba(${r},${g},${b}, ${opacity})`
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  // reset to default value
  ctx.globalCompositeOperation = 'source-over'
}

// generates and writes a new board image file to disk
// first argument, array of two departure objects:
// {
//   routeId: '1' | '2' | '3',
//   minutesFromNow: Number
// }
// a.k.a. `currentDepartures` shown in large green numbers, and full array of
// `allDepartures` (second argument) shown as dots on a timeline
const drawBoard = (departures, weather, hourlyForecast) => {
  const { canvas, ctx } = setUpCanvas()

  drawTrains(ctx, departures)
  drawWeather(ctx, weather)
  drawForecast(ctx, hourlyForecast)

  drawNightShiftMask(ctx)

  // darken the entire display if environment variable set
  if (DIM_DISPLAY_AMOUNT) {
    drawOpacityMask(ctx, parseFloat(DIM_DISPLAY_AMOUNT))
  }
  
  // save image to disk
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(
    path.resolve(__dirname, BOARD_IMAGE_FILE),
    buffer
  )
}

module.exports = {
  drawBoard
}
