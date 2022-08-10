import time
from datetime import datetime

import PIL
from PIL import Image
from rgbmatrix import RGBMatrix, RGBMatrixOptions


image_file = "board.png"

# configure matrix
options = RGBMatrixOptions()
options.cols = 64
options.hardware_mapping = 'adafruit-hat'
# fix error "Can't set realtime thread priority=99: Operation not permitted."
# https://github.com/hzeller/rpi-rgb-led-matrix/issues/1170#issuecomment-706715753
options.drop_privileges = False
# options.show_refresh_rate = True
matrix = RGBMatrix(options=options)

while True:
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
