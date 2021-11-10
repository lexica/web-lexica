import { ChangeEvent, useCallback, useState } from 'react'
import { ReactComponent as Schedule } from '@material-design-icons/svg/round/schedule.svg'

import Description from './Description'

const TimeLimit = ({ handleTimeUpdate }: { handleTimeUpdate: (time: number) => void }) => {
  const [rawTimeLimit, setRawTimeLimit] = useState('')
  const title = 'Time Limit'
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
          about="Time limit in minutes"
          onChange={handleTimeLimitChange}
          value={rawTimeLimit}
          step="1"
          min="1"
      />
      <div className="new-game-mode-time-limit-description">
        Time limit in minutes
      </div>
    </div>
  </Description>
}

export default TimeLimit
