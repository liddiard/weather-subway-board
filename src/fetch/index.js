const departures = require('./departures')
const weather = require('./weather')
const forecast = require('./forecast')

module.exports = {
  ...departures,
  ...weather,
  ...forecast
}