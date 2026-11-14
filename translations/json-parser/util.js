/** @typedef {{ start: number, end: number, line: string, index: number }} LineInfo */
/** @type {(jsonStr: string) => LineInfo[]} */
export const getLinesFromJson = jsonStr => {
  /** @type {ReturnType<typeof getLinesFromJson>} */
  const lines = []
  const peek = i => (i + 1) < jsonStr.length ? jsonStr[i + 1] : '\0'

  let start = 0
  let line = ''
  for (let i = 0; i < jsonStr.length; i++) {
    const currChar = jsonStr[i]
    if (currChar === '\n' || currChar === '\r' && peek(i) === '\n') {
      if (currChar === '\r') {
        i++
      }
      lines.push({ start, end: i, line, index: lines.length })
      start = i + 1
      line = ''
    } else { 
      line += currChar
    }

  }
  if (line.length) {
    lines.push({ start, end: jsonStr.length - 1, line, index: lines.length })
  }
  return lines
}

/** @type {(token: Token, lines: LineInfo[]} */
export const getPrintableToken = (token, lines) => {
  if (token.row >= lines.length) return `ERR: Couldn't print token. Symbol: '${token.symbol}'. value: '${token.val === undefined ? '' : token.val}'`

  const { line } = lines[token.row]
  const markerBegin = token.col > 0 ? (new Array(token.col)).fill(' ').join('') : ''
  const marker = (new Array(Math.min(token.length, 1))).fill('^').join('')
  return `${line}\n${markerBegin}${marker}`
}

