const suncalc = require('suncalc')

const { drawForecastIcons } = require('./forecastIcons')
const { drawText, drawPixel, getInterpolatedColor, getTextWidth } = require('./utils')
const constants  = require('../constants')


const { COLORS, GRADIENTS, LOCATION_COORDINATES, FORECAST_GRAPH, CHAR_HEIGHT, MATRIX } = constants
const { TOP, BOTTOM, WIDTH } = FORECAST_GRAPH

// gets the color of a pixel at a given time for the forecast graph
const getGraphPointColor = ({ startTime }) => {
  // Periods are 60 minutes long. Add 30 minutes to the start time to get the
  // midpoint of the forecast time, and use that time to derive the dot color.
  const middleTime = new Date(startTime.getTime() + 30*60*1000);
  const { altitude } = suncalc.getPosition(middleTime, ...LOCATION_COORDINATES)
  return getInterpolatedColor(altitude, GRADIENTS.SUN, { min: -0.4, max: 0.4 })
}

// Draw a line of temparatures, tinted yellow/pink for day/night times, as well
// as vertical separators for noon and midnight. On the Y axis, each pixel is a
// degree Celcius. On the X axis, each pixel is 1 hour.
// Return the array of Y axis values for filled pixels.
const drawGraphLines = (ctx, periods) => {
  // get the minimum temperature of the whole displayed forecast period, and
  // align all other points relative to this bottom
  const minTemperature = Math.min(
    ...periods.map(f => f.temperature)
  )
  // Array of illuminated pixel positions on the forecast graph. Array index
  // is the X position, and value in the array is the Y position
  const filledPixels = []
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    const { temperature } = period
    const degreesAboveMin = temperature - minTemperature
    const color = getGraphPointColor(period)
    const yCoord = BOTTOM - degreesAboveMin
    drawDaySeparator(ctx, period, i, yCoord)
    drawPixel(ctx, color, { x: i, y: yCoord })
    filledPixels.push(yCoord)
  }
  return filledPixels
}

// if the given period begins at noon or midnight, draw a vertical line on the
// graph at this position
const drawDaySeparator = (ctx, period, i) => {
  const currentHour = period.startTime.getHours()
  const isNoon = currentHour === 12
  const isMidnight = currentHour === 0
  let color
  if (isNoon) {
    color = COLORS.DARK_ORANGE
  } else if (isMidnight) {
    color = COLORS.DARK_PURPLE
  }
  if (color) {
    const { r, g, b } = color
    const gradient = ctx.createLinearGradient(0, TOP, 0, (BOTTOM - TOP) + 1);
    gradient.addColorStop(0, `rgba(${r},${g},${b}, 0)`);
    gradient.addColorStop(1, `rgba(${r},${g},${b}, 1)`);
    ctx.fillStyle = gradient
    // draw line spanning full height of forecast area
    ctx.fillRect(i, TOP, 1, (BOTTOM - TOP) + 1)
  }
}

// starting at the first (current) forecast hour, determine if the temperature
// line is trending up or down into the future
const getInitialTrendIsIncreasing = (periods) => {
  const initialTemp = periods[0].temperature
  for (const period of periods.slice(1)) {
    // move along the temperature periods until we find a temperature forecast
    // different from the first one
    if (period.temperature === initialTemp) {
      continue
    }
    // once we find one that differs, return if it is higher or lower than the
    // first forecast temp
    return period.temperature > initialTemp
  }
  // in the highly unlikely event that the temperature is the same throughout
  // the entire forecast, default to decreasing (technically it's neither)
  return false
}

// given a flat array of forecast periods, return an array of arrays where the
// periods are split into sub-arrays of monotonic increasing and decreasing
// temperature
// https://en.wikipedia.org/wiki/Monotonic_function
const getMonotonicIntervals = (periods) => {
  const monotonicIntervals = [
    [periods[0]]
  ]

  const initialTrendIsIncreasing = getInitialTrendIsIncreasing(periods);
  let isIncreasing = initialTrendIsIncreasing
  for (const period of periods) {
    // the current interval is the last element in the top-level array
    const currentInterval = monotonicIntervals[monotonicIntervals.length - 1]
    // the last-processed period is the last element in the current interval's
    // sub-array
    const lastPeriod = currentInterval[currentInterval.length - 1]
    period.isIncreasing = isIncreasing
    // If the current period's temperature is trending in the same direction as
    // the previous period's, append it to the current interval. Otherwise,
    // we've switched from monotone increasing to decreasing, or vice versa, so
    // append a new top-level array element with the current period
    if (
      (isIncreasing && period.temperature >= lastPeriod.temperature) ||
      (!isIncreasing && period.temperature <= lastPeriod.temperature)
    ) {
      currentInterval.push(period)
    } else {
      monotonicIntervals.push([period])
      isIncreasing = !isIncreasing
    }
  }

  return monotonicIntervals
}

// Returns the x-coordinate midpoint of a local minimum or maximum in
// temperature. This allows us to draw the temperature label centered above
// the peak or trough. This is necessary, because for example if a day has a
// maximum of 25 that is forecast as the temperature for 3 consecutive periods,
// we want the label to show up centered over the middle of the 3 periods.
const getMidpointOfTemperatureSwing = (interval) => {
  const extreme = interval[interval.length - 1]
  // how many hours the temperature forecast remains "flat" at the given
  // extreme (local minimum or maximum)
  let flatLength = 1
  for (const period of interval.reverse().slice(1)) {
    if (period.temperature !== extreme.temperature) {
      break 
    }
    flatLength++
  }
  const xCoord = extreme.number
  // return the midpoint, biasing towards the left if the length is even
  return xCoord - Math.floor(flatLength / 2)
}

