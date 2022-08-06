const fs = require('fs')
const { promisify } = require('util')
const { exec } = require("child_process")

const { createCanvas, loadImage } = require('canvas')

const constants = require('./constants')


const run = promisify(exec)
const { MATRIX, BOARD_IMAGE_FILE, TRAINS, COLORS } = constants

// in-memory cache of images from disk
const imageCache = {
  populated: false, // meta attribute indicating if cache has images
  trains: {
    1: null,
    2: null,
    3: null,
  },
  directions: {
    N: null,
    S: null
  },
  numbers: {
    nil: null,
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null
  },
  letters: {
    m: null,
    m_nil: null
  },
  rulers: {
    vertical: null
  }
}

// fill the entire image cache with files from disk
const populateImageCache = async () => {
  await Promise.all(Object.keys(imageCache).map(cacheImages))
  imageCache.populated = true
}

// fill a first-level object of the image cache with key `type` with files
// from disk
const cacheImages = (type) =>
  Promise.all(
    Object.keys(imageCache[type])
    .map(file => cacheImage(type, file)))

// load a single image into cache
const cacheImage = (type, file) =>
  loadImage(`graphics/${type}/${file}.png`)
  .then(image => {
    imageCache[type][file] = image
  })

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
    ctx.drawImage(imageCache.numbers[number], x + charOffset, y)
  }
}

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
  ctx.drawImage(imageCache.trains[routeId], x, y)
  // departure in minutes from now
  drawInteger(ctx, minutesFromNow, { x: x+29, y })
  // "m" to indicate "minutes"
  const mImg = minutesFromNow === 0 ? 'm_nil' : 'm'
  ctx.drawImage(imageCache.letters[mImg], x+42, y+8)
}

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

const isLocal = (routeId) =>
  TRAINS.LOCAL.has(routeId)

const drawTimeline = (ctx, departures) => {
  ctx.drawImage(imageCache.rulers.vertical, 55, 0)

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
// input: array of two Row objects:
// {
//   routeId: '1' | '2' | '3',
//   minutesFromNow: Number
// }
const drawBoard = async ([topRow, bottomRow], departures) => {
  if (!imageCache.populated) {
    await populateImageCache()
  }
  const { canvas, ctx } = setUpCanvas()

  // draw foreground departure info
  drawRow(ctx, topRow, { x: 0, y: 0 })
  drawRow(ctx, bottomRow, { x: 0, y: 18 })
  drawTimeline(ctx, departures)
  
  // save image to disk
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(BOARD_IMAGE_FILE, buffer)
}

// drawBoard([
//   {
//     routeId: '1',
//     minutesFromNow: 12
//   },
//   {
//     routeId: '2',
//     minutesFromNow: 6
//   }
// ])

// draws and displays a board on the LED matrix with a 2-item array
// `currentDepartures` shown in large green numbers, and `allDepartures` shown
// as dots on a timeline
const displayBoard = async (currentDepartures, allDepartures) => {
  const { WIDTH, GPIO_MAPPING } = MATRIX
  await drawBoard(currentDepartures, allDepartures)
  // await run('ls')
  await run(`./led-image-viewer --led-cols=${WIDTH} --led-gpio-mapping=${GPIO_MAPPING} ${BOARD_IMAGE_FILE}`)
}

module.exports = {
  displayBoard
}