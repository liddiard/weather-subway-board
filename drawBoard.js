const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

// in-memory cache of images on disk
const imageCache = {
  populated: false,
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
    m: null
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
  // iterate backwards through the array of single digits, starting with the
  // least significant digit on the right and work toward the left
  for (let i = numArray.length - 1; i >= 0; i--) {
    // offset for this specific number
    const number = numArray[i]
    const charOffset = (i - (numArray.length - 1)) * letterSpacing
    ctx.drawImage(imageCache.numbers[number], x + charOffset, y)
  }
}

// draw departure info row with the given `data` and `offset`
const drawRow = (ctx, data, offset) => {
  const { train, direction, minutesFromNow } = data
  const { x, y } = offset

  // train line circle
  ctx.drawImage(imageCache.trains[train], x, y)
  // up or down arrow
  ctx.drawImage(imageCache.directions[direction], x+16, y)
  // departure in minutes from now
  drawInteger(ctx, minutesFromNow, { x: x+43, y })
  // "m" to indicate "minutes"
  ctx.drawImage(imageCache.letters.m, x+56, y+8)
}

// set create `canvas` and `ctx` objects, draw background
const setUpCanvas = () => {
  const canvas = createCanvas(64, 32) // LED board dimensions
  const ctx = canvas.getContext('2d')

  // black background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  return { canvas, ctx }
}

// input: array of two Row objects:
// {
//   train: '1' | '2' | '3',
//   direction: 'N' | 'S',
//   minutesFromNow: Number
// }
const drawBoard = async ([topRow, bottomRow]) => {
  if (!imageCache.populated) {
    await populateImageCache()
  }
  const { canvas, ctx } = setUpCanvas()

  // draw foreground departure info
  drawRow(ctx, topRow, { x: 0, y: 0 })
  drawRow(ctx, bottomRow, { x: 0, y: 18 })
  
  // save image on disk
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('board.png', buffer)
}

drawBoard([
  {
    train: '1',
    direction: 'N',
    minutesFromNow: 12
  },
  {
    train: '2',
    direction: 'S',
    minutesFromNow: 6
  }
])

module.exports = drawBoard