const fs = require('fs')
const path = require('path')

const { loadImage } = require('canvas')

// directory containing all images
const baseDir = path.resolve(__dirname, '..', '..', 'graphics')

// in-memory cache of images from disk
const images = {
  loaded: false,
  directions: {},
  font: {},
  rulers: {},
  weather: {},
  inop: {}
}

// fill the entire image cache with files from disk
const initImages = async () => {
  const { loaded, ...directories } = images
  if (!loaded) {
    await Promise.all(Object.keys(directories).map(cacheImages))
  }
  images.loaded = true
  return images
}

// fill a first-level object of the image cache with key `type` with files
// from disk
const cacheImages = (type) =>
  Promise.all(
    fs.readdirSync(path.resolve(baseDir, type))
    // filter out hidden files like macOS's auto-generated ".DS_Store"
    .filter(file => !file.startsWith('.'))
    .map(file => cacheImage(type, file)))

// load a single image into cache
const cacheImage = (type, file) =>
  loadImage(path.resolve(baseDir, type, file))
  .then(image => {
    const key = file.replace('.png', '')
    images[type][key] = image
  })

module.exports = {
  initImages,
  images
}