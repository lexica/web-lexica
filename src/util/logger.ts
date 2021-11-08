type Primitive = string | number
const isPrimitive = (item: any): item is Primitive => {
  return typeof item === 'number' || typeof item === 'string'
}

export const logger = {
  error: console.error,
  info: console.info,
  debug: process.env.NODE_ENV === 'production' ? (..._: any[]) => {} : (...toLog: any[]) => {
    const logString = toLog.map(loggable => {
      if (isPrimitive(loggable)) return loggable.toString()

      try {
        return JSON.stringify(loggable)
      } catch(e: any) {
        if (typeof loggable.toString === 'function') return loggable.toString() as string
        return `${loggable}`
      }
    }).join('\n')

    console.debug(logString)
  }
}
