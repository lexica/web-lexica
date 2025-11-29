type Primitive = string | number
const isPrimitive = (item: any): item is Primitive => {
  return typeof item === 'number' || typeof item === 'string'
}

const getCallingFunction = () => {
  const stack = (new Error()).stack?.split('\n')
  if (stack === undefined || stack.length === 0) return

  // Error
  // at getCallingFunction
  // at Object.push../src/util/logger.ts...
  // at {calling function}
  const parentCallLine = stack[3]

  const anonFunction = /^\s*at\shttp/i

  if (parentCallLine === undefined || anonFunction.test(parentCallLine)) return

  const getCallee = /^\s*(at\s+[\w\d_-]+).*$/

  const callee = parentCallLine.replace(getCallee, '$1')

  return callee
}

export const logger = {
  error: console.error,
  info: console.info,
  warn: console.warn,
  debug: (["localhost", "127.0.0.1"].includes(window.location.hostname) === false) ? (..._: any[]) => {} : (...logs: any[]) => {
    const logString = logs.map(log => {
      if (isPrimitive(log)) return log.toString()

      try {
        return JSON.stringify(log)
      } catch(e: any) {
        if (typeof log.toString === 'function') return log.toString() as string
        return `${log}`
      }
    }).join('\n')

    const callee = getCallingFunction()

    if (!callee) {
      console.debug(logString)
      return
    }

    console.debug(logString, callee)
  }
}
