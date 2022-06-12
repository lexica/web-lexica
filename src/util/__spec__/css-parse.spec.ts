import { cssExp, __test } from '../css-parse'

const {
  makeExpression,
  evaluateStatement,
} = __test

enum Names {
  vh = 'viewport-height-cheat',
  vw = 'viewport-width-cheat',
  rem = 'rem-cheat'
}

const sizes = {
  [Names.rem]: 7,
  [Names.vh]: 5,
  [Names.vw]: 3
}

describe('cssExp', () => {
  document.body.innerHTML = `
    <div id="viewport-height-cheat" style="height: 5px;"></div>
    <div id="viewport-width-cheat" style="height: 3px;"></div>
    <div id="rem-cheat" style="height: 7px;"></div>
  `

  describe('evaluateStatement', () => {
    it('can handle single value statements', () => {
      const result = evaluateStatement('1vh')

      expect(result).toEqual(sizes[Names.vh])
    })
    it('can handle floating point numbers', () => {
      const result = evaluateStatement('1.5vh + 1rem')

      expect(result).toEqual(sizes[Names.rem]+ (1.5*sizes[Names.vh]))
    })
    it('can handle a mathematical expression', () => {
      const result = evaluateStatement('1vh + 1vw')

      expect(result).toEqual(sizes[Names.vh] + sizes[Names.vw])
    })
    it('can handle sub-function calls', () => {
      const result = evaluateStatement('max(1rem, min(2vw, 4vh))')
      expect(result).toBe(sizes[Names.rem])
    })
    it("can handle expressions that don't have spaces", () => {
      const result = evaluateStatement('1px+1px')
      expect(result).toBe(2)
    })
    it('can handle unitless numbers', () => {
      const result = evaluateStatement('4 + 4px')

      expect(result).toBe(8)
    })
  })

  it('can handle complex calls', () => {
    const result = cssExp`clamp(0.5rem, min(2vh, 2.75vw), 1rem)`

    expect(result).toBe(sizes[Names.rem])
  })

  describe('makeExpression', () => {
    it('returns the correct expression with interpolation', () => {
      const result = makeExpression`${1}px + ${2}px`

      expect(result).toEqual('1px + 2px')
    })
  })


  it('can handle interpolation correctly', () => {
    const result = cssExp`${`1vh`} + ${2}vw`

    expect(result).toBe(sizes[Names.vh] + (2*sizes[Names.vw]))
  })
})
