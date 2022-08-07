class Interpolation {
  constructor(...vars) {
    this.vars = vars
  }
}

class Normal { constructor () {} }

const interpolationMatcher = /{{([^}]*)}}/g

/** @type {(s: string) => string} */
const stripBrackets = s => s.replace(/{{([^}]*)}}/, '$1')

/**
 * 
 * @param {any} fullTranslations 
 * @returns {{ [key: string]: any }}
 */
const getTypeHintsObject = fullTranslations => {
  const getPath = (path, key) => path ? `${path}.${key}` : key
  const getReducer = (obj, pathSoFar = '') => (acc, key) => {
    const path = getPath(pathSoFar, key)
    const value = obj[key]
    const [maybeCountKey] = key.split('_')
    if (maybeCountKey !== key && value.includes('{{count}}')) {
      const countKey = maybeCountKey
      const countPath = getPath(pathSoFar, countKey)
      if (acc[countPath]) return acc
      return {
        ...acc,
        [countPath]: new Interpolation('count')
      }
    }

    if (typeof value === 'string') {
      const interpolationMatches = (value.match(interpolationMatcher) || []).map(stripBrackets)
      if (!interpolationMatches.length) return { ...acc, [path]: new Normal() }

      return { ...acc, [path]: new Interpolation(...interpolationMatches) }
    }

    const reducer = getReducer(value, path) 
    const subGroup = Object.keys(value).reduce(reducer, {})
    return { ...acc, ...subGroup }
  }
  const reducer = getReducer(fullTranslations)

  return Object.keys(fullTranslations).reduce(reducer, {})
}

const makeTsFileFromTypeHintsObject = (typeHintsObject, name, includeImports = true) => {
  const interpolationType = 'string | number'
  const helperType = `${name}Keys`
  const renderedHelperType = Object.keys(typeHintsObject).reduce((acc, key) => {
    const value = typeHintsObject[key]
    if (value instanceof Normal) {
      return `${acc}  '${key}': string,\n`
    }
    if (value instanceof Interpolation) {
      const interpolationHelper = value.vars.reduce((acc, k) => `${acc}    '${k}': ${interpolationType},\n`, '{\n') + '  }'
      return `${acc}  '${key}': ${interpolationHelper},\n`
    }
    return acc
  }, `export type ${helperType} = {\n`) + '}\n'

  const funcType = `${name}Fn`
  const funcHelperType = `${funcType}SecondArg`

  const renderedTranslationFunctionType = `type ${funcHelperType}<K extends keyof ${helperType}> = {
  0: TOptionsBase,
  1: TOptionsBase & ${helperType}[K]
}[ ${helperType}[K] extends string ? 0 : 1 ]

export type ${funcType} = {
  <I extends keyof ${helperType}>(key: I, options: ${funcHelperType}<I>): string
  <I extends keyof ${helperType}>(key: ${helperType}[I] extends string ? I : never, options?: TOptionsBase): string
}
`
  const imports = includeImports ? `import { TOptionsBase } from 'i18next'\n` : ''

  return [imports, renderedHelperType, renderedTranslationFunctionType].join('\n')
}

module.exports = {
  getTypeHintsObject,
  makeTsFileFromTypeHintsObject
}
