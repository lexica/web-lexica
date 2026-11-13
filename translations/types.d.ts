import {
  whitespaceStart,
  whitespaceEnd,
  toReproducedString,
  isReproduceable,
} from './types.js'

export type JScalar = boolean | string | number | null
export type JVal = JScalar | JVal[] | Map<string, JVal>

type Reproduceable = {
  [whitespaceStart]: () => string,
  [whitespaceEnd]: () => string,
  [toReproducedString]: () => string,
  [isReproduceable]: true,
}

export type ReproduceableJVal = (JScalar & Reproduceable) | Reproduceable & (ReproduceableJVal[]) | Reproduceable & {} & (Map<string & Reproduceable, ReproduceableJVal>)
export type ReproduceableMap = Reproduceable & (Map<string & Reproduceable, ReproduceableJVal>)
export type ReproduceableArray = Reproduceable & (ReproduceableJVal[])
