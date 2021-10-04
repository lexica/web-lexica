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

describe('dictionary', () => {
  describe('#getWordsOnBoard: removes all impossible words and leaves only possible words given board', () => {
    describe('with single letter board squares', () => {
      test('1x1 board', () => {
        const board = getBoard(['a'])
        const dictionary = ['a', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa', 'b']
        const minWordLength = 1
        const results = getWordsOnBoard(board, dictionary, minWordLength)

        expect(results).toEqual(['a'])
      })
      test('2x2 board', () => {
        const board = getBoard(['a', 'b', 'c', 'd'])
        const dictionary = ['ab', 'aa', 'dab', 'cab', 'bad', 'fad', 'rad', 'a']
        const minWordLength = 2

        const expected = ['ab', 'dab', 'cab', 'bad']

        const results = getWordsOnBoard(board, dictionary, minWordLength)

        expect(results).toEqual(expect.arrayContaining(expected))
        expect(results.length).toEqual(expected.length)
      })

      test('3x3 board', () => {
        const board = getBoard(['a', 'b', 'c',
                                'd', 'e', 'f',
                                'g', 'h', 'i'])
        const dictionary = ['cab', 'dab', 'head', 'ade', 'bed', 'ce', 'bd']
        const minWordLength = 3

        const expected = ['dab', 'head', 'ade', 'bed']

        const results = getWordsOnBoard(board, dictionary, minWordLength)

        expect(results).toEqual(expect.arrayContaining(expected))
        expect(expected).toEqual(expect.arrayContaining(results))
        expect(results.length).toEqual(expected.length)
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

        expect(results).toEqual(expect.arrayContaining(expected))
        expect(expected).toEqual(expect.arrayContaining(results))
        expect(results.length).toEqual(expected.length)
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

        expect(results).toEqual(expect.arrayContaining(expected))
        expect(expected).toEqual(expect.arrayContaining(results))
        expect(results.length).toEqual(expected.length)
      })
    })
  })
})
