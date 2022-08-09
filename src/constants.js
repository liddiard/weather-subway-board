module.exports = {
  MATRIX: {
    WIDTH: 64,
    HEIGHT: 32,
    GPIO_MAPPING: 'adafruit-hat'
  },
  BOARD_IMAGE_FILE: 'board.png',
  // Station to display departures from
  // http://web.mta.info/developers/data/nyct/subway/Stations.csv
  STATION_ID: 313, // Upper West Side, 72 St & Broadway
  DIRECTIONS: {
    NORTH: 'N',
    SOUTH: 'S'
  },
  TRAINS: {
    LOCAL: new Set(['1']),
    EXPRESS: new Set(['2', '3']),
  },
  COLORS: {
    WHITE: { r: 255, g: 255, b: 255 },
    RED: { r: 255, g: 0, b: 0 }
  },
   // seconds to show each set of departures before cycling to the next
  DISPLAY_CYCLE_SEC: 5,
  NUM_TO_DISPLAY: 8 // number of upcoming trains to display in each direction
}