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

const drawWeatherIcon = (ctx, summary, top) => {
  const {
    clear,
    clouds,
    fog,
    rain,
    thunderstorms,
    snow,
    hail
  } = summary
  const celestialBody = clear && !fog && clouds < 0.8 && !thunderstorms
  // const cloud = 
  
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
    drawWeatherIcon(ctx, summary, top)
  }
}

module.exports = {
  drawForecastIcons
}