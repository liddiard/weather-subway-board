const constants = {
  MATRIX: {
    WIDTH: 64,
    HEIGHT: 32
  },
  BOARD_IMAGE_FILE: 'board.png',
  // Station to display departures from
  // http://web.mta.info/developers/data/nyct/subway/Stations.csv
  // (Complex ID)
  SUBWAY_STATION_ID: 636, // Downtown Brooklyn, Jay St-MetroTech
  // approximate coordinates of the station
  LOCATION_COORDINATES: [40.69, -73.99],
  WEATHER_STATION_ID: 'KNYC', // Central Park
  FORECAST_STATION_ID: 'OKX', // New York area
  VRB: 'VRB', // light and variable winds
  // National Weather Service forecast gridpoints for the station above
  // https://www.weather.gov/documentation/services-web-api#/default/gridpoint
  FORECAST_GRIDPOINT: [34, 34],
  DIRECTIONS: {
    NORTH: 'N',
    SOUTH: 'S'
  },
  // update display at these seconds of every minute
  // expects at least 2 values
  UPDATE_AT_SECS: new Set([0, 30]),
  // how often to update each section of the board
  UPDATE_FREQUENCY_SECS: {
    WEATHER: 5 * 60,
    FORECAST: 15 * 60
  },
  // https://www.color-name.com/
  COLORS: {
    WHITE: { r: 255, g: 255, b: 255 },
    BLACK: { r: 0, g: 0, b: 0 },
    MAGENTA: { r: 255, g: 0, b: 255 },
    PURPLE: { r: 128, g: 0, b: 255 },
    BLUE: { r: 0, g: 0, b: 255 },
    AZURE: { r: 0, g: 128, b: 255 },
    CYAN: { r: 0, g: 255, b: 255 },
    GUPPIE_GREEN: { r: 0, g: 255, b: 128 },
    GREEN: { r: 0, g: 255, b: 0 },
    YELLOW: { r: 255, g: 255, b: 0 },
    ORANGE: { r: 255, g: 128, b: 0 },
    RED: { r: 255, g: 0, b: 0 },
    CONGO_PINK: { r: 255, g: 128, b: 128 },
    DARK_ORANGE: { r: 32, g: 16, b: 0 },
    DARK_PURPLE: { r: 16, g: 0, b: 32 }
  },
  CHAR_HEIGHT: 5,
  // map from digit (character) to its width
  CHAR_WIDTH: {
    0: 3,
    1: 1,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 3,
    7: 3,
    8: 3,
    9: 3,
    '%': 4,
    '-': 2,
    '°': 1
  },
  // space between characters
  LETTER_SPACING: 1,
  // forecast graph size and position
  FORECAST_GRAPH: {
    WIDTH: 56,
    TOP: 6,
    BOTTOM: 25
  },
  WEATHER_DESCRIPTION_TO_IMAGE: {
    'Clear': 'sun',
    'Mostly Clear': 'sun_with_cloud',
    'Partly Cloudy': 'sun_with_two_clouds',
    'Mostly Cloudy': 'sun_behind_cloud',
    'Cloudy': 'overcast',
    'Fog': 'fog',
    'Fog/Mist': 'fog',
    'Haze': 'haze',
    'Light Rain': 'sprinkles',
    'Rain': 'heavy_rain',
    'Heavy Rain': 'downpour',
    'Light Rain and Fog': 'fog_with_sprinkles',
    'Light Rain and Fog/Mist': 'fog_with_sprinkles',
    'Rain and Fog': 'fog_with_heavy_rain',
    'Rain and Fog/Mist': 'fog_with_heavy_rain',
    'Heavy Rain and Fog': 'fog_with_downpour',
    'Heavy Rain and Fog/Mist': 'fog_with_downpour',
    'Light Snow': 'flurries',
    'Light Snow and Fog': 'fog_with_flurries',
    'Light Snow and Fog/Mist': 'fog_with_flurries',
    'Snow and Fog': 'fog_with_heavy_snow',
    'Snow and Fog/Mist': 'fog_with_heavy_snow',
    'Heavy Snow and Fog': 'fog_with_blizzard',
    'Heavy Snow and Fog/Mist': 'fog_with_blizzard',
    'Light Freezing Rain and Fog/Mist': 'fog_with_mixed',
    'Freezing Rain and Fog/Mist': 'fog_with_mixed',
    'Clear and Windy': 'wind'
  },
  // how "warm" to make the display colors when the sun is down, from 0 (not at
  // all) to 1 (white text appears fully orange)
  NIGHT_SHIFT_INTENSITY: 0.67
}

const {
  MAGENTA,
  PURPLE,
  BLUE,
  AZURE,
  CYAN,
  GUPPIE_GREEN,
  GREEN,
  YELLOW,
  ORANGE,
  RED,
  CONGO_PINK
} = constants.COLORS

constants.GRADIENTS = {
  TEMPERATURE: [
    MAGENTA,
    PURPLE,
    BLUE,
    AZURE,
    CYAN,
    GUPPIE_GREEN,
    GREEN,
    YELLOW,
    ORANGE,
    RED,
    CONGO_PINK
  ],
  HUMIDITY: [RED, YELLOW, GREEN, CYAN, BLUE],
  WIND: [GREEN, YELLOW, RED],
  SUN: [MAGENTA, YELLOW],
}

constants.TRAINS = [
  {
    color: YELLOW,
    xCoord: 58,
    lines: new Set(['N', 'R', 'W'])
  },
  {
    color: ORANGE,
    xCoord: 60,
    lines: new Set(['F'])
  },
  {
    color: BLUE,
    xCoord: 62,
    lines: new Set(['A', 'C'])
  }
]

module.exports = constants