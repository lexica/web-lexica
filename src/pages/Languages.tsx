import { useCallback } from 'react'

import {
    getLanguageChoices,
    useLanguageChoice,
} from '../util/language'
import { makeClasses } from '../util/classes'
import { logger } from '../util/logger'

import './Languages.css'
import { usePromise, useStaticValue } from '../util/hooks'
import { useSafeNavigateBack } from '../util/url'

type LanguageProps = {
    languageCode: string,
    languageTitle: string,
    currentLanguageCode: string,
    onClick: (languageCode: string) => void,
}

const Language = ({ languageCode, languageTitle, currentLanguageCode, onClick }: LanguageProps): JSX.Element => {


  const classes = makeClasses('languages-language', {
    condition: currentLanguageCode === languageCode,
    name: 'languages-language-selected'
  })

  return <div
    className={classes}
    onClick={() => onClick(languageCode)}
  >
    <div className="languages-language-title">{languageTitle}</div>
  </div>
}

const Languages = (): JSX.Element => {
  const languagePromise = useStaticValue(getLanguageChoices())
  const languageChoices = usePromise(languagePromise, {})
  const back = useSafeNavigateBack()

  const { currentChoice, saveLanguageChoice } = useLanguageChoice()

  const handleOnClick = useCallback((languageCode: string) => {
    logger.debug('setting language code...', languageCode)
    saveLanguageChoice(languageCode)
    back()

  }, [saveLanguageChoice, back])


  const getLanguageChoice = (languageCode: string) => <Language
      languageCode={languageCode}
      key={languageCode}
      languageTitle={languageChoices[languageCode]}
      currentLanguageCode={currentChoice}
      onClick={handleOnClick}
    />

  return <div className="Page languages scrollbar">
    {Object.keys(languageChoices).map(l => getLanguageChoice(l))}
  </div>
}

export default Languages

