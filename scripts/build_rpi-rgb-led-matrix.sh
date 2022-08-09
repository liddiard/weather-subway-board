#!/bin/bash

# https://howchoo.com/pi/raspberry-pi-led-matrix-panel#install-the-rpi-rgb-led-matrix-library
sudo apt-get update  && sudo apt-get install -y git python3-dev python3-pillow
cd ../rpi-rgb-led-matrix
make build-python PYTHON=$(which python3)
sudo make install-python PYTHON=$(which python3)
