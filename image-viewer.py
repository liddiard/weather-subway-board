import asyncio
import time
from datetime import datetime

import PIL
from PIL import Image
from rgbmatrix import RGBMatrix, RGBMatrixOptions
from pywizlight import wizlight, exceptions


image_file = "board.png"
bulb_ip = "192.168.0.10" # stove light bulb

# configure matrix
options = RGBMatrixOptions()
options.cols = 64
# "*-pwm" requires connecting bonnet pins GPIO4 and GPIO18 as described under 
# step 6 of docs:
# https://cdn-learn.adafruit.com/downloads/pdf/adafruit-rgb-matrix-bonnet-for-raspberry-pi.pdf
# and disable Pi's sound as described in:
# https://github.com/hzeller/rpi-rgb-led-matrix#bad-interaction-with-sound
# beneficial because it eliminates matrix flicker
options.hardware_mapping = 'adafruit-hat-pwm'
# fix error "Can't set realtime thread priority=99: Operation not permitted."
# https://github.com/hzeller/rpi-rgb-led-matrix/issues/1170#issuecomment-706715753
options.drop_privileges = False
# show matrix refresh rate in console for debugging
# options.show_refresh_rate = True
matrix = RGBMatrix(options=options)

# initialize smart bulb
bulb = wizlight(bulb_ip)

def log(msg):
    return f"[{datetime.now():%Y-%m-%d %H:%M:%S%z}] {msg}"

# check if smart bulb is on
async def get_bulb_is_on():
    try:
        state = await bulb.updateState()
    except asyncio.TimeoutError as ex:
        print(f"Unable to get bulb status; defaulting to OFF. {ex}")
        return False
    return state.get_state()


async def main():
    while True:
        # If smart bulb is off, then don't display anything on the matrix.
        # If you're not me (original code author), you should probably remove
        # this condition because it's specific to my particular smarthome setup
        bulb_is_on = False
        try:
            bulb_is_on = await get_bulb_is_on()
        except exceptions.WizLightTimeOutError:
            log("Timed out trying to connect to bulb, defaulting to OFF.")
        
        if not bulb_is_on:
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
            log(f"Failed to open {image_file} - bad file.")
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
