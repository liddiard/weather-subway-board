const fs = require('fs')

const { createCanvas } = require('canvas')

const constants = require('./constants')
const { getImages } = require('./image')


const { MATRIX, BOARD_IMAGE_FILE, TRAINS, COLORS } = constants

let images

const isLocal = (routeId) =>
  TRAINS.LOCAL.has(routeId)



// draw an integer (`number`), right-aligned, with the given offset
// given the dimension constraints of the matrix, integers with a maximum of
// two digits are recommended though larger numbers will work; they'll just
// overlap with other elements on the screen
const drawInteger = (ctx, number, offset) => {
  // width of the character itself + spacing between characters
  const letterSpacing = 12
  const { x, y } = offset
  const numArray = number.toString().split('')
  const isNil = number === 0
  // iterate backwards through the array of single digits, starting with the
  // least significant digit on the right and work toward the left
  for (let i = numArray.length - 1; i >= 0; i--) {
    const number = isNil ? 'nil' : numArray[i]
    // offset for this specific number
    const charOffset = (i - (numArray.length - 1)) * letterSpacing
    ctx.drawImage(images.numbers[number], x + charOffset, y)
  }
}

// draw a single pixel with the given color and coordinates (`offset`)
const drawPixel = (ctx, color, offset) => {
  const { r, g, b } = color
  const { x, y } = offset
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, 1, 1);
}

// draw departure info row with the given `data` and `offset`
const drawRow = (ctx, data, offset) => {
  const { routeId, minutesFromNow } = data
  const { x, y } = offset

  // train line circle
  ctx.drawImage(images.trains[routeId], x, y)
  // departure in minutes from now
  drawInteger(ctx, minutesFromNow, { x: x+27, y })
  // "m" to indicate "minutes"
  const mImg = minutesFromNow === 0 ? 'm_nil' : 'm'
  ctx.drawImage(images.letters[mImg], x+40, y+8)
}

// draw the trains on a given row of the departure timeline, if applicable
const drawTimelineRow = (ctx, minute, trains) => {
  const { WHITE, BLUE } = COLORS
  trains.forEach((train, i) => {
    const _isLocal = isLocal(train)
    const color = _isLocal ? BLUE : WHITE
    drawPixel(ctx, color, { 
      x: _isLocal ? 61 : 63,
      y: (MATRIX.HEIGHT - 1) - minute
    })
  })
}

// draw a vertical timeline of trains approaching the station, with a labeled
// timeline and two columns: local on the left in blue, and express on the
// right in white
const drawTimeline = (ctx, departures) => {
  ctx.drawImage(images.rulers.vertical_labeled, 50, 0)

  // create an array of trains `Set`s expected to arrive in a given minute,
  // where the array index is the minute
  const binnedDepartures = Array.from({ length: MATRIX.HEIGHT }, () => new Set())
  departures
  .filter(departure => departure.minutesFromNow < MATRIX.HEIGHT)
  .forEach(departure => {
    binnedDepartures[departure.minutesFromNow].add(departure.routeId)
  })

  binnedDepartures.forEach((trains, minute) => {
    drawTimelineRow(ctx, minute, trains)
  })
}

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
const drawBoard = async ([topRow, bottomRow], departures) => {
  if (!images) {
    images = await getImages()
  }
  const { canvas, ctx } = setUpCanvas()

  // draw foreground departure info
  drawRow(ctx, topRow, { x: 0, y: 1 })
  drawRow(ctx, bottomRow, { x: 0, y: 17 })
  drawTimeline(ctx, departures)
  
  // save image to disk
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(BOARD_IMAGE_FILE, buffer)
}

module.exports = {
  drawBoard
}