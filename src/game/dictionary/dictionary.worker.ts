import { ToWorkerMessage } from './types'
import { getWordsOnBoard } from './util'

onmessage = (e: MessageEvent<ToWorkerMessage>) => {
  const { board, dictionary, minWordLength, requestId } = e.data
  try {
    const result = getWordsOnBoard(board, dictionary, minWordLength);
    (postMessage as any as (arg: any) => void)({ result, requestId })
  } catch (error) {
    (postMessage as any as (arg: any) => void)({ error, requestId })
  }
}
