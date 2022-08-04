// draw an integer (`number`), right-aligned, with the given offset
// given the dimension constraints of the matrix, integers with a maximum of
// two digits are recommended though larger numbers will work; they'll just
// overlap with other elements on the screen
const drawInteger = (ctx, number, offset) => {
  // width of the character itself + spacing between characters
  const letterSpacing = 12
  const { x, y } = offset
  const numArray = number.toString().split('')
  const isNil = number === 0
  // iterate backwards through the array of single digits, starting with the
  // least significant digit on the right and work toward the left
  for (let i = numArray.length - 1; i >= 0; i--) {
    const number = isNil ? 'nil' : numArray[i]
    // offset for this specific number
    const charOffset = (i - (numArray.length - 1)) * letterSpacing
    ctx.drawImage(imageCache.numbers[number], x + charOffset, y)
  }
}

module.exports = {
  drawInteger
}