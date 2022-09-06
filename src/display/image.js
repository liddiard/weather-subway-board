const { loadImage } = require('canvas')

// in-memory cache of images from disk
const images = {
  directions: {
    bg: null,
    N: null,
    NE: null,
    E: null,
    SE: null,
    S: null,
    SW: null,
    W: null,
    NW: null,
    'Ø': null
  },
  font: {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    '-': null,
    '%': null,
    '°': null
  },
  rulers: {
    vertical: null
  },
  weather: {
    cloud: null,
    cloud_with_lightning: null,
    cloud_with_lightning_and_rain: null,
    downpour: null,
    fog: null,
    fog_with_sprinkles: null,
    fog_with_heavy_rain: null,
    heavy_rain: null,
    not_available: null,
    sprinkles: null,
    sun: null,
    sun_behind_cloud: null,
    sun_with_cloud: null,
    sun_with_two_clouds: null,
    sun_with_scattered_clouds: null,
  }
}

// fill the entire image cache with files from disk
const initImages = async () => {
  const imagesLoaded = Object.values(images)
  .every(obj =>
    Object.values(obj)
    .every(Boolean))
  
  if (!imagesLoaded) {
    await Promise.all(Object.keys(images).map(cacheImages))
  }
  return images
}

// fill a first-level object of the image cache with key `type` with files
// from disk
const cacheImages = (type) =>
  Promise.all(
    Object.keys(images[type])
    .map(file => cacheImage(type, file)))

// load a single image into cache
const cacheImage = (type, file) =>
  loadImage(`graphics/${type}/${file}.png`)
  .then(image => {
    images[type][file] = image
  })

// const getImages = () => images

module.exports = {
  initImages,
  images
}