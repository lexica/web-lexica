import { useCallback } from 'react'
import { useNavigate } from 'react-router'

import {
  MetadataV1,
  setLanguageInLocalStorage,
  useLanguageCodeFromLocalStorage,
  useMultipleLanguageMetadata
} from '../game/language'
import { useTranslations } from '../translations'
import { makeClasses } from '../util/classes'
import { logger } from '../util/logger'

import './Lexicons.css'

const getBetaLabel = (metadata?: MetadataV1) => {
  const getLabel = (text: string) => <div className="lexicons-lexicon-beta-label">{text}</div>
  if (metadata?.isBeta === undefined) return getLabel('Loading...')
  return metadata.isBeta ? getLabel('Beta') : <></>
}

type LexiconProps = {
  languageCode: string,
  metadata?: MetadataV1
}

const Lexicon = ({
  languageCode,
  metadata
}: LexiconProps): JSX.Element => {
  const { languageTitles } = useTranslations()
  const languageTitleKey = languageCode as any as keyof typeof languageTitles
  const title = languageTitles[languageTitleKey] || languageCode
  const beta = getBetaLabel(metadata)
  const currentCode = useLanguageCodeFromLocalStorage()

  const navigate = useNavigate()

  const handleOnClick = useCallback(() => {
    logger.debug('setting language code...', languageCode)
    setLanguageInLocalStorage(languageCode)
    navigate('/')
  }, [languageCode, navigate])

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
  const { loading, metadata } = useMultipleLanguageMetadata()
  const languages = Object.keys(metadata)

  const getLexicon = (languageCode: string) => <Lexicon
      languageCode={languageCode}
      key={languageCode}
      metadata={metadata[languageCode]}
    />

  if (loading) return <div className="Page lexicons-loading">Loading...</div>

  return <div className="Page lexicons scrollbar">
    {languages.map(l => getLexicon(l))}
  </div>
}

export default Lexicons
