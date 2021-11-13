export type AwaitingAck = { id: string, timeoutForClearInterval: NodeJS.Timeout }
const intervalsAwaitingAck: AwaitingAck[] = []

const removeFromClearInterval = (id: string) => {
  const [toRemove] = intervalsAwaitingAck.filter(({ id: maybeId }) => maybeId === id)

  if (!toRemove) return

  const toRemoveIndex = intervalsAwaitingAck.indexOf(toRemove)
  clearTimeout(toRemove.timeoutForClearInterval)
  intervalsAwaitingAck.splice(toRemoveIndex, 1)
}

const addToClearInterval = (awaitingAck: AwaitingAck) => {
  intervalsAwaitingAck.push(awaitingAck)
}

const handleSetInterval = ({ interval, id }: { interval: number, id: string }) => {
  const intervalReference = setInterval(() => {
    (postMessage as any)(id)
    const timeoutForClearInterval = setTimeout(() => clearInterval(intervalReference), interval / 2)
    addToClearInterval({ id, timeoutForClearInterval })
  }, interval)
}

onmessage = (e: MessageEvent<{ interval: number, id: string } | string>) => {
  const info = e.data
  if (typeof info === 'string') return removeFromClearInterval(info)

  handleSetInterval(info)
}


