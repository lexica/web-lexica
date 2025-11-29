import { readFileSync, existsSync } from 'fs'
import { XMLParser } from 'fast-xml-parser'
import * as R from 'ramda'

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' })

/** @typedef {{ name: string, '#text': string }} StringTagItem */
/** @typedef {{ '#text': string, quantity: string }} PluralsTagItemItem */
/** @typedef {{ name: string: item: PluralsTagItemItem[] }} PluralsTagItem */

/** @typedef {{ resources: { string?: StringTagItem[], plurals?: PluralsTagItem[] } }} ParsedXML */
/** @typedef {{ filename: string, contents: string }} TranslatedFile */

/** @typedef {{ value: string, quantity: string, tag: 'item' }} PluralItemContents */

/** @typedef {{ tag: 'plurals', values: PluralItemContents[] }} PluralContents */

/** @typedef {{ value: string, tag: 'string' }} StringContents */

/** @typedef {{ [key: string]: StringContents | PluralContents }} AndroidTranslation */


/** @type {(folderPath: string) => string} */
const readTranslationXML = folderPath => {
  const filePath = `${folderPath}/strings.xml`
  return existsSync(filePath) ? readFileSync(filePath, { encoding: 'utf8' }) : null
}

/** @type {(file: string) => ParsedXML} */
const parseXml = file => xmlParser.parse(file, {
  ignoreAttributes: false,
  parseAttributeValue: true,
  arrayMode: false,
  attributeNamePrefix: '',
})


/** @type {(folderPath: string) => boolean} */
export const folderHasTranslations = folderPath => {
  const file = readTranslationXML(folderPath)
  if (R.isNil(file)) return false

  const json = parseXml(file)

  const values = R.path(['resources', 'string'], json)

  if (R.isNil(values)) return false

  return true
}

/** @type {(originalXML: ParsedXML) => AndroidTranslation} */
const deriveAndroidTranslationsFromXML = originalXML => {
  try {

  if (!originalXML.resources) return {}

  const { resources: { string: strings = [], plurals: maybePlurals = [] } } = originalXML

  const plurals = Array.isArray(maybePlurals) ? maybePlurals : [maybePlurals]

  if (!strings && !plurals) return {}

  /** @type {{ [key: string]: StringContents }} */
  const stringPortion = strings.reduce((acc, item) => ({
    ...acc,
    [item.name]: {
      value: item['#text'],
      tag: 'string'
    }
  }), {})

  /** @type {(item: PluralsTagItemItem) => AndroidTranslationPluralValue} */
  const pluralItemMap = item => ({
    tag: 'item',
    quantity: item.quantity,
    value: item['#text']
  })

  /** @type {{ [key: string]: PluralContents }} */
  const pluralsPortion = plurals.reduce((acc, plural) => ({
    ...acc,
    [plural.name]: {
      tag: 'plurals',
      values: (Array.isArray(plural.item) ? plural.item : [plural.item]).map(pluralItemMap)
    }
  }), {})
  return {
    ...stringPortion,
    ...pluralsPortion
  }
  } catch (e) {
    console.warn(JSON.stringify(originalXML, null, 2))
    throw e
  }
}

/** @type {(folderPath: string) => AndroidTranslation} */
export const getAndroidTranslationsFromFolder = R.pipe(
  readTranslationXML,
  parseXml,
  deriveAndroidTranslationsFromXML
)
