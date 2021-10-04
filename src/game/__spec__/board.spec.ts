import { getBoard } from '../board'
import board from './board.json'

const { line: testFlat, board: testBoard } = board

describe('board', () => {
  describe('#getBoard', () => {
    it('can split a flat line into a board', () => {
      const result = getBoard(testFlat)
      expect(result).toEqual(testBoard)
    })
  })
})
