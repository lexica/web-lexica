import { ChangeEvent, useCallback, useState } from 'react'
import { ReactComponent as Schedule } from '@material-design-icons/svg/round/schedule.svg'

import Description from './Description'

const TimeLimit = ({ handleTimeUpdate }: { handleTimeUpdate: (time: number) => void }) => {
  const [rawTimeLimit, setRawTimeLimit] = useState('')
  const title = 'Time Limit'
  const handleTimeLimitChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRawTimeLimit(e?.target?.value)
    const time = parseInt(e?.target?.value)
    if (Number.isNaN(time)) return

    handleTimeUpdate(time)
  }, [setRawTimeLimit, handleTimeUpdate])

  return <Description {...{ title, svg: Schedule }} >
    <input
        type="text"
        className="new-game-mode-text-input new-game-mode-time-limit-text-input"
        about="Time limit in minutes"
        onChange={handleTimeLimitChange}
        value={rawTimeLimit}
    />
  </Description>
}

export default TimeLimit
