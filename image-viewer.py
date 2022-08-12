import asyncio
import time
from datetime import datetime

import PIL
from PIL import Image
from rgbmatrix import RGBMatrix, RGBMatrixOptions
from pywizlight import wizlight


image_file = "board.png"
bulb_ip = "192.168.0.10" # stove light bulb

# configure matrix
options = RGBMatrixOptions()
options.cols = 64
options.hardware_mapping = 'adafruit-hat'
# fix error "Can't set realtime thread priority=99: Operation not permitted."
# https://github.com/hzeller/rpi-rgb-led-matrix/issues/1170#issuecomment-706715753
options.drop_privileges = False
# options.show_refresh_rate = True
matrix = RGBMatrix(options=options)

# initialize smart bulb
bulb = wizlight(bulb_ip)

# check if smart bulb is on
async def bulb_is_on():
    state = await bulb.updateState()
    return state.get_state()

async def main():
    while True:
        # If smart bulb is off, then don't display anything on the matrix.
        # If you're not me (original code author), you should probably remove
        # this condition because it's specific to my particular smarthome setup
        if not await bulb_is_on():
            matrix.Clear()
            time.sleep(10)
            continue

        canvas = matrix.CreateFrameCanvas()
        try:
            image = Image.open(image_file)
        # Occasionally the image file will fail to display because it's being
        # written by the Node.js process at the same time we are trying to read it
        # here. A better approach would probably be to use `inotify` or OS
        # equivalent to run this code when the file is updated, but the error
        # happens so rarely that I'm not motivated to try another approach now.
        # https://github.com/hzeller/rpi-rgb-led-matrix/issues/1204#issuecomment-733804488
        except PIL.UnidentifiedImageError:
            print(f"[{datetime.now():%Y-%m-%d %H:%M:%S%z}] Failed to open {image_file} - bad file.")
            continue
        image = image.convert('RGB')

        canvas.SetImage(image)
        image.close()
        # change the matrix image without a flash to black in between
        # https://github.com/hzeller/rpi-rgb-led-matrix/blob/master/bindings/python/README.md#performance
        matrix.SwapOnVSync(canvas)

        time.sleep(5)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())