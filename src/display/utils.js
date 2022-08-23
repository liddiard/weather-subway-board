const { loadImage, createCanvas } = require('canvas')

const constants = require('../constants')


const { CHAR_WIDTH, CHAR_HEIGHT } = constants

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
    NW: null,
    'Ø': null
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
    '-': null,
    '%': null
  },
  rulers: {
    vertical: null
  },
  weather: {
    cloud: null,
    cloud_with_lightning: null,
    cloud_with_lightning_and_rain: null,
    downpour: null,
    fog: null,
    fog_with_rain: null,
    heavy_rain: null,
    not_available: null,
    rain: null,
    sun: null,
    sun_behind_cloud: null,
    sun_with_cloud: null,
    sun_with_scattered_cloud: null,
  }
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

// adapted from https://stackoverflow.com/a/4231508
const tintImage = (image, color) => {
  const { r, g, b } = color

  // create offscreen buffer
  const buffer = createCanvas(image.width, image.height)
  const bx = buffer.getContext('2d')

  // fill offscreen buffer with tint color
  bx.fillStyle = `rgb(${r},${g},${b})`
  bx.fillRect(0, 0, buffer.width, buffer.height)

  // destination-atop creates an image with alpha channel identical to provided
  // foreground `image` with the color of the background
  bx.globalCompositeOperation = 'destination-atop'
  bx.drawImage(image, 0, 0)

  return buffer
}

// draw an integer (`number`), right-aligned, with the given offset
// given the dimension constraints of the matrix, integers with a maximum of
// two digits are recommended though larger numbers will work; they'll just
// overlap with other elements on the screen
const drawText = (ctx, text, offset, color) => {
  // spacing between characters
  const letterSpacing = 1
  const { x, y } = offset
  const charArray = text.split('')
  let cursorPosition = 0
  // iterate backwards through the array of single digits, starting with the
  // least significant digit on the right and work toward the left
  for (const char of charArray) {
    let image = imageCache.font[char]
    if (!image) {
      throw Error(`Unsupported character '${char}' in string "${text}"`)
    }
    if (color) {
      image = tintImage(image, color)
    }
    ctx.drawImage(image, x + cursorPosition, y)
    cursorPosition += (CHAR_WIDTH[char] + letterSpacing)
  }
  return offset.x + (cursorPosition - letterSpacing)
}

// draw a single pixel with the given color and coordinates (`offset`)
const drawPixel = (ctx, color, offset) => {
  const { r, g, b } = color
  const { x, y } = offset
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(x, y, 1, 1)
}

module.exports = {
  getImages,
  drawText,
  tintImage,
  drawPixel
}