const cache = (fn, timeout) => {
  let cache = null
  let lastCalled = null

  return async (...args) => {
      const now = Date.now()
      const secsElapsed = Math.ceil((now - lastCalled) / 1000)

      if (lastCalled && 
          cache !== null &&
          secsElapsed < timeout) {
          return cache // Return cached value if within the timeout
      }

      try {
        cache = await fn(...args)
        lastCalled = now
      } catch (ex) {
        console.warn('Function call failed with error:', ex)
        console.warn('Returning cached value:', cache)
      }
      return cache
  }
}

module.exports = {
  cache
}