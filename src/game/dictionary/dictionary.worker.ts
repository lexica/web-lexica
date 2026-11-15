import { logger } from '../../util/logger'
import { type ResolveBoardDictionary, type ResolveBoardHints, type ToWorkerMessage, WorkerRequest } from './types'
import { getHintsForBoard, getWordsOnBoard } from './util'

const handleResolveBoardDictionary = ({ board, dictionary, minWordLength }: ResolveBoardDictionary) => {
  return getWordsOnBoard(board, dictionary, minWordLength)
}

const handleResolveBoardHints = ({ board, wordsOnBoard }: ResolveBoardHints) => {
  const hints = getHintsForBoard(board, wordsOnBoard)
  logger.debug('[Worker] Computed board hints', hints)
  return hints
}
onmessage = (e: MessageEvent<ToWorkerMessage>) => {
  const { info, requestType, requestId } = e.data
  const pm = (postMessage as any as (arg: any) => void)
  try {
    switch (requestType) {
      case WorkerRequest.ResolveBoardDictionary:
        pm({ result: handleResolveBoardDictionary(info as ResolveBoardDictionary), requestId })
        break
      case WorkerRequest.ResolveBoardHints:
        pm({ result: handleResolveBoardHints(info as ResolveBoardHints), requestId })
        break
      default:
        pm({ error: `Request of typ ${requestType} is not supported`, requestId })
    }
  } catch (error) {
    (postMessage as any as (arg: any) => void)({ error, requestId })
  }
}
