import { useCallback, useContext } from 'react'

import {
  MetadataV1,
  setLanguageInLocalStorage,
  useLanguageCodeFromLocalStorage,
  useMultipleLanguageMetadata
} from '../game/language'
import { Translations } from '../translations'
import { makeClasses } from '../util/classes'
import { logger } from '../util/logger'
import { useSafeNavigateBack } from '../util/url'

import './Lexicons.css'

const getBetaLabel = (metadata?: MetadataV1, betaLabel: string = '') => {
  const getLabel = (text: string) => <div className="lexicons-lexicon-beta-label">{text}</div>
  if (metadata?.isBeta === undefined) return getLabel('Loading...')
  return metadata.isBeta ? getLabel(betaLabel) : <></>
}

type LexiconProps = {
  languageCode: string,
  metadata?: MetadataV1
}

const Lexicon = ({
  languageCode,
  metadata
}: LexiconProps): JSX.Element => {
  const translations = useContext(Translations)
  const title = translations.languageTitlesFn(languageCode as any)
  const beta = getBetaLabel(metadata, translations.translationsFn('pages.lexicons.isBeta'))
  const currentCode = useLanguageCodeFromLocalStorage()

  const back = useSafeNavigateBack()

  const handleOnClick = useCallback(() => {
    logger.debug('setting lexicon code...', languageCode)
    setLanguageInLocalStorage(languageCode)
    back()
  }, [languageCode, back])

  const classes = makeClasses('lexicons-lexicon', {
    condition: currentCode === languageCode,
    name: 'lexicons-lexicon-selected'
  })

  return <div
    className={classes}
    onClick={handleOnClick}
  >
    <div className="lexicons-lexicon-title">{title}</div>
    {beta}
  </div>
}

const Lexicons = (): JSX.Element => {
  const { translationsFn } = useContext(Translations)
  const { loading, metadata } = useMultipleLanguageMetadata()
  const languages = Object.keys(metadata)

  const getLexicon = (languageCode: string) => <Lexicon
      languageCode={languageCode}
      key={languageCode}
      metadata={metadata[languageCode]}
    />

  if (loading) return <div className="Page lexicons-loading">{translationsFn('general.loading')}</div>

  return <div className="Page lexicons scrollbar">
    {languages.map(l => getLexicon(l))}
  </div>
}

export default Lexicons
