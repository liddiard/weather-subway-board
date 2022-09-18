const fs = require('fs')

const { createCanvas } = require('canvas')

const { drawTrains } = require('./trains')
const { drawWeather } = require('./weather')
const { drawForecast } = require('./forecast')
const constants = require('../constants')


const { MATRIX, BOARD_IMAGE_FILE } = constants


// set create `canvas` and `ctx` objects, draw background
const setUpCanvas = () => {
  const { WIDTH, HEIGHT } = MATRIX
  const canvas = createCanvas(WIDTH, HEIGHT) // LED board dimensions
  const ctx = canvas.getContext('2d')

  // black background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  return { canvas, ctx }
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
  
  // save image to disk
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(BOARD_IMAGE_FILE, buffer)
}

module.exports = {
  drawBoard
}
