const suncalc = require('suncalc')

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

const drawGraphLines = (ctx, periods) => {
  const minTemperature = Math.min(
    ...periods.map(f => f.temperature)
  )
  const filledPixels = []
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    const { temperature } = period
    const degreesAboveMin = temperature - minTemperature
    const color = getGraphPointColor(period)
    const yCoord = BOTTOM - degreesAboveMin
    drawDaySeparator(ctx, period, i)
    drawPixel(ctx, color, { x: i, y: yCoord })
    filledPixels.push(yCoord)
  }
  return filledPixels
}

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
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(i, TOP, 1, (BOTTOM - TOP) + 2)
  }
}

const getInitialTrendIsIncreasing = (periods) => {
  const initialTemp = periods[0].temperature
  for (const period of periods.slice(1)) {
    if (period.temperature === initialTemp) {
      continue
    }
    return period.temperature > initialTemp
  }
  return false
}

const getMonotonicIntervals = (periods) => {
  const monotonicIntervals = [
    [periods[0]]
  ]

  const initialTrendIsIncreasing = getInitialTrendIsIncreasing(periods);
  let isIncreasing = initialTrendIsIncreasing
  for (const period of periods) {
    const currentMonotonic = monotonicIntervals[monotonicIntervals.length - 1]
    const lastPeriod = currentMonotonic[currentMonotonic.length - 1]
    period.isIncreasing = isIncreasing
    if (
      (isIncreasing && period.temperature >= lastPeriod.temperature) ||
      (!isIncreasing && period.temperature <= lastPeriod.temperature)
    ) {
      currentMonotonic.push(period)
    } else {
      monotonicIntervals.push([period])
      isIncreasing = !isIncreasing
    }
  }

  return monotonicIntervals
}

const getMidpointOfTemperatureSwing = (interval) => {
  const extreme = interval[interval.length - 1]
  let flatLength = 1
  for (const period of interval.reverse().slice(1)) {
    if (period.temperature !== extreme.temperature) {
      break 
    }
    flatLength++
  }
  const xCoord = extreme.number - 1
  return xCoord - Math.floor(flatLength / 2)
}

const hasConflict = (temperatureGraph, { x, y }) => {
  if (x > MATRIX.WIDTH || y > MATRIX.HEIGHT) {
    return true
  }
  return temperatureGraph[x] === y
}

// causes segfaults and unpredictable behaviour on raspberry pi
const isAbuttingBoundingBox = (temperatureGraph, boundingBox, offset, margin) => {
  for (let i = offset.x; i < offset.x + boundingBox.width; i++) {
    if (
      hasConflict(temperatureGraph, { x: i, y: offset.y + boundingBox.height }) ||
      hasConflict(temperatureGraph, { x: i, y: offset.y - margin  })
    ) {
      return true
    }
  }
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

const getLeftCursorPosition = (initialX, text) =>
  Math.max(0, initialX - Math.floor(getTextWidth(text) / 2))

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
  while (!isAbuttingBoundingBox(temperatureGraph, boundingBox, { x: offset.x, y: offset.y + 1 }, margin)) {
    offset.y++
  }
  return offset.y
}

const isWithinRightBound = (cursorPosition, text) =>
  cursorPosition + getTextWidth(text) <= WIDTH


const drawTemperatureChanges = (ctx, periods, temperatureGraph) => {
  const monotonicIntervals = getMonotonicIntervals(periods)
  let prevCursorPosition = -Infinity
  for (const interval of monotonicIntervals) {
    const extreme = interval[interval.length - 1]
    const temperatureString = extreme.temperature.toString()
    const x = getMidpointOfTemperatureSwing(interval)
    const cursorPosition = getLeftCursorPosition(x, temperatureString)
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

const getAverageCloudCover = (descriptions) => {
  const descToScore = {
    'Mostly Sunny': 1,
    'Mostly Clear': 1,
    'Partly Sunny': 2,
    'Partly Clear': 2,
    'Mostly Cloudy': 3,
    'Overcast': 4
  }
  const cloudScore = descriptions.reduce((acc, cur) => 
    acc += descToScore[cur] || 0, 0)
  return cloudScore / (descriptions.length * descToScore.Overcast)
}

const getMaximumRain = (descriptions) => {
  const descToScore = {
    'Light Rain': 1,
    'Showers': 2,
    '^Rain$': 2,
    'Heavy Rain': 3
  }
  return descriptions.reduce((acc, cur) => {
    for (const [regex, value] of Object.entries(descToScore)) {
      if (new RegExp(regex).test(cur) && value > acc) {
        return value
      }
    }
    return acc
  }, 0)
}

const summarizeWeatherPeriods = (periods) => {
  const descriptions = periods.map(p => p.shortForecast)
  return {
    startTime: periods[0].startTime,
    endTime: periods[periods.length - 1].endTime,
    // indicates if some part of the sky is visible during ANY period
    clear: descriptions.some(d =>
      /Clear|Sunny|Mostly Cloudy/.test(d)),
    // average percent cloud cover during the periods, from 0 to 1
    clouds: getAverageCloudCover(descriptions),
    // whether or not fog is present during ANY period
    fog: descriptions.some(d =>
      d.includes('Fog')),
    // most intense rain during the periods, scale from 1 to 3
    rain: getMaximumRain(descriptions),
    // whether thunderstorms are possible during ANY period
    thunderstorms: descriptions.some(d =>
      d.includes('Thunderstorms')),
    // TODO: not implemented
    snow: null,
    // whether hail is possible during ANY period
    hail: descriptions.some(d =>
      d.includes('Hail')),
  }
}

const drawWeatherImage = (ctx, summary, top) => {
  const {
    clear,
    clouds,
    fog,
    rain,
    thunderstorms,
    snow,
    hail
  } = summary
  const drawSun = clear && !fog && clouds < 0.8 && !thunderstorms
  // const drawCloud = 
  
  // sun (base)
  // cloud (replace sun if overcast)
  // fog (replace all below)
  // rain & snow (replace cloud if overcast)
  // lightning (replace sun, all cloud)
  // hail
}

const drawForecastIcons = (ctx, periods) => {
  const numToAggregate = 6
  const top = 26
  for (let i = 0; i < periods.length - numToAggregate; i += numToAggregate) {
    const summary = summarizeWeatherPeriods(periods.slice(i, i + numToAggregate))
    drawWeatherImage(ctx, summary, top)
  }
}

const drawForecast = (ctx, daily, hourly) => {
  const periods = hourly
  // remove any past periods (occasionally present in response)
  .filter(p => p.endTime > new Date())
  .slice(0, WIDTH)

  const temperatureGraph = drawGraphLines(ctx, periods)
  drawTemperatureChanges(ctx, periods, temperatureGraph)
  drawForecastIcons(ctx, periods)
}

module.exports = {
  drawForecast
}