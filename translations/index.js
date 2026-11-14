import * as R from 'ramda'
import { program, Option } from 'commander'
import { readdirSync, existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import * as translationMaps from './android-and-web-translation-mappings.js'
import pathUtil from 'node:path'
import { folderHasTranslations, getAndroidTranslationsFromFolder } from './android-translations.js'
import { mapTranslationsFromAndroidToWeb } from './map-translations.js'
import * as typeHints from './make-ts-type-helper.js'
import StreamZip from 'node-stream-zip'
import { parseReproduceableJSON, stringifyReproduceableJSON } from './json-parser/index.js'
import { mergeLeftMap } from './util.js'

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
const writeToFile = (path, content, indentLevel = 2) => {
  writeFileSync(path, stringifyReproduceableJSON(content, indentLevel), { encoding: 'utf-8' })
}

const handleDownload = async downloadPath => {
  const downloadURL = 'https://hosted.weblate.org/api/components/lexica/strings/file/'
  const weblateToken = process.env["WEBLATE_TOKEN"]
  if (!weblateToken?.length) {
    console.error("WEBLATE_TOKEN is unset.")
    process.exit(1)
  }
  mkdirSync(downloadPath, { recursive: true })
  const req = await fetch(downloadURL, { headers: { 'Authorization': `Bearer ${weblateToken}` } })
  const resp = await req.blob()
  const filePath = pathUtil.join(downloadPath, 'tmp-translations.zip')
  await writeFile(filePath, resp.stream())
  const zip = new StreamZip.async({ file: filePath })

  await zip.extract(null, downloadPath)
  unlinkSync(filePath)
}

const handleMergeTranslations = async (args, options) => {
  /** @type {{ androidTranslationsDir: string, webTranslationsDir: string, clobber: boolean, print: boolean, tee: boolean }} */
  const {
    androidTranslationsDir,
    webTranslationsDir,
    clobber,
    update,
    print,
    tee,
    download
  } = options

  if (download) {
    const downloadPath = androidTranslationsDir.replace(/\/lexica\/strings\/app\/src\/main\/res$/, '')
    await handleDownload(downloadPath)
  }


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
    if (!existsSync(absPath)) return [new Map(), 2]
    const contents = readFileSync(absPath, { encoding: 'utf8' })
    const [_, secondLine, ...__] = contents.split('\n')
    const indentLevel = Math.max(2, secondLine.split('').findIndex(c => c != ' '))

    return [parseReproduceableJSON(contents), indentLevel]
  }

  if (update && enableWrite) {
    for(const languageCode in mappedTranslations) {
      const { translations, languageTitles } = mappedTranslations[languageCode]
      if (!translations && !languageTitles) continue
      const translationsDir = makeTranslationDir(languageCode)
      const mergeAndUpdate = (existing, update) => mergeLeftMap(existing, update, true)
      if (translations) {
        const path = `${translationsDir}/translations.json`
        const [existingTranslations, indentLevel] = getExistingTranslationFile(path)
        const merged = mergeAndUpdate(existingTranslations, translations)
        writeToFile(path, merged, indentLevel)
      }
      if (languageTitles) {
        const path = `${translationsDir}/language-titles.json`
        const [existingLanguageTitles, indentLevel] = getExistingTranslationFile(path)
        const merged = mergeAndUpdate(existingLanguageTitles, languageTitles)
        writeToFile(path, merged, indentLevel)
      }
    }
  }

  const additiveOnly = !clobber && !update
  if (additiveOnly && enableWrite) {
    for(const languageCode in mappedTranslations) {
      const { translations, languageTitles } = mappedTranslations[languageCode]
      if (!translations && !languageTitles) continue
      const translationsDir = makeTranslationDir(languageCode)
      const mergeAdditive = (existing, update) => mergeLeftMap(existing, update, false)
      if (translations) {
        const path = `${translationsDir}/translations.json`
        const [existingTranslations, indentLevel] = getExistingTranslationFile(path)
        const merged = mergeAdditive(existingTranslations, translations)
        writeToFile(path, merged, indentLevel)
      }
      if (languageTitles) {
        const path = `${translationsDir}/language-titles.json`
        const [existingLanguageTitles, indentLevel] = getExistingTranslationFile(path)
        const merged = mergeAdditive(existingLanguageTitles, languageTitles)
        writeToFile(path, merged, indentLevel)
      }
    }
  }

  if (enableLog) {
    console.log(JSON.stringify(mappedTranslations))
  }
}

const handleGenerateTypeHints = async (options) => {
  /** @type {{ sourceFileTranslations: string, sourceFileLanguageTitles: string, outFile: string }} */
  const {
    sourceFileTranslations,
    sourceFileLanguageTitles,
    outFile 
  } = options

  const translationsFile = pathUtil.resolve(sourceFileTranslations)
  const languageTitlesFile = pathUtil.resolve(sourceFileLanguageTitles)
  const destinationFile = pathUtil.resolve(outFile)

  const translationsRaw = await import(translationsFile, { with: { type: "json" } })
  const translationsPart = typeHints.makeTsFileFromTypeHintsObject(
    typeHints.getTypeHintsObject(translationsRaw.default),
    'Translations',
    true
  )
  const languageTitlesRaw = await import(languageTitlesFile, { with: { type: "json" } })
  const languageTitlesPart = typeHints.makeTsFileFromTypeHintsObject(
    typeHints.getTypeHintsObject(languageTitlesRaw.default),
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
    .option(
      '-d, --download',
      'download lexica translations to the --android-translations-dir (stripping off the /lexica/strings/app/src/main/res part of the path)\n'
      + 'NOTE: the env var WEBLATE_TOKEN must contain a valid api key from weblate to use this option.',
      false,
    )
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

if (import.meta.main) main()



