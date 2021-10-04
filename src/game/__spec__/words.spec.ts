import {
  splitWordIntoLetters
} from '../words'
import letters from './letters.json'

describe('words', () => {
  describe('#splitWordIntoLetters', () => {
    it('can split a string into its letters', () => {
      const result = splitWordIntoLetters(letters.join(''), letters)
      expect(result).toEqual(letters)
    })
  })
})
