const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

const imageCache = {
  populated: false,
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
    m: null
  }
}

const populateImageCache = async () => {
  await Promise.all(Object.keys(imageCache).map(cacheImages))
  imageCache.populated = true
}

const cacheImages = (type) =>
  Promise.all(
    Object.keys(imageCache[type])
    .map(file => cacheImage(type, file)))
  
const cacheImage = (type, file) =>
  loadImage(`graphics/${type}/${file}.png`)
  .then(image => {
    imageCache[type][file] = image
  })

// // Write "Awesome!"
// ctx.font = '30px Impact'
// ctx.rotate(0.1)
// ctx.fillText('Awesome!', 50, 100)

// // Draw line under text
// var text = ctx.measureText('Awesome!')
// ctx.strokeStyle = 'rgba(0,0,0,0.5)'
// ctx.beginPath()
// ctx.lineTo(50, 102)
// ctx.lineTo(50 + text.width, 102)
// ctx.stroke()

// // Draw cat with lime helmet
// loadImage('graphics/subway_lines/1.png').then((image) => {
//   ctx.drawImage(image, 50, 0, 70, 70)
//   const buffer = canvas.toBuffer('image/png')
//   fs.writeFileSync('./image.png', buffer)
//   console.log('<img src="' + canvas.toDataURL() + '" />')
// })

const drawInteger = (ctx, number, offset) => {
  const letterSpacing = 12
  const { x, y } = offset
  const numArray = number.toString().split('')
  for (let i = numArray.length - 1; i >= 0; i--) {
    // offset for this specific number
    const number = numArray[i]
    const charOffset = (i - (numArray.length - 1)) * letterSpacing
    ctx.drawImage(imageCache.numbers[number], x + charOffset, y)
  }
}

const drawRow = (ctx, data, offset) => {
  const { train, direction, minutesFromNow } = data
  const { x, y } = offset

  ctx.drawImage(imageCache.trains[train], x, y)
  ctx.drawImage(imageCache.directions[direction], x+16, y)
  drawInteger(ctx, minutesFromNow, { x: x+43, y })
  // ctx.drawImage(imageCache.numbers[minutesFromNow], x+40, y)
  ctx.drawImage(imageCache.letters.m, x+56, y+8)
}

// input: array of two Row objects:
// {
//   train: '1' | '2' | '3',
//   direction: 'N' | 'S',
//   minutesFromNow: Number
// }
const drawBoard = async ([topRow, bottomRow]) => {
  if (!imageCache.populated) {
    await populateImageCache()
  }
  // canvas setup
  const canvas = createCanvas(64, 32) // LED board dimensions
  const ctx = canvas.getContext('2d')
  // black background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRow(ctx, topRow, { x: 0, y: 0 })
  drawRow(ctx, bottomRow, { x: 0, y: 18 })
  
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('./board.png', buffer)
}

drawBoard([
  {
    train: '1',
    direction: 'N',
    minutesFromNow: 33
  },
  {
    train: '2',
    direction: 'S',
    minutesFromNow: 58
  }
])