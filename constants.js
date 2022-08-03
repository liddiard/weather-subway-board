module.exports = {
  MATRIX: {
    WIDTH: 64,
    HEIGHT: 32,
    GPIO_MAPPING: 'adafruit-hat'
  },
  BOARD_IMAGE_FILE: 'board.png',
  STATION_ID: 313, // Upper West Side, 72 St & Broadway
  DIRECTIONS: {
    NORTH: 'N',
    SOUTH: 'S'
  },
   // seconds to show each set of departures before cycling to the next
  DISPLAY_CYCLE_SEC: 5,
  NUM_TO_DISPLAY: 4 // number of upcoming trains to display in each direction
}