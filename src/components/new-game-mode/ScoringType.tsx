import { useCallback, useContext, useState } from 'react'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'

import { getClass } from './util'
import { ScoreType } from '../../game/score'

import Description from './Description'
import Radio from '../Radio'
import { Translations } from '../../translations'

const {
  optionClass
} = getClass

const isScoreType = (type: any): type is ScoreType => [ScoreType.Letters, ScoreType.Length].includes(type)

const ScoringType = ({ handleScoreUpdate, scoreTypes }: { handleScoreUpdate: (type: ScoreType) => void, scoreTypes: ScoreType[] }): JSX.Element => {
  const [scoreType, setScoreType] = useState<ScoreType>('' as any)
  const { translationsFn } = useContext(Translations)
  const title = translationsFn('pages.newGameMode.scoreType.title')

  const handleChange = useCallback((value: string) => {
    if (!isScoreType(value)) return
    setScoreType(value)
    handleScoreUpdate(value)
  }, [handleScoreUpdate, setScoreType])

  return <Description title={title} svg={EmojiEvents}>
    <div>
      {scoreTypes.map((type, index) => {
        const title = {
          [ScoreType.Letters]: translationsFn('pages.newGameMode.scoreType.letterPoints'),
          [ScoreType.Length]: translationsFn('pages.newGameMode.scoreType.wordLength')
        }[type]

        return <div
          className={optionClass('score-type')}
          key={`scoring-type-${index}`}
        >
          <Radio
            group="score-type"
            value={type}
            id={type}
            title={title}
            onChange={handleChange}
            checked={scoreType===type}
          />
        </div>
      }) }
    </div>
  </Description>
}

export default ScoringType
