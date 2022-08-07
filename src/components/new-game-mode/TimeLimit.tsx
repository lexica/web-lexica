import { ChangeEvent, useCallback, useContext, useState } from 'react'
import { ReactComponent as Schedule } from '@material-design-icons/svg/round/schedule.svg'

import Description from './Description'
import { Translations } from '../../translations'

const TimeLimit = ({ handleTimeUpdate }: { handleTimeUpdate: (time: number) => void }) => {
  const [rawTimeLimit, setRawTimeLimit] = useState('')
  const { translationsFn } = useContext(Translations)

  const title = translationsFn('pages.newGameMode.timeLimit.title')
  const handleTimeLimitChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRawTimeLimit(e?.target?.value)
    const time = parseInt(e?.target?.value)

    handleTimeUpdate(Number.isNaN(time) ? 0 : time)
  }, [setRawTimeLimit, handleTimeUpdate])

  return <Description {...{ title, svg: Schedule }} >
    <div>
      <input
          type="number"
          className="new-game-mode-text-input new-game-mode-time-limit-text-input"
          about={translationsFn('pages.newGameMode.timeLimit.description')}
          onChange={handleTimeLimitChange}
          value={rawTimeLimit}
          step="1"
          min="1"
      />
      <div className="new-game-mode-time-limit-description">
        {translationsFn('pages.newGameMode.timeLimit.description')}
      </div>
    </div>
  </Description>
}

export default TimeLimit
