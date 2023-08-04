const { createCanvas } = require('canvas')
const interpolate = require('color-interpolate')
const suncalc = require('suncalc')

const constants = require('../constants')
const { images } = require('./image')


const { CHAR_WIDTH, LETTER_SPACING, LOCATION_COORDINATES } = constants

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

// given a value, a linear gradient array of color "stops", and a min/max
// bounds, return an intermediary color if the value is within `bounds`,
// otherwise return the first/last color of the gradient as appropriate
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

// color (tint) the whole passed `image` with the provided RGB `color`
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

// returns if the passed `date` is while the sun is up or not
const isDaytime = (date) => {
  const { altitude } = suncalc.getPosition(date, ...LOCATION_COORDINATES)
  return altitude > 0
}

// return sun or moon weather icons depending on if the passed datetime is
// while the sun is above the horizon
const getTimeSpecificWeatherIcon = (filename = '', date = new Date()) => 
  isDaytime(date) ? filename : filename.replace('sun', 'moon')

// draw an "INOP" message over a section of the board that failed to fetch
const handleInop = (ctx, segment, reason, { x, y }) => {
  console.error(`Error fetching ${segment}:`, reason)
  ctx.drawImage(images.inop[segment], x, y)
}

module.exports = {
  drawText,
  tintImage,
  drawPixel,
  getInterpolatedColor,
  getTextWidth,
  isDaytime,
  getTimeSpecificWeatherIcon,
  handleInop
}