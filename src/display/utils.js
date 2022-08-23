const { loadImage } = require('canvas')

const constants = require('../constants')


const { CHAR_WIDTH } = constants

// in-memory cache of images from disk
const imageCache = {
  directions: {
    N: null,
    NE: null,
    E: null,
    SE: null,
    S: null,
    SW: null,
    W: null,
    NW: null
  },
  font: {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    percent: null
  },
  rulers: {
    vertical: null,
    vertical_labeled: null
  },
  weather: {}
}

// fill the entire image cache with files from disk
const getImages = async () => {
  const imagesLoaded = Object.values(imageCache)
  .every(obj =>
    Object.values(obj)
    .every(Boolean))
  
  if (!imagesLoaded) {
    await Promise.all(Object.keys(imageCache).map(cacheImages))
  }
  return imageCache
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
  // spacing between characters
  const letterSpacing = 2
  const { x, y } = offset
  const numArray = number.toString().split('')
  const isNil = number === 0
  let cursorPosition = 0
  // iterate backwards through the array of single digits, starting with the
  // least significant digit on the right and work toward the left
  for (const number of numArray.reverse()) {
    const sprite = isNil ? 'nil' : number
    // move the cursor to the left ("backwards") for the width of this digit
    cursorPosition -= (CHAR_WIDTH[number] + letterSpacing)
    ctx.drawImage(imageCache.font[sprite], x + cursorPosition, y)
  }
}

module.exports = {
  getImages,
  drawInteger
}