import { getPrintableToken } from './util.js'
import { NAME_TO_SYMBOL } from './types.js'

export class ReproduceableJSONParseError extends Error {
  constructor(message, token, lines, options) {
    super(message, options)
    this.token = token
    this.tokenPrintable = getPrintableToken(token, lines)
    this.message = `${message}\nLocation: ${this.getLineVerbose()}\n${this.tokenPrintable}`
  }
  getLineVerbose(token = undefined) {
    if (!token) {
      token = this.token
    }
    return `line ${token.row + 1}, column ${token.col}`
  }
  getLineTerse(token = undefined) {
    if (!token) {
      token = this.token
    }
    return `L#${token.row + 1}:${token.col}`
  }
}

export class ReproduceableJSONUnexpectedSymbol extends ReproduceableJSONParseError {
  constructor(expected, token, lines, options) {
    super('', token, lines, options)
    const sym = NAME_TO_SYMBOL[this.token.symbol] ?? this.token.symbol
    const messagePrefix = `Parsing error: Unexpected symbol '${sym}' found at ${this.getLineVerbose()}.`
    if (expected) {
      this.message = `${messagePrefix} expected ${expected} instead.\n${this.tokenPrintable}`
    } else {
      this.message = `${messagePrefix}\n${this.tokenPrintable}`
    }
  }
}

export class ReproduceableJSONUnexpectedEnd extends ReproduceableJSONParseError {
  constructor(expected, token, lines, options) {
    super('', token, lines, options)
    const messagePrefix = `Parsing error: Unexpected end of JSON at ${this.getLineVerbose()}.`
    if (expected) {
      this.message = `${messagePrefix} expected ${expected} instead.\n${this.tokenPrintable}`
    } else {
      this.message = `${messagePrefix}\n${this.tokenPrintable}`
    }
  }
}

