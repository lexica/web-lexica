import { __test } from '../url'

const {
  basePathRegex,
  stripBasepathFromPath
} = __test

describe('url', () => {
  describe('base-path regex', () => {
    it('strips leading "web-lexica"', () => {
      const testString = 'web-lexica/basepath'
      const expected = '/basepath'
      expect(testString.replace(basePathRegex, '')).toBe(expected)
    })
    it('strips leading "/web-lexica', () => {
      const testString = '/web-lexica/basepath'
      const expected = '/basepath'
      expect(testString.replace(basePathRegex, '')).toBe(expected)
    })
    it('leaves "/basepath" as "/basepath"', () => {
      const expected = '/basepath'
      expect(expected.replace(basePathRegex, '')).toBe(expected)
    })
    it('leaves "basepath" as "basepath"', () => {
      const expected = 'basepath'
      expect(expected.replace(basePathRegex, '')).toBe(expected)
    })
  })
  describe('stripBasepathFromPath', () => {
    it('turns "/web-lexica/basepath/" into "basepath"', () => {
      const test = '/web-lexica/basepath/'
      const expected = 'basepath'
      expect(stripBasepathFromPath(test)).toBe(expected)
    })
    it('turns "/basepath/" into "basepath"', () => {
      const test = '/basepath/'
      const expected = 'basepath'
      expect(stripBasepathFromPath(test)).toBe(expected)
    })
    it('turns "/path/segments/" into "path/segments"', () => {
      const test = '/path/segments/'
      const expected = 'path/segments'
      expect(stripBasepathFromPath(test)).toBe(expected)
    })
    it('does not turn invalid "//path/segments//" into valid "path/segments"', () => {
      const test = '//path/segments//'
      const expected = 'path/segments'
      expect(stripBasepathFromPath(test)).not.toBe(expected)
    })
  })
})