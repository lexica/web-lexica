import { AsymmetricMatcher } from 'expect/build/asymmetricMatchers'
import { equals } from 'expect/build/jasmineUtils'
import { getBoard } from '../board'
import { __test } from '../dictionary'

import { board as realBoard } from './board.json'
import {
  full,
} from './dictionary.json'

const {
  getWordsOnBoard
} = __test

class ArrayWithItems extends AsymmetricMatcher<unknown[]> {
  constructor(sample: unknown[], inverse = false) {
    super(sample);
    this.inverse = inverse;
  }

  asymmetricMatch(other: unknown[]) {
    if (!Array.isArray(this.sample)) {
      throw new Error(
        `You must provide an array to ${this.toString()}, not '` +
          typeof this.sample +
          "'."
      );
    }

    if(!Array.isArray(other)) return this.inverse ? true : false

    const sampleHasAllOther = this.sample.every(item => other.some(another => (void 0, equals)(item, another)))
    const otherHasAllSample = other.every(item => this.sample.some(another => (void 0, equals)(item, another)))
    const lengthsEqual =  other.length === this.sample.length;
    const result = lengthsEqual && sampleHasAllOther && otherHasAllSample
    return this.inverse ? !result : result;
  }

  toString() {
    return `Array${this.inverse ? 'Not' : ''}Containing`;
  }

  getExpectedType() {
    return 'array';
  }

  toAsymmetricMatcher() {

  }
}

const arrayWithItems = (sample: unknown[]) => new ArrayWithItems(sample)
const arrayWithoutItems = (sample: unknown[]) => new ArrayWithItems(sample, true);

(expect as any).arrayWithItems = arrayWithItems;
(expect.not as any).arrayWithItems = arrayWithoutItems

describe('dictionary', () => {
  describe('#getWordsOnBoard: removes all impossible words and leaves only possible words given board', () => {
    describe('with single letter board squares', () => {
      test('1x1 board', () => {
        const board = getBoard(['a'])
        const dictionary = ['a', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa', 'b']
        const minWordLength = 1
        const result = getWordsOnBoard(board, dictionary, minWordLength)

        expect(result).toEqual(['a'])
      })
      test('2x2 board', () => {
        const board = getBoard(['a', 'b', 'c', 'd'])
        const dictionary = ['ab', 'aa', 'dab', 'cab', 'bad', 'fad', 'rad', 'a']
        const minWordLength = 2

        const expected = ['ab', 'dab', 'cab', 'bad']

        const result = getWordsOnBoard(board, dictionary, minWordLength)

        expect(result).toEqual(expect.arrayContaining(expected))
        expect(result.length).toEqual(expected.length)
      })

      test('3x3 board', () => {
        const board = getBoard(['a', 'b', 'c',
                                'd', 'e', 'f',
                                'g', 'h', 'i'])
        const dictionary = ['cab', 'dab', 'head', 'ade', 'bed', 'ce', 'bd']
        const minWordLength = 3

        const expected = ['dab', 'head', 'ade', 'bed']

        const result = getWordsOnBoard(board, dictionary, minWordLength)

        expect(result).toEqual((expect as any).arrayWithItems(expected))
        // expect(expected).toEqual(expect.arrayContaining(result))
        // expect(result.length).toEqual(expected.length)
      })
      test('4x4 board', () => {
        const board = realBoard
        const dictionary = full
        const minWordLength = 6

        const expected = [
          'deafer',
          'defeat',
          'despite',
          'feeder',
          'freesia',
          'spender',
          'tapered',
          'afreet',
          'lisped',
          'neaped',
          'pilsner',
          'reaped',
          'respite',
          'septate',
          'aplite',
          'lisper',
          'repeat',
          'septet',
          'sender'
        ]

        const results = getWordsOnBoard(board, dictionary, minWordLength)

        expect(results).toEqual((expect as any).arrayWithItems(expected))
      })
    })
    describe('with multi-letter squares', () => {
      test('2x2', () => {
        const board = getBoard([
          'squ', 'ire',
          'aqu', 'are'
        ])
        const dictionary = ['squire', 'aquire', 'are', 'square', 'aqua', 'ares']
        const minWordLength = 3

        const expected = ['squire', 'aquire', 'are', 'square']

        const results = getWordsOnBoard(board, dictionary, minWordLength)

        expect(results).toEqual((expect as any).arrayWithItems(expected))
      })
    })
  })
})
