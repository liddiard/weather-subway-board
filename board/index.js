const fs = require('fs')
const { promisify } = require('util')
const { exec } = require("child_process")

const { createCanvas, loadImage } = require('canvas')

const constants = require('./constants')
const bothDirections = require('./bothDirections')
const downtownVerticalTimeline = require('./downtownVerticalTimeline')


const run = promisify(exec)
const { MATRIX, BOARD_IMAGE_FILE, DISPLAY_TYPE } = constants

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
//   direction: 'N' | 'S',
//   minutesFromNow: Number
// }
const drawBoard = async (displayType, [topRow, bottomRow]) => {
  const { BOTH_DIRECTIONS, DOWNTOWN_VERTICAL_TIMELINE } = DISPLAY_TYPE
  const { canvas, ctx } = setUpCanvas()

  if (!imageCache.populated) {
    await populateImageCache()
  }

  switch (displayType) {
    case BOTH_DIRECTIONS:
      // draw foreground departure info
      bothDirections.drawRow(ctx, topRow, { x: 0, y: 0 })
      bothDirections.drawRow(ctx, bottomRow, { x: 0, y: 18 })
      break;
    case DOWNTOWN_VERTICAL_TIMELINE:
       // TODO: gave up on the approach of supporting multiple display types
       // in one codebase because it seemed to be getting to messy
       // switching to multiple branches where each branch has one display type
      downtownVerticalTimeline(ctx, )
  }
  
  // save image on disk
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(BOARD_IMAGE_FILE, buffer)
}

// drawBoard([
//   {
//     routeId: '1',
//     direction: 'N',
//     minutesFromNow: 12
//   },
//   {
//     routeId: '2',
//     direction: 'S',
//     minutesFromNow: 6
//   }
// ])

// draws and displays a board on the LED matrix from provided 2-item
// departures list
const displayBoard = async (displayType, departures) => {
  const { WIDTH, GPIO_MAPPING } = MATRIX
  await drawBoard(displayType, departures)
  await run('ls')
  // await run(`./led-image-viewer --led-cols=${WIDTH} --led-gpio-mapping=${GPIO_MAPPING} ${BOARD_IMAGE_FILE}`)
}

module.exports = {
  displayBoard
}