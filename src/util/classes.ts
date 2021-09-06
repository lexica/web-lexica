import * as R from 'ramda'

export type ConditionalClass = {
  name: string,
  condition: boolean
}

export type TrueAndFalseCaseClass = {
  condition: boolean,
  true: string,
  false: string
}

const isTureAndFalseCaseClass = (cssClass: ConditionalClass | TrueAndFalseCaseClass): cssClass is TrueAndFalseCaseClass => cssClass.hasOwnProperty('true')

const getClass = (cssClass: string | undefined | ConditionalClass | TrueAndFalseCaseClass): string | undefined => {
  if (!cssClass) return cssClass
  if (typeof cssClass === 'string') return cssClass

  if (isTureAndFalseCaseClass(cssClass)) {
    const { condition, true: trueCase, false: falseCase } = cssClass as TrueAndFalseCaseClass
    return condition ? trueCase : falseCase
  }

  return cssClass.condition ? cssClass.name : undefined
}

export const makeClasses = (...classes: (string | undefined | ConditionalClass | TrueAndFalseCaseClass)[]): string => R.reduce(
  (acc: string, cssClass: typeof classes[number]) => cssClass ? `${acc} ${getClass(cssClass)}` : acc,
  '',
  classes
).trim()
