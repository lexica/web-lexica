import type { Board } from '../board/types'

export type ToWorkerMessage = {
  board: Board,
  dictionary: string[],
  minWordLength: number,
  requestId: string
}

export type FromWorkerMessage = {
  result?: string[],
  requestId: string,
  error?: any
}


