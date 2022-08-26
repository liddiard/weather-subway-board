const suncalc = require('suncalc')

const { images } = require('./image')
const { drawText, drawPixel, getInterpolatedColor, getTextWidth } = require('./utils')
const constants  = require('../constants')


const { COLORS, GRADIENTS, LOCATION_COORDINATES, FORECAST_GRAPH, CHAR_HEIGHT } = constants
const { TOP, BOTTOM, WIDTH } = FORECAST_GRAPH
const { DARK_GRAY, BLACK } = COLORS

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
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    const { temperature } = period
    const degreesAboveMin = temperature - minTemperature
    const color = getGraphPointColor(period)
    drawDaySeparator(ctx, period, i)
    drawPixel(ctx, color, { x: i, y: BOTTOM - degreesAboveMin })
  }
}

const drawDaySeparator = (ctx, period, i) => {
  const isMidnight = period.startTime.getHours() === 0
  if (!isMidnight) {
    return
  }
  const { r, g, b } = COLORS.DARK_GRAY
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(i, TOP, 1, (BOTTOM - TOP) + 2)
}

// const getTemperatureExtremes = (periods) => {
//   const temps = periods.map(p => p.temperature)
//   const hi = Math.max(...temps)
//   const lo = Math.min(...temps)
//   return {
//     hi: periods.find(p => p.temperature === hi),
//     lo: periods.find(p => p.temperature === lo),
//   }
// }

// const drawTemperatureExtremes = (ctx, dailyForecast, hourlyForecast) => {
//   let days = [
//     [hourlyForecast[0]]
//   ];
//   for (const period of hourlyForecast.slice(1)) {
//     if (period.startTime.getDate() === days[days.length - 1][0].startTime.getDate()) {
//       days[days.length - 1].push(period)
//     } else {
//       days.push([period])
//     }
//   }
//   const temperatureExtremes = days.map(getTemperatureExtremes)
//   console.log(temperatureExtremes)
// }

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

const colorsEqual = (a, b) =>
  a.r === b.r && a.g === b.g && a.b === b.b

const hasConflict = (ctx, { x, y }) => {
  if (x < 0 || y < 0) {
    return false
  }
  const { data: [r, g, b] } = ctx.getImageData(x, y, 1, 1)
  const color = { r, g, b }
  return !colorsEqual(color, DARK_GRAY) && !colorsEqual(color, BLACK)
}

const isAbuttingBoundingBox = (ctx, boundingBox, offset, margin) => {
  for (let i = offset.x; i < offset.x + boundingBox.width; i++) {
    if (hasConflict(ctx, { x: i, y: offset.y + boundingBox.height + margin })) {
      return true
    }
    if (hasConflict(ctx, { x: i, y: offset.y - margin  })) {
      return true
    }
  }
  for (let i = offset.y; i < offset.y + boundingBox.height; i++) {
    if (hasConflict(ctx, { x: offset.x + boundingBox.width + margin, y: i })) {
      return true
    }
    if (hasConflict(ctx, { x: offset.x - margin, y: i })) {
      return true
    }
  }
  return false
}

const getLeftCursorPosition = (initialX, text) =>
  Math.max(0, initialX - Math.floor(getTextWidth(text) / 2))

const getVerticalPosition = (ctx, x, text) => {
  const boundingBox = {
    width: getTextWidth(text),
    height: CHAR_HEIGHT
  }
  const offset = {
    x,
    y: TOP
  }
  const margin = 1
  while (!isAbuttingBoundingBox(ctx, boundingBox, offset, margin)) {
    offset.y--
  }
  return offset.y
}

const isWithinRightBound = (cursorPosition, text) =>
  cursorPosition + getTextWidth(text) <= WIDTH


const drawTemperatureChanges = (ctx, periods) => {
  const monotonicIntervals = getMonotonicIntervals(periods)
  for (const interval of monotonicIntervals) {
    const extreme = interval[interval.length - 1]
    const temperatureString = extreme.temperature.toString()
    const x = getMidpointOfTemperatureSwing(interval)
    const leftCursorPosition = getLeftCursorPosition(x, temperatureString)
    if (!isWithinRightBound(leftCursorPosition, temperatureString)) {
      continue
    }
    drawText(
      ctx,
      temperatureString,
      { 
        x: leftCursorPosition,
        y: getVerticalPosition(ctx, leftCursorPosition, temperatureString)
      },
      extreme.isIncreasing ? COLORS.RED : COLORS.BLUE
    )
  }
}

const drawForecast = (ctx, daily, hourly) => {
  drawGraphLines(ctx, hourly.slice(0, WIDTH))
  drawTemperatureChanges(ctx, hourly.slice(0, WIDTH))
}

module.exports = {
  drawForecast
}