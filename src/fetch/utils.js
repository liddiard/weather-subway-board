// cache the return value of the passed function for `timeout` seconds
// if the cache-wrapped function is called repeatedly within timeout window
// return the cached value, otherwise call actual function
const cache = (fn, timeout) => {
  let cache = null
  let lastCalled = null

  return async (...args) => {
      const now = Date.now()
      // There is some inexactitude in seconds since last call due to the
      // implementation of the main loop. By rounding to the next largest
      // integer for seconds elapsed, we err on the side of calling `fn`
      // rather than returning the cached value.
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
        console.warn(`[${new Date()}] Function call failed, returning cached value.`, ex)
      }
      return cache
  }
}

module.exports = {
  cache
}