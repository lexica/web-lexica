export type Letter = {
  letter: string,
  visited: boolean,
  index: number
}

export type Board = {
  [key: number]: {
    [key: number]: Letter
  } & { index: number }
} & { width: number }

export type Coordinates = {
  row: number,
  column: number
}
