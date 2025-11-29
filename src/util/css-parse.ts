import * as R from "ramda"
import { useEffect, useState } from "react"
import { ElementIdentifier, useElementSize } from "./hooks"
import { logger } from "./logger"

export const evaluateCssExp = (cssValue: string): number => {
  const cheat = document.getElementById('cheat')
  if (!cheat) {
    logger.warn('trying to evaluate css expression before DOM is loaded', { cssValue })
    return 0
  }
  cheat.setAttribute('style', `height: ${cssValue};`)
  const elementStyle = getComputedStyle(cheat)
  const rawValue = elementStyle.height
  if (!rawValue) return 0

  return Number.parseFloat(rawValue.replace(/[a-z]/g, ''))
}

const units = [
  'cm', 'mm', 'in', 'pt', 'pc', 'px', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%'
]

const argToString = (arg: any, expression: string) => {
  const isUnit = RegExp(`^(${units.join('|')})\\b`)
  if (R.isNil(arg)) return isUnit.test(expression) ? '0' : ''

  return (arg as Number).toString()
}

const makeExpression = (strings: TemplateStringsArray, ...args: any[]) => {
  let expression = ''
  for (let i = args.length; i > 0; i--) {
    expression = `${strings[i]}${expression}`
    const arg = args[i - 1]
    const argString = argToString(arg, strings[i])
    expression = `${argString}${expression}`
  }
  return `${strings[0]}${expression}`
}

export const cssExp = (strings: TemplateStringsArray, ...args: any[]): number => {
  const statement = makeExpression(strings, ...args)
  return evaluateCssExp(statement)
}

export const useCssExp = (expression: TemplateStringsArray, ...args: any[]) => {
  const [result, setResult] = useState(cssExp(expression, ...args))

  const { size: { width, height } } = useElementSize(ElementIdentifier.Type, 'body')

  useEffect(() => {
    // @ts-ignore eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = [width, height]

    setResult(cssExp(expression, ...args))
  }, [width, height, setResult, expression, args])

  return result
}