const constants = require('../constants')
const { images } = require('./image')
const { drawPixel } = require('./utils')


const { MATRIX, TRAINS, COLORS } = constants

const isLocal = (routeId) =>
  TRAINS.LOCAL.has(routeId)

// draw the trains on a given row of the departure timeline, if applicable
const drawTrainRow = (ctx, minute, trains) => {
  const { WHITE, RED } = COLORS
  trains.forEach((train, i) => {
    const _isLocal = isLocal(train)
    const color = _isLocal ? RED : WHITE
    drawPixel(ctx, color, { 
      x: _isLocal ? 60 : 62,
      y: (MATRIX.HEIGHT - 1) - minute
    })
  })
}

// draw a vertical timeline of trains approaching the station, with a labeled
// timeline and two columns: local on the left in blue, and express on the
// right in white
const drawTrains = (ctx, departures) => {
  ctx.drawImage(images.rulers.vertical, 59, 0)

  // create an array of trains `Set`s expected to arrive in a given minute,
  // where the array index is the minute
  const binnedDepartures = Array.from({ length: MATRIX.HEIGHT }, () => new Set())
  departures
  .filter(departure => departure.minutesFromNow < MATRIX.HEIGHT)
  .forEach(departure => {
    binnedDepartures[departure.minutesFromNow].add(departure.routeId)
  })

  binnedDepartures.forEach((trains, minute) => {
    drawTrainRow(ctx, minute, trains)
  })
}

module.exports = {
  drawTrains
}