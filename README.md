# NYC subway train departures board

![LED matrix board mounted on a freezer door, displaying upcoming times to arrival in seconds](https://i.imgur.com/wxVTYVq.jpg)

## Materials used

- [Raspberry Pi Zero W](https://www.raspberrypi.com/products/raspberry-pi-zero-w/)
- [64x32 LED matrix, 5mm pitch](https://smile.amazon.com/gp/product/B07SDMWX9R/) – could likely get cheaper from Aliexpress, but longer shipping time
- [Adafruit RGB Matrix Bonnet](https://www.adafruit.com/product/3211)
- [Power supply, 5V 8A](https://smile.amazon.com/dp/B078RZBL8X/)
- [Mounting tape (optional)](https://smile.amazon.com/gp/product/B00347A8GC/) – attach Pi to matrix
- [Cable concealer (optional)](https://smile.amazon.com/gp/product/B07D8WVJWF/) – for power supply

## Installation

Tested running:

- macOS on Apple Silicon
- Raspberry Pi Zero W on ARMv6

1. `npm install`
2. (Linux only) `./scripts/build_rpi-rgb-led-matrix.sh`

## Running

### Generate board image

1. Create an account at https://api.mta.info/#/signup
2. Get an API key from https://api.mta.info/#/AccessKey (link only goes to the right place if logged in)

```shell
API_KEY=<Your API key> npm start
```
### Display board on LED matrix (Linux only)

```shell
npm run display
```

### Web-based board viewer (for development)

```shell
python3 -m http.server
```

View the board at http://localhost:8000/viewer.html

## Project structure

[`index.js`](index.js): Main entry point for Node.js app that calls MTA API for train departures and generates a board image using the JavaScript `canvas` API. It runs in a loop, cycling through upcoming departures in large text, and it requests updated departure information at the end of each cycle.

### [`src/`](src/)

- [departures.js](src/departures.js): Fetches upcoming departure information from the MTA API and transforms the reponse
- [board.js](src/board.js): Canvas board drawing utilities
- [image.js](src/image.js): Utilities for caching the smaller "sprite" images that are combined to form the overall board image
- [constants.js](src/constants.js): Constants. `STATION_ID` is the subway station from which the departures are shown.

`board.png`: Not version-controlled, image of the board to display. Generated by Node.js app described above. View it with the web viewer or on an LED matrix, as also detailed above under [Running](#Running).

[`image-viewer.py`](image-viewer.py): Script that recurringly reads the board image file from disk and displays it on the LED matrix using the [Python bindings](https://github.com/hzeller/rpi-rgb-led-matrix/tree/master/bindings/python) of [rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix). Used Python rather than the faster C++ library because it was more developer friendly (to me) and because the display refresh rate doesn't need to be particularly performant since it's static.

[`graphics/`](graphics/): Sprite images used on the board, positioned and composited by the Node.js app

[`scripts/`](scripts/) One-time bash scripts used for dependency installation. `install_canvas_dependencies.sh` is run before `npm install` to install the required `canvas` dependencies. `npm install` will fail without doing this first. `build_rpi-rgb-led-matrix.sh` builds the binaries for `rpi-rgb-led-matrix` which displays the board image file on the LED matrix.

