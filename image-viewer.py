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
    # occasionally the image file will fail to display because it's being
    # written by node.js at the same time we are trying to write it here
    # a better approach would probably be using inotify or OS equivalent but
    # the issue happens so rarely that I don't think it's worth doing now
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
