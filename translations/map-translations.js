import * as R from 'ramda'
import { mergeObjects } from './util.js'

/** @type {(path: string) => { pathSegments: string[], key: string }} */
const getPathAndKey = path => {
  const [key, ...reversedPath] = R.reverse(path.split('.'))
  return {
    key,
    pathSegments: R.reverse(reversedPath)
  }
}

/** @type {(path: string, value: string) => any} */
const makePartialTranslationFromPathAndValue = (path, value, transformerFn = R.identity) => {
  const { key, pathSegments } = getPathAndKey(path)
  return pathSegments.reduceRight((acc, k) => ({ [k]: acc }), { [key]: transformerFn(value) })
}

const makePartialTranslationFromPaths = (paths, value, transformerFn = R.identity) => {
  return paths
    .map(path => makePartialTranslationFromPathAndValue(path, value, transformerFn))
    .reduce(mergeObjects, {})
}

const makePartialTranslationFromValues = (mappingValues, translationValues) => mappingValues.map(mappingValue => {
  const { quantity, path } = mappingValue
  const [matchingTranslationValue = undefined] = translationValues.filter(({ quantity: quant }) => quant === quantity)
  if (!matchingTranslationValue) return {}
  return makePartialTranslationFromPathAndValue(path, matchingTranslationValue.value, mappingValue.transformerFn)
}).reduce(mergeObjects, {})

/** @type {(references: import('./android-and-web-translation-mappings').ReferenceEntry[]) => any} */
const makeReferences = references => references.reduce((acc, { path, referenceTo }) => mergeObjects(
  acc,
  makePartialTranslationFromPathAndValue(path, referenceTo)
), {})

/**
 * 
 * @param {import('./android-and-web-translation-mappings').AndroidToWebMap} translationMap 
 * @param {import('./android-translations').AndroidTranslation} androidTranslation 
 */
export const mapTranslationsFromAndroidToWeb = (translationMap, androidTranslation) => {
  const androidKeys = Object.keys(androidTranslation)
  const mappingKeys = Object.keys(translationMap)
  const commonKeys = mappingKeys.filter(k => androidKeys.includes(k))

  const references = makeReferences(translationMap['$references'] || [])

  if (!commonKeys) return references

  return commonKeys.reduce((acc, key) => {
    const translation = androidTranslation[key]
    const mapping = translationMap[key]

    if (translation.value === undefined) {
      return acc
    }

    if (translation.tag === 'string' && mapping.tag === 'string') {
      const value = translation.value
      const partialTranslation = makePartialTranslationFromPaths(mapping.paths, value, mapping.transformerFn)
      return mergeObjects(acc, partialTranslation)
    }

    if (translation.tag === 'plurals' && mapping.tag === 'plurals') {
      const partialTranslation = makePartialTranslationFromValues(mapping.values, translation.values)
      return mergeObjects(acc, partialTranslation)
    }
    return acc
  }, references)
}

// const genericGetTranslations = (translationMap) => {
//   return incomingTranslationFolderNames.reduce((acc, folder) => {
//     const androidTranslation = getAndroidTranslationsFromFolder(getFolderPath(folder))
//     return {
//       ...acc,
//       [folderNameToTranslationCodeMap[folder]]: mapTranslationsFromAndroidToWeb(translationMap, androidTranslation)
//     }
//   }, {})
// }

// const getTranslations = () => genericGetTranslations(translationsFromAndroidToWeb)

// const getLanguageTitles = () => genericGetTranslations(languageTitlesFromAndroidToWeb)
