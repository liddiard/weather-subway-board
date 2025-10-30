import pathlib
import os
import asyncio
import time
from datetime import datetime

import PIL
from PIL import Image
from rgbmatrix import RGBMatrix, RGBMatrixOptions
from kasa import Device


image_file = "board.png"
switch_ip = "192.168.0.143" # "Sink" TP-Link Kasa smart switch

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
# cap the refresh rate to mitigate flicker
options.limit_refresh_rate_hz = 120
# show matrix refresh rate in console for debugging
# options.show_refresh_rate = True
matrix = RGBMatrix(options=options)
canvas = matrix.CreateFrameCanvas()


def log(msg):
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S%z}] {msg}")

# check if smart switch is on
async def get_switch_is_on(switch):
    await switch.update()
    return switch.is_on


async def main():
    # Connect to the smart switch
    switch = await Device.connect(host=switch_ip)

    # If smart switch is off, then don't display anything on the matrix.
    # If you're not me (original code author), you should probably remove
    # this condition because it's specific to my particular smarthome setup
    switch_is_on = False

    print("Starting image viewer main loop…")
    while True:
        try:
            switch_is_on = await get_switch_is_on(switch)
        except (
            OSError,
            asyncio.TimeoutError,
        ) as ex:
            log(f"Timed out connecting to switch, remaining in current state. {ex}")

        if not switch_is_on:
            matrix.Clear()
            time.sleep(5)
            continue

        file_path = os.path.join(
            # current directory
            pathlib.Path(__file__).parent.resolve(),
            # path to board file
            "src", "display", image_file
        )
        try:
            image = Image.open(file_path)
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
