import pathlib
import os
import asyncio
import time
from datetime import datetime

import PIL
from PIL import Image
from rgbmatrix import RGBMatrix, RGBMatrixOptions
from kasa import Device, exceptions
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


image_file = "board.png"
switch_ip = "192.168.0.143" # "Sink" TP-Link Kasa smart switch
switch_poll_interval = 5 # seconds between smart switch checks

image_path = pathlib.Path(__file__).parent.resolve() / "src" / "display" / image_file
image_dir = image_path.parent

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


class BoardImageChangeHandler(FileSystemEventHandler):
    def __init__(self, loop, image_changed):
        self.loop = loop
        self.image_changed = image_changed

    def on_any_event(self, event):
        if event.is_directory:
            return
        # Only react to events that mean the file may have new contents. This
        # ignores watchdog's open events (and any close events that didn't write).
        if event.event_type not in ("created", "modified", "moved", "closed"):
            return

        paths = [event.src_path]
        dest_path = getattr(event, "dest_path", None)
        if dest_path:
            paths.append(dest_path)

        if any(os.path.basename(path) == image_file for path in paths):
            # This runs in the watchdog observer thread, so hand the signal
            # back to the asyncio event loop safely.
            self.loop.call_soon_threadsafe(self.image_changed.set)


def display_image():
    # Occasionally the image file will fail to display because it's being
    # written by the Node.js process at the same time we are trying to read it
    # here. Retry briefly to let the write finish.
    # https://github.com/hzeller/rpi-rgb-led-matrix/issues/1204#issuecomment-733804488
    for attempt in range(5):
        try:
            with Image.open(image_path) as source:
                image = source.convert('RGB')
            canvas.SetImage(image)
            image.close()
            # change the matrix image without a flash to black in between
            # https://github.com/hzeller/rpi-rgb-led-matrix/blob/master/bindings/python/README.md#performance
            matrix.SwapOnVSync(canvas)
            return True
        except (PIL.UnidentifiedImageError, OSError) as ex:
            if attempt == 4:
                log(f"Failed to open {image_file} - bad file. {ex}")
                return False
            time.sleep(0.1)
    return False


# poll the smart switch so the display turns off when the switch is off
async def poll_switch(switch, switch_state, image_changed):
    while True:
        was_on = switch_state["is_on"]
        try:
            switch_state["is_on"] = await get_switch_is_on(switch)
        except (
            OSError,
            asyncio.TimeoutError,
            exceptions.KasaException,
        ) as ex:
            log(f"Timed out connecting to switch, remaining in current state. {ex}")

        # Clear the matrix when switching off, or redraw the latest board image
        # when switching back on.
        if switch_state["is_on"] != was_on:
            image_changed.set()

        await asyncio.sleep(switch_poll_interval)


# draw the board image whenever it changes on disk
async def display_images(switch_state, image_changed):
    while True:
        await image_changed.wait()
        image_changed.clear()

        # If smart switch is off, then don't display anything on the matrix.
        # If you're not me (original code author), you should probably remove
        # this condition because it's specific to my particular smarthome setup
        if switch_state["is_on"]:
            display_image()
        else:
            matrix.Clear()


async def main():
    # Connect to the smart switch
    switch = await Device.connect(host=switch_ip)

    loop = asyncio.get_running_loop()
    image_changed = asyncio.Event()

    # Watch the directory instead of the file itself so that replacing the file
    # (instead of writing it in place) still gets picked up.
    observer = Observer()
    observer.schedule(
        BoardImageChangeHandler(loop, image_changed),
        str(image_dir),
        recursive=False,
    )
    observer.start()
    log(f"Watching {image_path} for changes…")

    switch_state = {"is_on": False}

    print("Starting image viewer main loop…")
    try:
        # Draw the current image (or clear the display) at startup. The switch
        # poller will trigger another redraw if the switch is already on.
        image_changed.set()
        await asyncio.gather(
            poll_switch(switch, switch_state, image_changed),
            display_images(switch_state, image_changed),
        )
    finally:
        observer.stop()
        observer.join()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
