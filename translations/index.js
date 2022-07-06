const { program, Option } = require('commander')
const R = require('ramda')
const { readdirSync, existsSync, mkdirSync, writeFileSync } = require('fs')
const translationMaps = require('./android-and-web-translation-mappings')
const pathUtil = require('path')
const { folderHasTranslations, getAndroidTranslationsFromFolder } = require('./android-translations')
const { mapTranslationsFromAndroidToWeb } = require('./map-translations')

const {
  languageTitlesFromAndroidToWeb,
  translationsFromAndroidToWeb
} = translationMaps

/**
 * @type {(inputFolders: string[]) => { [key: string]: string }}
 */
const getInputFolderNameToTranslationCodeMap = inputFolders => R.reduce((acc, folder) => {
  if (folder === 'values') return { ...acc, [folder]: 'en' }
  return { ...acc, [folder]: folder.replace(/^values-/, '') }
}, {}, inputFolders)


const main = () => {
  program.name('translations')
    .description('CLI tool for merging translations from Lexica into Web Lexica')
    .version('0.0.1')
  // program.command('merge-translation')
    .argument('<string...>', 'one or more country code to merge, or "all" to merge all codes')
    .option('-a, --android-translations-dir <string>', 'path to the Lexica translations directory',  './temp-translations/lexica/strings/app/src/main/res')
    .option('-w, --web-translations-dir <string>', 'path to the Web Lexica translations directory', './public/locales')
    .addOption(new Option('-c, --clobber', 'Replace existing Web Lexica translations with Lexica translations, does not merge translations at all').default(false).conflicts('update'))
    .option('-u, --update', 'Replace existing Web Lexica translations with Lexica translations where available, merges existing translations', false)
    .option('-p, --print', 'Print the results to stdout, no files will be written', false)
    .option('-t, --tee', 'Print the results to stdout, also write to file', false)

  console.log(process.env['PWD'], __dirname)
  // return
  program.parse(process.argv)

  /** @type {{ androidTranslationsDir: string, webTranslationsDir: string, clobber: boolean, print: boolean, tee: boolean }} */
  const {
    androidTranslationsDir,
    webTranslationsDir,
    clobber,
    update,
    print,
    tee
  } = program.opts()
  const getInputFolderPath = folder => { const path = `${androidTranslationsDir}/${folder}`; console.log(path); return path }

  const makeTranslationDir = (languageCode) => {
    const path = `${webTranslationsDir}/${languageCode}`
    if (!existsSync(path)) mkdirSync(path, { recursive: true })
    return path
  }

  const androidTranslationsDirContent = readdirSync(androidTranslationsDir)

  const inputFolderNames = androidTranslationsDirContent.filter(folder => folderHasTranslations(getInputFolderPath(folder)))
  const folderNameToLanguageCodeMap = getInputFolderNameToTranslationCodeMap(inputFolderNames)
  const languageCodeToFolderPathMap = Object.keys(folderNameToLanguageCodeMap).reduce((acc, key) => {
    return {
      ...acc,
      [folderNameToLanguageCodeMap[key]]: getInputFolderPath(key)
    }
  }, {})

  const allCodes = Object.keys(languageCodeToFolderPathMap)

  const codes = program.args.includes('all') ? allCodes : program.args


  const enableWrite = tee || !print
  const enableLog = tee || print

  const mappedTranslations = codes.reduce((acc, languageCode) => {
    const androidTranslations = getAndroidTranslationsFromFolder(languageCodeToFolderPathMap[languageCode])
    const translations = mapTranslationsFromAndroidToWeb(translationsFromAndroidToWeb, androidTranslations)
    const languageTitles = mapTranslationsFromAndroidToWeb(languageTitlesFromAndroidToWeb, androidTranslations)
    return {
      ...acc,
      [languageCode]: {
        translations,
        languageTitles
      }
    }
  }, {})

  if (clobber && enableWrite) {
    for(const languageCode in mappedTranslations) {
      const { translations, languageTitles } = mappedTranslations[languageCode]
      if (!translations && !languageTitles) continue
      const translationsDir = makeTranslationDir(languageCode)
      if (translations) {
        writeFileSync(`${translationsDir}/translations.json`, JSON.stringify(translations), { encoding: 'utf-8' })
      }
      if (languageTitles) {
        writeFileSync(`${translationsDir}/language-titles.json`, JSON.stringify(languageTitles), { encoding: 'utf-8' })
      }
    }
  }

  const getExistingTranslationFile = pathToTranslationFile => {
    const absPath = pathUtil.resolve(pathToTranslationFile)
    return existsSync(absPath) ? require(absPath) : {}
  }

  if (update && enableWrite) {
    for(const languageCode in mappedTranslations) {
      const { translations, languageTitles } = mappedTranslations[languageCode]
      if (!translations && !languageTitles) continue
      const translationsDir = makeTranslationDir(languageCode)
      const mergeAndUpdate = (existing, update) => R.mergeDeepWith((_existingVal, updateVal) => updateVal, existing, update)
      if (translations) {
        const path = `${translationsDir}/translations.json`
        const existingTranslations = getExistingTranslationFile(path)
        const merged = mergeAndUpdate(existingTranslations, translations)
        writeFileSync(path, JSON.stringify(merged), { encoding: 'utf-8' })
      }
      if (languageTitles) {
        const path = `${translationsDir}/language-titles.json`
        const existingLanguageTitles = getExistingTranslationFile(path)
        const merged = mergeAndUpdate(existingLanguageTitles, languageTitles)
        writeFileSync(path, JSON.stringify(merged), { encoding: 'utf-8' })
      }
    }
  }

  const additiveOnly = !clobber && !update
  if (additiveOnly && enableWrite) {
    for(const languageCode in mappedTranslations) {
      const { translations, languageTitles } = mappedTranslations[languageCode]
      if (!translations && !languageTitles) continue
      const translationsDir = makeTranslationDir(languageCode)
      const mergeAdditive = (existing, update) => R.mergeDeepWith((existingVal, _updateVal) => existingVal, existing, update)
      if (translations) {
        const path = `${translationsDir}/translations.json`
        const existingTranslations = getExistingTranslationFile(path)
        const merged = mergeAdditive(existingTranslations, translations)
        writeFileSync(path, JSON.stringify(merged), { encoding: 'utf-8' })
      }
      if (languageTitles) {
        const path = `${translationsDir}/language-titles.json`
        const existingLanguageTitles = getExistingTranslationFile(path)
        const merged = mergeAdditive(existingLanguageTitles, languageTitles)
        writeFileSync(path, JSON.stringify(merged), { encoding: 'utf-8' })
      }
    }
  }

  if (enableLog) {
    console.log(JSON.stringify(mappedTranslations))
  }
}

if (require.main === module) main()



