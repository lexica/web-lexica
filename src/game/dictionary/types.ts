import type { Board, Coordinates } from '../board/types'

export const WorkerRequest = {
  ResolveBoardDictionary: 'board-dictionary',
  ResolveBoardHints: 'board-hints'
} as const

export type WorkerRequestT = typeof WorkerRequest[keyof typeof WorkerRequest]

export type ToWorkerMessage = {
  requestType: WorkerRequestT,
  info: ResolveBoardDictionary | ResolveBoardHints,
  requestId: string
}

export type ResolveBoardDictionary = {
  board: Board,
  dictionary: string[],
  minWordLength: number,
}

export type FromWorkerMessage = {
  result?: string[] | { [word:string]: Coordinates[] },
  requestId: string,
  error?: any
}

export type ResolveBoardHints = {
  board: Board,
  wordsOnBoard: string[],
}
