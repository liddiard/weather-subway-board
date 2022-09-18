const fs = require('fs')

const { loadImage } = require('canvas')


// in-memory cache of images from disk
const images = {
  loaded: false,
  directions: {},
  font: {},
  rulers: {},
  weather: {}
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
    fs.readdirSync(`graphics/${type}`)
    .map(file => cacheImage(type, file)))

// load a single image into cache
const cacheImage = (type, file) =>
  loadImage(`graphics/${type}/${file}`)
  .then(image => {
    const key = file.replace('.png', '')
    images[type][key] = image
  })

module.exports = {
  initImages,
  images
}