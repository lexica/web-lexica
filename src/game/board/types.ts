export type Letter = {
  letter: string,
  visited: boolean,
  index: number
}

export type Row = {
  [key: number]: Letter
} & { index: number }

export type Board = {
  [key: number]: Row
} & { width: number }

export type Coordinates = {
  row: number,
  column: number
}
