const toCamelCaseReplaceFn = (_: string, wordSoFar: string, toCapitalize: string): string => {
  return `${wordSoFar}${toCapitalize.toUpperCase()}`
}

export const toCamelCase = (property: string) => property.replace(/(?:--)?(\w+)-(\w)/ig, toCamelCaseReplaceFn)

const getHeight = (id: string) => {
  const rawHeight = getComputedStyle(document.getElementById(id) as HTMLElement).height
  const height = parseFloat(rawHeight)

  console.log(JSON.stringify({ rawHeight, height, id }))

  return height
}

// eslint-disable-next-line
const em = (value: number) => {
  const emPerPixel = getHeight('em-cheat')
  return value * emPerPixel
}

const vh = (value: number) => {
  const vhPerPixel = getHeight('viewport-height-cheat')
  return value * vhPerPixel
}

// eslint-disable-next-line
const vw = (value: number) => {
  const vwPerPixel = getHeight('viewport-width-cheat')
  return value * vwPerPixel
}

const px = (value: number) => value

const unitMap = { em, vh, vw, px, '': (num: number) => num } as const

type Unit = keyof typeof unitMap

const clamp = (min: number, target: number, max: number) => {
  const clampMin = Math.max(target, min)
  const clampMax = Math.min(clampMin, max)
  return clampMax
}

const min = (a: number, b: number) => Math.min(a, b)

const max = (a: number, b: number) => Math.max(a, b)

const cssFunctionMap = {
  clamp,
  max,
  min
} as const

type ValidNames = keyof typeof cssFunctionMap

const isValidFunctionName = (fnName: string): fnName is ValidNames => (Object.keys(cssFunctionMap) as any as ValidNames).includes(fnName)

const getCssFunctionName = (expression: string): keyof typeof cssFunctionMap => {
  const firstParenIndex = expression.indexOf('(')
  if (firstParenIndex === -1) throw new Error(`${expression} has no function call`)
  const untrimmedFnName = expression.substring(0, firstParenIndex)
  const fnName = untrimmedFnName.trim()
  if (isValidFunctionName(fnName)) return fnName

  throw new Error(`${fnName} is not a supported css function name, expression: ${expression}`)
}

const getParenCounts = (expression: string) => {
  let left = 0, right = 0
  expression.split('').forEach(char => {
    if (char === '(') left++
    if (char === ')') right++
  })

  return { left, right }
}

const stitchParensReducer = (acc: string[], value: string, index: number, arr: string[]) => {
  const { left, right } = getParenCounts(value)
  if (left > right) return [...acc, `${value}, ${arr[index + 1]}`]
  if (right > left) return acc
  return [...acc, value]
}

const isCssFunction = (arg: string) => {
  return arg.indexOf('(') !== -1
}

const isValidUint = (arg: string): arg is keyof typeof unitMap => unitMap.hasOwnProperty(arg)

const getUnit = (arg: string): Unit => {
  const unit = /([a-z%]+)/.exec(arg)![0]

  if (!isValidUint(unit)) throw new Error(`${unit} is not a supported/valid css unit. argument: ${arg}`)

  return unit
}

const evaluateArgument = (arg: string): number => {
  if (isCssFunction(arg)) return evaluateFunction(arg)
  // assume numeric value of some sort

  const number = arg.replace(/([\d.]*)/, '$1')
  const unit = getUnit(arg)
  const parsedNumber = parseFloat(number)

  if (unit.length === 0 && parsedNumber !== 0) throw new Error(`${number} assumed to be numeric, ${parsedNumber} is not zero, needs unit`)
  if (unit.length === 0) return 0

  return unitMap[unit](parsedNumber)
}

const evaluateFunction = (expression: string): number => {
  const fnName = getCssFunctionName(expression)
  const rest = expression.replace(fnName, '').trim()
  const args = rest
    .replace(/\((.*)\);?$/, '$1')
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .reduce<string[]>(stitchParensReducer, [] as string[])
    .map(w => w.trim())
  try {
    const values = args.map(evaluateArgument)

    if (fnName === 'clamp' && values.length !== 3) throw new Error(`${values} is not the right number of arguments for ${fnName}, ${expression}`)
    if (fnName === 'max' && values.length !== 2) throw new Error(`${values} is not the right number of arguments for ${fnName}, ${expression}`)
    if (fnName === 'min' && values.length !== 2) throw new Error(`${values} is not the right number of arguments for ${fnName}, ${expression}`)

    return cssFunctionMap[fnName](...(values as [any, any, any]))

  } catch (err) {
    throw new Error(`${err.message}, parent expression: ${expression}`)
  }
}
export const cssExp = ([ expression ]: TemplateStringsArray, ..._rest: string[]) => {
  if (isCssFunction(expression)) return evaluateFunction(expression)
  return evaluateArgument(expression)
}

