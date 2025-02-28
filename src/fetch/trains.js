const { createClient } = require('mta-realtime-subway-departures')

const client = createClient()

// convert times from seconds-based Unix timestamps to JS Date objects
const convertResponseDates = (departures) =>
  departures.map(d => ({
    ...d,
    time: new Date(d.time * 1000)
  }))

// API occasionally returns departures that happened a minute or two ago;
// filter them out
const removePastDates = (departures) =>
  departures.filter(d =>
    d.time > new Date()
  )

// sorted by departure time, closest to station first
const sortResponseList = (departures) =>
  departures.sort((a, b) => a.time - b.time)

// add a `minutesFromNow` entry to each departure object
const addRelativeTimes = (departures) =>
  departures.map(d => ({
    ...d,
    minutesFromNow: Math.floor((d.time - new Date()) / 1000 / 60)
  }))

const getTrains = async (stationId, direction) => {
  const response = await client.departures(stationId)
  const departures = response.lines[0].departures[direction]
  return [
    convertResponseDates,
    removePastDates,
    sortResponseList,
    addRelativeTimes
  ]
    .reduce((acc, cur) =>
      cur(acc), departures)
}

module.exports = {
  getTrains
}