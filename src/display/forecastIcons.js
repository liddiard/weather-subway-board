const { images } = require('./image')
const { getTimeSpecificWeatherIcon } = require('./utils')


// given an array of period descriptions and a map from description regexes to
// values/scores, return the average score described by `descriptions` during
// the period
const getAverageWeather = (descriptions, descriptionToValueMap) => {
  const maximumValue = Math.max(...Object.values(descriptionToValueMap))
  const score = descriptions.reduce((acc, desc) => {
    for (const [regex, value] of Object.entries(descriptionToValueMap)) {
      if (new RegExp(regex).test(desc)) {
        return acc + value
      }
    }
    return acc
  }, 0)
  return score / (descriptions.length * maximumValue)
}

// given an array of forecast descriptions, return the average cloud cover
// mentioned by them on a scale from 0 (clear the whole time) to 4 (overcast
// the whole time)
const getAverageCloudCover = (descriptions) => {
  const descToScore = {
    'Mostly Sunny': 1,
    'Mostly Clear': 1,
    'Partly Sunny': 2,
    'Partly Clear': 2,
    'Partly Cloudy': 2,
    'Mostly Cloudy': 3,
    '^Cloudy$': 4,
    'Overcast': 4
  }
  return getAverageWeather(descriptions, descToScore)
}

// get the average rain mentioned in forecast descriptions from 0 (no rain) to
// 3 (heavy rain)
const getAverageRain = (descriptions) => {
  const descToScore = {
    'Light Rain': 1,
    'Showers': 1,
    'Drizzle': 1,
    '^Rain$': 2,
    'Rain Likely': 2,
    'Periods Of Rain': 2,
    'Heavy Rain': 3
  }
  return getAverageWeather(descriptions, descToScore)
}

// get the average snow mentioned in forecast descriptions from 0 (no snow) to
// 3 (heavy snow)
const getAverageSnow = (descriptions) => {
  const descToScore = {
    'Light Snow': 1,
    'Snow Showers': 1,
    '^Snow$': 2,
    'Heavy Snow': 3
  }
  return getAverageWeather(descriptions, descToScore)
}

// given an array of forecast weather periods, summarize all periods based on
// salient factors like cloud cover, precipitation, and thunderstorm activity
// that we'd want to include in a forecast icon
const summarizeWeatherPeriods = (periods) => {
  const descriptions = periods.map(p => p.shortForecast)
  return {
    startTime: periods[0].startTime,
    endTime: periods[periods.length - 1].endTime,
    // indicates if some part of the sky is visible during ANY period
    clear: descriptions.some(d =>
      /Clear|Sunny|Partly Sunny|Partly Clear|Partly Cloudy|Mostly Cloudy/.test(d)),
    // average percent cloud cover during the periods, from 0 to 1
    clouds: getAverageCloudCover(descriptions),
    // whether or not haze is possible during ANY period
    haze: descriptions.some(d =>
      d.includes('Haze')),
    // whether or not fog is possible during ANY period
    fog: descriptions.some(d =>
      d.includes('Fog')),
    // average rain during the periods, from 0 to 1
    rain: getAverageRain(descriptions),
    // whether thunderstorms are possible during ANY period
    thunderstorms: descriptions.some(d =>
      d.includes('Thunderstorms')),
    // average snow during the periods, from 0 to 1
    snow: getAverageSnow(descriptions),
    // whether mixed precipitation is possible during ANY period
    mixed: descriptions.some(d => 
      d.includes('Rain And Snow')),
    // whether hail is possible during ANY period
    hail: descriptions.some(d =>
      d.includes('Hail')),
  }
}

// return the cloud icon matching a given cloud cover "score" from 0 to 1
// (float), or returns `null` if cloud cover is sufficiently low
const getCloudIcon = (cloudCover) => {
  if (cloudCover < 0.2) {
    return null
  }
  if (cloudCover < 0.4) {
    return 'cloud'
  }
  if (cloudCover < 0.6) {
    return 'two_clouds'
  }
  if (cloudCover < 0.8) {
    return 'broken_clouds'
  }
  return 'overcast'
}

// return the rain icon matching a given rain "score" from 0 to 1
const getRainIcon = (rainAmount) => {
  if (rainAmount === 0) {
    return null
  }
  if (rainAmount <= 1/3) {
    return 'sprinkles'
  }
  if (rainAmount <= 2/3) {
    return 'heavy_rain'
  }
  return 'downpour'
}

// return the snow icon matching a given snow "score" from 0 to 1
const getSnowIcon = (snowAmount) => {
  if (snowAmount === 0) {
    return null
  }
  if (snowAmount <= 1/3) {
    return 'flurries'
  }
  if (snowAmount <= 2/3) {
    return 'heavy_snow'
  }
  return 'blizzard'
}

// given a forecast weather summary and an x/y offset, draw a composite weather
// icon
const drawWeatherIcon = (ctx, summary, offset) => {
  const {
    startTime,
    endTime,
    clear,
    clouds,
    haze,
    fog,
    rain,
    thunderstorms,
    snow,
    mixed,
    hail
  } = summary
  const { x, y } = offset
  const { weather } = images

  // Logic can be framed as follows. Code is written so that we never actually
  // have to overwrite a previously drawn icon, but it can be helpful to think
  // this way:
  // 1. celestial body (base)
  // 2. cloud (replace sun if overcast)
  // 3. haze (replace all previous)
  // 4. fog (replace all previous)
  // 5. lightning (replace sun, all cloud)
  // 6. rain & snow (replace sun, cloud if overcast)
  // 7. hail

  const cloudIcon = getCloudIcon(clouds)
  const rainIcon = getRainIcon(rain)
  const snowIcon = getSnowIcon(snow)
  const showCelestialBody =
    clear &&
    !thunderstorms &&
    !fog &&
    !haze &&
    !rainIcon &&
    !snowIcon &&
    !mixed &&
    cloudIcon !== 'overcast'

  if (showCelestialBody) {
    // "average" (midpoint) datetime between start and end of summary
    const midpointTime = new Date((startTime.getTime() + endTime.getTime()) / 2)
    // show the moon if the midpoint is at night
    const filename = getTimeSpecificWeatherIcon('sun', midpointTime)
    ctx.drawImage(weather[filename], x, y)
  }
  if (cloudIcon && !fog && !rain && !snow && !thunderstorms && !mixed) {
    ctx.drawImage(weather[cloudIcon], x, y)
  }
  if (haze) {
    ctx.drawImage(weather.haze, x, y)
  }
  if (fog) {
    ctx.drawImage(weather.fog, x, y)
  }
  if (thunderstorms) {
    ctx.drawImage(weather.lightning, x, y)
  }
  if (rainIcon && !snow && !mixed) {
    ctx.drawImage(weather[rainIcon], x, y)
  }
  if (snowIcon && !rain && !mixed) {
    ctx.drawImage(weather[snowIcon], x, y)
  }
  if (mixed || (rain && snow)) {
    ctx.drawImage(weather.mixed, x, y)
  }
  if (hail) {
    ctx.drawImage(weather.hail, x, y)
  }
}

// draw forecast icons along the bottom of the forecast graph
const drawForecastIcons = (ctx, periods) => {
  const numToAggregate = 6
  const top = 27
  for (let i = 0; i < periods.length; i += numToAggregate) {
    const summary = summarizeWeatherPeriods(periods.slice(i, i + numToAggregate))
    drawWeatherIcon(ctx, summary, { x: i, y: top })
  }
}

module.exports = {
  drawForecastIcons
}