// returns wether or not the given x/y coordinate has an overlap "conflict"
// with a point on the temperature graph, or if it is outside the bottom or
// right bounds of the matrix
const hasConflict = (temperatureGraph, { x, y }) => {
  if (x > MATRIX.WIDTH || y > MATRIX.HEIGHT) {
    return true
  }
  return temperatureGraph[x] === y
}

// Checks if the given `boundingBox`, described by width/height, at a given x/y
// `offset`, is adjacent to the `temperatureGraph` line with the given
// `margin`. "Adjacent" in this case is defined as directly above or below +
// margin, or to the left or right + margin, but NOT diagonally + margin.
const isAbuttingBoundingBox = (temperatureGraph, boundingBox, offset, margin) => {
  // check the pixels below and above the bounding box
  for (let i = offset.x; i < offset.x + boundingBox.width; i++) {
    if (
      hasConflict(temperatureGraph, { x: i, y: offset.y + boundingBox.height }) ||
      hasConflict(temperatureGraph, { x: i, y: offset.y - margin  })
    ) {
      return true
    }
  }
  // check the pixels to the right and left of the bounding box
  for (let i = offset.y; i < offset.y + boundingBox.height; i++) {
    if (
      hasConflict(temperatureGraph, { x: offset.x + boundingBox.width, y: i }) ||
      hasConflict(temperatureGraph, { x: offset.x - margin, y: i })
    ) {
      return true
    }
  }
  return false
}

// given `text` that we want to center at `initialX`, return the position at
// which the cursor should start "typing" from left to right to achieve the
// desired centering
const getLeftCursorPosition = (initialX, text) =>
  Math.max(0, initialX - Math.floor(getTextWidth(text) / 2))

// returns whether or not the given `text` to type at the given
// `cursorPosition` (x coordinate) would be within the right-edge bounds of the
// forecast graph area
const isWithinRightBound = (cursorPosition, text) =>
  cursorPosition + getTextWidth(text) <= WIDTH

// get the vertical position of a temperature label by starting it at the top
// of the graph area, and moving it down one pixel at a time until it abuts the
// temperature graph line
 const getVerticalPosition = (temperatureGraph, x, text) => {
  const boundingBox = {
    width: getTextWidth(text),
    height: CHAR_HEIGHT
  }
  const offset = {
    x,
    y: TOP
  }
  const margin = 1
  while (!isAbuttingBoundingBox(
    temperatureGraph,
    boundingBox,
    { x: offset.x, y: offset.y + 1 },
    margin)
  ) {
    offset.y++
  }
  return offset.y
}

// display local temperature minima and maxima as possible without overlapping
// labels
const drawTemperatureExtremes = (ctx, periods, temperatureGraph) => {
  // array of arrays where each sub-array contains forecast periods that are
  // monotone decreasing or increasing in temperature
  const monotonicIntervals = getMonotonicIntervals(periods)
  let prevCursorPosition = -Infinity
  for (const interval of monotonicIntervals) {
    // the "extremes" (high or low before the temperature starts moving in the
    // opposite direction) are at the end of each interval
    const extreme = interval[interval.length - 1]
    const temperatureString = extreme.temperature.toString()
    // get the x coordinate most centered over the top of the peak/trough
    const x = getMidpointOfTemperatureSwing(interval)
    // given the midpoint above, get where the cursor should start typing from
    // the left to achieve the desired centered text
    const cursorPosition = getLeftCursorPosition(x, temperatureString)
    // skip (don't draw) this label if it's out of bounds to the right of the
    // forecast graph area, or if it's too horizontally close to the previously
    // drawn label
    if (!isWithinRightBound(cursorPosition, temperatureString) ||
        cursorPosition - prevCursorPosition < 1) {
      continue
    }
    prevCursorPosition = drawText(
      ctx,
      temperatureString,
      { 
        x: cursorPosition,
        y: getVerticalPosition(temperatureGraph, cursorPosition, temperatureString)
      },
      extreme.isIncreasing ? COLORS.RED : COLORS.BLUE
    )
  }
}

// draw a line graph with hourly temperature trends, labels of minimum and
// maximum temperatures, and forecast icons
const drawForecast = (ctx, hourlyForecast) => {
  const periods = hourlyForecast
  // remove any past periods (occasionally present in response)
  .filter(p => p.endTime > new Date())
  .slice(0, WIDTH)
  // period `number` is present in response, but re-number it to start from 0
  // index instead of 1, and also in case the filter above chopped off
  // period(s) from the start
  .map((p, i) => ({ ...p, number: i }))

  // draw yellow/pink line graph of temps and vertical graph lines ("ticks")
  const temperatureGraph = drawGraphLines(ctx, periods)
  // label the local minima and maxima of the above graph wih degrees
  drawTemperatureExtremes(ctx, periods, temperatureGraph)
  // add forecast icons along the bottom of the labeled graph
  drawForecastIcons(ctx, periods)
}

module.exports = {
  drawForecast
}