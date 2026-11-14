import {
  whitespaceStart,
  whitespaceEnd,
  toReproducedString,
  isReproduceable,
  JSym,
  SCALARS,
  TState,
  AState,
  OState,
} from './types.js'

export type JScalar = boolean | string | number | null
export type JVal = JScalar | JVal[] | Map<string, JVal>
export type JsonSymbol = (typeof JSym)[keyof typeof JSym]
export type JsonScalarSymbol = (typeof SCALARS)[number]

type BaseToken = { startPos: number, length: number, row: number, col: number}
type ScalarToken = { symbol: JsonScalarSymbol, val: JScalar }
type OtherToken = { symbol: Exclude<JsonSymbol, JsonScalarSymbol>, val: undefined }
export type Token = (ScalarToken | OtherToken) & BaseToken

type Reproduceable = {
  [whitespaceStart]: () => string,
  [whitespaceEnd]: () => string,
  [toReproducedString]: () => string,
  [isReproduceable]: true,
}

export type ReproduceableJVal = (JScalar & Reproduceable) | Reproduceable & (ReproduceableJVal[]) | Reproduceable & {} & (Map<string & Reproduceable, ReproduceableJVal>)
export type ReproduceableMap = Reproduceable & (Map<string & Reproduceable, ReproduceableJVal>)
export type ReproduceableArray = Reproduceable & (ReproduceableJVal[])


type TStateT = typeof TState
type OStateT = typeof OState
type AStateT = typeof AState

type RootContext = {
  stateType: TStateT['Root'],
  current: JVal[],
  startTok: Token,
  id: import('node:crypto').UUID,
}

type OSubState = { subState: OStateT['GetVal' | 'GetCol'], key: string, } | { subState: OStateT[Exclude<keyof OStateT, 'GetVal', 'GetCol'>] }
type ObjectContext = {
  stateType: TStateT['Obj'],
  current: Map<string, JVal>
  startTok: Token,
  id: import('node:crypto').UUID,
} & OSubState

type ArrayContext = {
  stateType: TStateT['Arr'],
  current: JVal[],
  subState: AStateT[keyof AStateT],
  startTok: Token,
  id: import('node:crypto').UUID,
}

export type ParseContext = RootContext | ObjectContext | ArrayContext

