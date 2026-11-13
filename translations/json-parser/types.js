export const whitespaceStart = /** @type {const} */ (Symbol('whitespaceStart'))
export const isReproduceable = /** @type {const} */ (Symbol('isReproduceable'))
export const whitespaceEnd = /** @type {const} */ (Symbol('whitespaceStart'))
export const toReproducedString = /** @type {const} */ (Symbol('toReproducedString'))

export const JSym = /** @type {const} */ ({
  OBrace: 'open-curly',
  CBrace: 'closed-curly',
  OBracket: 'open-bracket',
  CBracket: 'closed-bracket',
  Colon: 'colon',
  Comma: 'comma',
  Str: 'string',
  Num: 'number',
  Nul: 'null',
  True: 'true',
  False: 'false',
  End: 'end',
})

export const WHITESPACE = /** @type {const} */ ([' ', '\t', '\n', '\r'])
export const DIGITS = /** @type {const} */ (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
export const NUMERIC = /** @type {const} */ ([...DIGITS, '-', '.', 'e', 'E', '+'])

/** @type {{ [sym: string]: JsonSymbol }} */
export const SYMBOL_TO_NAME = {
  '{': JSym.OBrace,
  '}': JSym.CBrace,
  '[': JSym.OBracket,
  ']': JSym.CBracket,
  ':': JSym.Colon,
  ',': JSym.Comma,
}

export const SCALARS = /** @type {const} */ ([
  JSym.Str,
  JSym.Num,
  JSym.Nul,
  JSym.True,
  JSym.False,
])

/** @type {{ [P in typeof JSym[keyof typeof JSym]: string }} */
export const NAME_TO_SYMBOL = {
  ...SCALARS.reduce((acc, s) => ({ ...acc, [s]: s }), {}),
  [JSym.End]: 'END',
  [JSym.OBrace]: '{',
  [JSym.CBrace]: '}',
  [JSym.OBracket]: '[',
  [JSym.CBracket]: ']',
  [JSym.Colon]: ':',
  [JSym.Comma]: ',',
}


export const NAME_TO_LITERAL = /** @type {const} */ ({
  [JSym.Nul]: null,
  [JSym.True]: true,
  [JSym.False]: false,
})

export const TState = /** @type {const} */ ({
  Root: 'root',
  Obj: 'object',
  Arr: 'array',
})

export const OState = /** @type {const} */ ({
  Start: 'start',
  GetKey: 'key',
  GetCol: 'colon',
  GetVal: 'val',
  Next: 'next',
})

export const AState = /** @type {const} */ ({
  Start: 'start',
  GetVal: 'val',
  Next: 'next'
})

