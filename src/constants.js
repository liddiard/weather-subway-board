module.exports = {
  MATRIX: {
    WIDTH: 64,
    HEIGHT: 32
  },
  BOARD_IMAGE_FILE: 'board.png',
  // Station to display departures from
  // http://web.mta.info/developers/data/nyct/subway/Stations.csv
  SUBWAY_STATION_ID: 313, // Upper West Side, 72 St & Broadway
  WEATHER_STATION_ID: 'KNYC', // Central Park
  FORECAST_STATION_ID: 'OKX', // New York area
  FORECAST_COORDS: [33, 37], // latitude and longitude, Upper West Side
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
    RED: { r: 255, g: 0, b: 0 }
  },
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
  }
}