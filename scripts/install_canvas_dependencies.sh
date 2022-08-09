#!/bin/bash

# canvas requires some dependencies before `npm install`ing
# https://github.com/Automattic/node-canvas#compiling

echo "Installing canvas (npm package) dependencies..."

if [ "$(uname)" == "Darwin" ]; then
    # install on macOS (Apple Silicon)
    arch -arm64 brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
else
    echo "Unsupported operating system: $(uname)"
    exit 1
