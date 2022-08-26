const { createCanvas } = require('canvas')
const interpolate = require('color-interpolate')

const constants = require('../constants')
const { images } = require('./image')


const { CHAR_WIDTH, LETTER_SPACING } = constants

// draw an integer (`number`), right-aligned, with the given offset
// given the dimension constraints of the matrix, integers with a maximum of
// two digits are recommended though larger numbers will work; they'll just
// overlap with other elements on the screen
const drawText = (ctx, text, offset, color) => {
  const { x, y } = offset
  const charArray = text.split('')
  let cursorPosition = 0
  // iterate backwards through the array of single digits, starting with the
  // least significant digit on the right and work toward the left
  for (const char of charArray) {
    let image = images.font[char]
    if (!image) {
      throw Error(`Unsupported character '${char}' in string "${text}"`)
    }
    if (color) {
      image = tintImage(image, color)
    }
    ctx.drawImage(image, x + cursorPosition, y)
    cursorPosition += (CHAR_WIDTH[char] + LETTER_SPACING)
  }
  return offset.x + (cursorPosition - LETTER_SPACING)
}

const getTextWidth = (text) => {
  const charsWidth = text
  .split('')
  .reduce((acc, char) => acc + CHAR_WIDTH[char], 0)
  return charsWidth + (LETTER_SPACING * (text.length - 1))
}

// draw a single pixel with the given color and coordinates (`offset`)
const drawPixel = (ctx, color, offset) => {
  const { r, g, b } = color
  const { x, y } = offset
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(x, y, 1, 1)
}

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

module.exports = {
  drawText,
  tintImage,
  drawPixel,
  getInterpolatedColor,
  getTextWidth
}