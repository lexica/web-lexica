/* eslint-disable no-mixed-operators */

const R = require('ramda')

// source: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
const xmur3 = seed => {
  for(var i = 0, h = 1779033703 ^ seed.length; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
  } return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
  }
}
// source: https://github.com/cprosche/mulberry32
const mulberry32 = a => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

class ExtensibleFunction extends Function {
  constructor() {
    super('...args', 'return this.__self__.__call__(...args)')
    const self = this.bind(this)
    this.__self__ = self
    return self
  }
}

class CallCountWrapper extends ExtensibleFunction {
  constructor(f) {
    super()
    this.callCount = 0
    this.__f__ = f
    return this.__self__
  }

  static create(f) {
    return new CallCountWrapper(f)
  }

  __call__(...args) {
    this.callCount += 1
    return this.__f__(...args)
  }
}

const getRandomNumberGenerator = (seed) => {
  const seeder = xmur3(seed)

  const generator = mulberry32(seeder())
  R.times(generator, 42)


  const withCallCount = CallCountWrapper.create(generator)
  return withCallCount
}

const randomInt = (options) => {
  const defaults = { min: 0, max: Number.MAX_SAFE_INTEGER, generator: Math.random, wholeNumber: false }
  const { min, max, generator, wholeNumber } = { ...defaults, ...options }
  const result = (generator() * (max - min)) + min
  return wholeNumber ? Math.floor(result) : result
}

module.exports = {
  getRandomNumberGenerator,
  randomInt
}
