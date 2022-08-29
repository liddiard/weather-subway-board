const constants = {
  MATRIX: {
    WIDTH: 64,
    HEIGHT: 32
  },
  BOARD_IMAGE_FILE: 'board.png',
  // Station to display departures from
  // http://web.mta.info/developers/data/nyct/subway/Stations.csv
  SUBWAY_STATION_ID: 313, // Upper West Side, 72 St & Broadway
  // approximate coordinates of the station
  LOCATION_COORDINATES: [40.77, -73.98],
  WEATHER_STATION_ID: 'KNYC', // Central Park
  FORECAST_STATION_ID: 'OKX', // New York area
  VRB: 'VRB', // light and variable winds
  // National Weather Service forecast gridpoints for the station above
  // https://www.weather.gov/documentation/services-web-api#/default/gridpoint
  FORECAST_GRIDPOINT: [33, 37],
  TRAINS: {
    LOCAL: new Set(['1']),
    EXPRESS: new Set(['2', '3', '5']),
  },
  DIRECTIONS: {
    NORTH: 'N',
    SOUTH: 'S'
  },
  // how often to update the data on the display
  DISPLAY_UPDATE_SEC: 30,
  COLORS: {
    WHITE: { r: 255, g: 255, b: 255 },
    BLACK: { r: 0, g: 0, b: 0 },
    RED: { r: 255, g: 0, b: 0 },
    GREEN: { r: 0, g: 255, b: 0 },
    BLUE: { r: 0, g: 0, b: 255 },
    CYAN: { r: 0, g: 255, b: 255 },
    MAGENTA: { r: 255, g: 0, b: 255 },
    YELLOW: { r: 255, g: 255, b: 0 },
    ORANGE: { r: 255, g: 128, b: 0 },
    DARK_YELLOW: { r: 32, g: 32, b: 0 }
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
    WIDTH: 58,
    TOP: 7,
    BOTTOM: 25
  },
  WEATHER_DESCRIPTION_TO_IMAGE: {
    'Clear': 'sun',
    'Mostly Clear': 'sun_with_scattered_clouds',
    'Partly Cloudy': 'sun_with_two_clouds',
    'Mostly Cloudy': 'sun_behind_cloud',
    'Cloudy': 'cloud',
    'Fog/Mist': 'fog',
    'Light Rain': 'rain',
    'Light Rain and Fog/Mist': 'fog_with_rain',
    'Heavy Rain and Fog': 'fog_with_heavy_rain'
  }
}

const { MAGENTA, BLUE, CYAN, GREEN, YELLOW, RED } = constants.COLORS
constants.GRADIENTS = {
  TEMPERATURE: [MAGENTA, BLUE, CYAN, GREEN, YELLOW, RED],
  HUMIDITY: [RED, YELLOW, GREEN, CYAN, BLUE],
  WIND: [GREEN, YELLOW, RED],
  SUN: [MAGENTA, YELLOW],
}

module.exports = constants