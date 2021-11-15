import { useCallback, useState } from 'react'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'

import { getClass } from './util'
import { ScoreType } from '../../game/score'

import Description from './Description'
import Radio from '../Radio'

const {
  optionClass
} = getClass

const isScoreType = (type: any): type is ScoreType => [ScoreType.Letters, ScoreType.Length].includes(type)

const ScoringType = ({ handleScoreUpdate, scoreTypes }: { handleScoreUpdate: (type: ScoreType) => void, scoreTypes: ScoreType[] }): JSX.Element => {
  const [scoreType, setScoreType] = useState<ScoreType>('' as any)
  const title = 'Score Type'

  const handleChange = useCallback((value: string) => {
    if (!isScoreType(value)) return
    setScoreType(value)
    handleScoreUpdate(value)
  }, [handleScoreUpdate, setScoreType])

  return <Description title={title} svg={EmojiEvents}>
    <div>
      {scoreTypes.map(type => {
        const title = {
          [ScoreType.Letters]: 'Letter Points',
          [ScoreType.Length]: 'Word Length'
        }[type]

        return <div className={optionClass('score-type')}>
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
