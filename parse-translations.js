const R = require('ramda')
const { readFileSync, writeFileSync, readdirSync, rmdirSync, existsSync, mkdirSync } = require('fs')
const { parse } = require('fast-xml-parser')
const { execSync } = require('child_process')
const languageTags = require('language-tags')

const tmpFolder = `tmp-${Date.now()}`

const translationsPath = './src/translations'
const remoteUrl = 'git@github.com:lexica/lexica.git'
const remoteTranslationsPath = `./${tmpFolder}/app/src/main/res`


execSync(`git clone --depth 1 ${remoteUrl} ${tmpFolder}`)

/** @type {(folder: string) => string} */
const readTranslationXML = folder => {
  const filePath = `${remoteTranslationsPath}/${folder}/strings.xml`
  return existsSync(filePath) ? readFileSync(filePath, { encoding: 'utf8' }) : null
}

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

const remoteTranslationsContent = readdirSync(remoteTranslationsPath)

const remoteTranslationFolderNames = R.filter(folderHasTranslations, remoteTranslationsContent)


/**
 * @type {{ [key: string]: string }}
 */
const translationFoldersMap = R.reduce((acc, folder) => {
  if (folder === 'values') return { ...acc, [folder]: 'en' }
  return { ...acc, [folder]: folder.replace(/^values-/, '') }
}, {}, remoteTranslationFolderNames)


/**
 * @param file {string}
 * @return {{ resources: { string: { name: string, '#text': string }[] } }}
 */
const pipeWhileNotNull = (...args) => R.pipeWith((fn, res) => R.isNil(res) ? res : fn(res))(args)

/** @type {(file: string) => string } */
const makeLanguageTitleTranslation = pipeWhileNotNull(
  parseXml,
  R.tap(() => console.log('parseXml done')),
  R.path(['resources', 'string']),
  R.tap(() => console.log('get values done')),
  R.filter(({ name }) => name.includes('pref_dict_') && !name.includes('_description')),
  R.tap(() => console.log('filter out everything else done')),
  R.map(({ name, '#text': text }) => ({ name: name.replace('pref_dict_', ''), text })),
  R.tap(() => console.log('make name done')),
  R.reduce((acc, { name, text }) => `${acc}  '${name}': '${text}',\n`, 'export const languageTitles = {\n'),
  R.tap(() => console.log('reduce done')),
  file => `${file}}\n`
)

/** @type {(fileName: string, folderName: string) => (file: string) => void} */
const writeTranslationTS = (fileName, folderName) => file => {
  const path = `${translationsPath}/languages/${folderName}`
  !existsSync(path) && mkdirSync(path, { recursive: true })
  writeFileSync(`${path}/${fileName}`, file)
  return true
}

/** @type {(folder: string) => void} */
const createLanguageTitleTranslation = folder => pipeWhileNotNull(
  R.tap(console.log),
  readTranslationXML,
  R.tap(() => console.log(`${folder} read xml done.`)),
  makeLanguageTitleTranslation,
  R.tap(() => console.log(`${folder} makeLanguageTranslations done.`)),
  writeTranslationTS('language-titles.ts', translationFoldersMap[folder]),
  R.tap(() => console.log(`${folder} done.`))
)(folder)

/** @type {(folder: string) => void} */
const createIndexFileForTranslation = folder => writeTranslationTS('index.ts', translationFoldersMap[folder])("export * from './language-titles'\n")

R.map(folder => createLanguageTitleTranslation(folder) && createIndexFileForTranslation(folder), remoteTranslationFolderNames)

/** @type {(type: string, tag: string) => string} */
const getDescriptionFromTag = (type, tag = '') => {
  const subtag = languageTags[type](tag)
  if (!subtag) return tag

  const [description] = subtag.descriptions()

  return description || tag
}

/** @type {(folders: string[]) => string} */
const createSuggestedImplementedLanguagesFile = folders => {
  /** @type {(suggestion: string) => string} */
  const sanatizeSuggestion = suggestion => suggestion.replace(/[-\W ]/g, '')

  /** @type {(folder: string) => string} */
  const folderToVarName = folder => folder.replace(/-/g, '_')

  /** @type {{ folder: string, suggestion: string }[]} */
  const suggestions = R.map((folder) => {
    const bcpTag = translationFoldersMap[folder]

    const [languageCode, regionCode] = bcpTag.split(/-r?/)

    const language = getDescriptionFromTag('language', languageCode)

    const region = getDescriptionFromTag('region', regionCode)

    const suggestion = `${language}${region ? `_${region}` : ''}`

    return { folder: languageCode, suggestion: sanatizeSuggestion(suggestion) }
  }, folders)


  const imports = `${R.reduce((acc, { folder }) => `${acc}import * as ${folderToVarName(folder)} from './languages/${folder}'\n`, '', suggestions)}`

  const enumeration = `${R.reduce(
    (acc, { folder, suggestion }) => `${acc}  ${suggestion} = '${folder}',\n`,
    'export enum ImplementedLanguage {\n',
    suggestions
  )}}\n`

  const mapping = `${R.reduce(
    (acc, { folder, suggestion}) => `${acc}  [ImplementedLanguage.${suggestion}]: ${folderToVarName(folder)},\n`,
    'export const languageCodeToTranslationsMap: { [P in ImplementedLanguage]: { languageTitles: { [key: string]: string}}} = {\n',
    suggestions
  )}}\n`

  writeFileSync(`${translationsPath}/implemented-languages.ts`, `/** Auto-generated */\n\n${imports}\n${enumeration}\n${mapping}`)

}

createSuggestedImplementedLanguagesFile(remoteTranslationFolderNames)

rmdirSync(`./${tmpFolder}`, { recursive: true })
