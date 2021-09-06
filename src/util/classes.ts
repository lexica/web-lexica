import * as R from 'ramda'

export const makeClasses = (...classes: (string | undefined)[]): string => R.reduce(
  (acc: string, cssClass: string | undefined) => cssClass ? `${acc} ${cssClass}` : acc,
  '',
  classes
)
