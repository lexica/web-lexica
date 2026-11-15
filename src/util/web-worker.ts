import { v4 as uuid } from 'uuid'
import { logger } from './logger'

export type ToWorkerPayload = {
  requestId: string
}

type FromWorkerPayload<T> = {
  requestId: string,
  error?: any
  result?: T
}

export const promisifyWorker = <T extends ToWorkerPayload, F>(worker: InstanceType<typeof window.Worker>, payload: Omit<T, 'requestId'>): Promise<F> => {
  return new Promise<F>((respond, reject) => {
    const requestId = uuid()
    logger.debug(`Sending event. requestId: ${requestId}`, { payload })
    worker!.postMessage({ ...payload, requestId })
    worker!.addEventListener('message', (e: MessageEvent<FromWorkerPayload<F>>) => {
      const { data } = e
      if (data?.requestId !== requestId) return

      if (data.error) {
        reject(e)
        return
      }

      respond(data.result as F)
    })
  })
}

