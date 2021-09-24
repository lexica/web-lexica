const R = require('ramda')
const { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } = require('fs')
const { parse } = require('fast-xml-parser')
const languageTags = require('language-tags')

const tmpFolder = process.argv[2]
const translationsPath = './src/translations'
const incomingTranslationsPath = `./${tmpFolder}/lexica/strings/app/src/main/res`

/** @type {(folder: string) => string} */
const readTranslationXML = folder => {
  const filePath = `${incomingTranslationsPath}/${folder}/strings.xml`
  return existsSync(filePath) ? readFileSync(filePath, { encoding: 'utf8' }) : null
}

/** @typedef {{ resources: { string?: { name: string, '#text': string } } }} ParsedXML */
/** @typedef {{ filename: string, contents: string }} TranslatedFile */

/** @type {(file: string) => ParsedXML} */
const parseXml = file => parse(file, {
  ignoreAttributes: false,
  parseAttributeValue: true,
  arrayMode: false,
  attributeNamePrefix: '',
})

/** @type {(folder: string) => boolean} */
const folderHasTranslations = folder => {
  const file = readTranslationXML(folder)
  if (R.isNil(file)) return false

  const json = parseXml(file)

  const values = R.path(['resources', 'string'], json)

  if (R.isNil(values)) return false

  return true
}

const incomingTranslationsContent = readdirSync(incomingTranslationsPath)

const incomingTranslationFolderNames = R.filter(folderHasTranslations, incomingTranslationsContent)

/**
 * @type {{ [key: string]: string }}
 */
const translationFoldersMap = R.reduce((acc, folder) => {
  if (folder === 'values') return { ...acc, [folder]: 'en' }
  return { ...acc, [folder]: folder.replace(/^values-/, '') }
}, {}, incomingTranslationFolderNames)

const pipeWhileNotNull = (...args) => R.pipeWith((fn, res) => R.isNil(res) ? res : fn(res))(args)

/** @type {(fileName: string, folderName: string, file: string) => void} */
const _writeTranslationsTS = (fileName, folderName, file) => {
  const path = `${translationsPath}/languages/${folderName}`
  !existsSync(path) && mkdirSync(path, { recursive: true })
  writeFileSync(`${path}/${fileName}.ts`, file)
  return true
}
const writeTranslationTS = R.curryN(3, _writeTranslationsTS)

/** @type {(folder: string) => void} */


/** @type {(files: TranslatedFile[]) => string} */
const getIndexFile = R.reduce((acc, { filename }) => `${acc}export * from './${filename}'\n`, '')


/** @type {(translationFns: ((arg: ParsedXML) => (TranslatedFile | null))[]) => (folder: string) => void} */
const createFilesForLanguage = translationFns => folder => {
  const file = readTranslationXML(folder)
  const localFolderName = translationFoldersMap[folder]
  const parsedXML = parseXml(file)

  /** @type {(file: { filename: string, contents: string }) => void} */
  const writeFile = ({ filename, contents }) => writeTranslationTS(filename, localFolderName, contents)

  /** @type {{ filename: string, contents: string }[]} */

  R.pipe(
    R.map(fn => fn(parsedXML)),
    R.filter((result) => result && !(R.isNil(result.contents) || R.isEmpty(result.contents))),
    R.tap(R.map(writeFile)),
    getIndexFile,
    writeTranslationTS('index', localFolderName)
  )(translationFns)
}

/** @type {(fns: ((arg: ParsedXML) => TranslatedFile)[]) => void} */
const createTranslationFiles = fns => R.map(createFilesForLanguage(fns), incomingTranslationFolderNames)

// ----- XML to TS conversions

/** @type {(parsedXML: ParsedXML) => TranslatedFile } */
const getLanguageTitlesFile = pipeWhileNotNull(
  R.path(['resources', 'string']),
  R.filter(({ name }) => name.includes('pref_dict_') && !name.includes('_description')),
  R.map(({ name, '#text': text }) => ({ name: name.replace('pref_dict_', ''), text })),
  /** @type {({ name: string, text: string }[]) => string} */
  titles => R.reduce(
    (acc, { name, text }) => `${acc}  '${name}': '${text}',\n`,
    'export const languageTitles = {\n',
    titles
  ),
  file => ({ contents: `${file}}\n`, filename: 'language-titles' })
)

createTranslationFiles([
  getLanguageTitlesFile
])

/** @type {(type: string, tag: string) => string} */
const getDescriptionFromTag = (type, tag = '') => {
  /** @type {import('language-tags').Subtag} */
  const subtag = languageTags[type](tag)
  if (!subtag) return tag

  const [description] = subtag.descriptions()

  return description || tag
}

/** @type {(incomingTranslationFolders: string[]) => string} */
const createImplementedLanguagesFile = incomingTranslationFolders => {
  /** @type {(folder: string) => string} */
  const kebabToSnakeCase = folder => folder.replace(/-/g, '_')

  /** @type {(description: string) => string} */
  const sanatizeDescription = description => description.replace(/[-\W ]/g, '')

  /** @type {{ folder: string, description: string }[]} */
  const suggestions = R.map((incomingTranslationFolder) => {
    const localFolder = translationFoldersMap[incomingTranslationFolder]

    const [languageCode, regionCode] = localFolder.split(/-r?/)

    const language = getDescriptionFromTag('language', languageCode)

    const region = getDescriptionFromTag('region', regionCode)

    const description = sanatizeDescription(`${language}${region ? `_${region}` : ''}`)

    return { folder: localFolder, description }
  }, incomingTranslationFolders)

  const imports = `${R.reduce((acc, { folder }) => `${acc}import * as ${kebabToSnakeCase(folder)} from './languages/${folder}'\n`, '', suggestions)}`

  const enumeration = `${R.reduce(
    (acc, { folder, description }) => `${acc}  ${description} = '${folder}',\n`,
    'export enum ImplementedLanguage {\n',
    suggestions
  )}}\n`

  const mapping = `${R.reduce(
    (acc, { folder, description}) => `${acc}  [ImplementedLanguage.${description}]: ${kebabToSnakeCase(folder)},\n`,
    'export const languageCodeToTranslationsMap: { [P in ImplementedLanguage]: { languageTitles: { [key: string]: string}}} = {\n',
    suggestions
  )}}\n`

  writeFileSync(`${translationsPath}/implemented-languages.ts`, `/** Auto-generated */\n\n${imports}\n${enumeration}\n${mapping}`)
}

createImplementedLanguagesFile(incomingTranslationFolderNames)
