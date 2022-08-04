const { drawInteger } = require('./utils')

// draw departure info row with the given `data` and `offset`
const drawRow = (ctx, data, offset) => {
  const { routeId, direction, minutesFromNow } = data
  const { x, y } = offset

  // train line circle
  ctx.drawImage(imageCache.trains[routeId], x, y)
  // up or down arrow
  ctx.drawImage(imageCache.directions[direction], x+16, y)
  // departure in minutes from now
  drawInteger(ctx, minutesFromNow, { x: x+43, y })
  // "m" to indicate "minutes"
  const mImg = minutesFromNow === 0 ? 'm_nil' : 'm'
  ctx.drawImage(imageCache.letters[mImg], x+56, y+8)
}

module.exports = {
  drawRow
}