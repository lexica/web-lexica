const R = require('ramda')
const { program, Option } = require('commander')
const { readdirSync, existsSync, mkdirSync, writeFileSync } = require('fs')
const translationMaps = require('./android-and-web-translation-mappings')
const pathUtil = require('path')
const { folderHasTranslations, getAndroidTranslationsFromFolder } = require('./android-translations')
const { mapTranslationsFromAndroidToWeb } = require('./map-translations')
const typeHints = require('./make-ts-type-helper')

const {
  languageTitlesFromAndroidToWeb,
  translationsFromAndroidToWeb
} = translationMaps

/**
 * @type {(inputFolders: string[]) => { [key: string]: string }}
 */
const getInputFolderNameToTranslationCodeMap = inputFolders => R.reduce((acc, folder) => {
  if (folder === 'values') return { ...acc, [folder]: 'en' }
  return { ...acc, [folder]: folder.replace(/^values-/, '').replace('-r', '-') }
}, {}, inputFolders)

/** @type {(path: string, content: any) => void} */
const writeToFile = (path, content) => {
  writeFileSync(path, JSON.stringify(content, null, 2), { encoding: 'utf-8' })
}

const handleMergeTranslations = (args, options) => {
  /** @type {{ androidTranslationsDir: string, webTranslationsDir: string, clobber: boolean, print: boolean, tee: boolean }} */
  const {
    androidTranslationsDir,
    webTranslationsDir,
    clobber,
    update,
    print,
    tee
  } = options
  const getInputFolderPath = folder => `${androidTranslationsDir}/${folder}`

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

  const codes = args.includes('all') ? allCodes : args

  const enableWrite = tee || !print
  const enableLog = tee || print

  const mappedTranslations = codes.reduce((acc, languageCode) => {
    const androidTranslations = getAndroidTranslationsFromFolder(languageCodeToFolderPathMap[languageCode])
    if (languageCode === 'en') console.log(JSON.stringify(androidTranslations, null, 2))
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
        writeToFile(`${translationsDir}/translations.json`, translations)
      }
      if (languageTitles) {
        writeToFile(`${translationsDir}/language-titles.json`, languageTitles)
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
        writeToFile(path, merged)
      }
      if (languageTitles) {
        const path = `${translationsDir}/language-titles.json`
        const existingLanguageTitles = getExistingTranslationFile(path)
        const merged = mergeAndUpdate(existingLanguageTitles, languageTitles)
        writeToFile(path, merged)
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
        writeToFile(path, merged)
      }
      if (languageTitles) {
        const path = `${translationsDir}/language-titles.json`
        const existingLanguageTitles = getExistingTranslationFile(path)
        const merged = mergeAdditive(existingLanguageTitles, languageTitles)
        writeToFile(path, merged)
      }
    }
  }

  if (enableLog) {
    console.log(JSON.stringify(mappedTranslations))
  }
}

const handleGenerateTypeHints = (options) => {
  /** @type {{ sourceFileTranslations: string, sourceFileLanguageTitles: string, outFile: string }} */
  const {
    sourceFileTranslations,
    sourceFileLanguageTitles,
    outFile 
  } = options

  const translationsFile = pathUtil.resolve(sourceFileTranslations)
  const languageTitlesFile = pathUtil.resolve(sourceFileLanguageTitles)
  const destinationFile = pathUtil.resolve(outFile)

  const translationsPart = typeHints.makeTsFileFromTypeHintsObject(
    typeHints.getTypeHintsObject(require(translationsFile)),
    'Translations',
    true
  )
  const languageTitlesPart = typeHints.makeTsFileFromTypeHintsObject(
    typeHints.getTypeHintsObject(require(languageTitlesFile)),
    'LanguageTitles',
    false
  )
  
  writeFileSync(destinationFile, [translationsPart, languageTitlesPart].join('\n'), { encoding: 'utf-8' })
}

const main = () => {
  program.name('translations')
    .description('CLI tool for merging translations from Lexica into Web Lexica')
    .version('0.0.1')
  program.command('merge-translations')
    .argument('<string...>', 'one or more country code to merge, or "all" to merge all codes')
    .option('-a, --android-translations-dir <string>', 'path to the Lexica translations directory',  './tmp-translations/lexica/strings/app/src/main/res')
    .option('-w, --web-translations-dir <string>', 'path to the Web Lexica translations directory', './public/locales')
    .addOption(new Option('-c, --clobber', 'Replace existing Web Lexica translations with Lexica translations, does not merge translations at all').default(false).conflicts('update'))
    .option('-u, --update', 'Replace existing Web Lexica translations with Lexica translations where available, merges existing translations', false)
    .option('-p, --print', 'Print the results to stdout, no files will be written', false)
    .option('-t, --tee', 'Print the results to stdout, also write to file', false)
    .action(handleMergeTranslations)

  program.command('generate-type-hints')
    .option('-t, --source-file-translations <string>', 'the source file to base translations type hints from', './public/locales/en/translations.json')
    .option('-l, --source-file-language-titles <string>', 'the source file to base language title type hints from', './public/locales/en/language-titles.json')
    .option('-o, --out-file <string>', 'the file where the type hints will be written to', './src/translations/types.d.ts')
    .action(handleGenerateTypeHints)

  program.parse(process.argv)
}

if (require.main === module) main()



