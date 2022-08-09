const { loadImage } = require('canvas')


// in-memory cache of images from disk
const imageCache = {
  trains: {
    1: null,
    2: null,
    3: null,
  },
  directions: {
    N: null,
    S: null
  },
  numbers: {
    nil: null,
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null
  },
  letters: {
    m: null,
    m_nil: null
  },
  rulers: {
    vertical: null,
    vertical_labeled: null
  }
}

// fill the entire image cache with files from disk
const getImages = async () => {
  await Promise.all(Object.keys(imageCache).map(cacheImages))
  return imageCache
}

// fill a first-level object of the image cache with key `type` with files
// from disk
const cacheImages = (type) =>
  Promise.all(
    Object.keys(imageCache[type])
    .map(file => cacheImage(type, file)))

// load a single image into cache
const cacheImage = (type, file) =>
  loadImage(`graphics/${type}/${file}.png`)
  .then(image => {
    imageCache[type][file] = image
  })

module.exports = {
  getImages
}