import { useCallback, useState } from 'react'
import { ReactComponent as DirectionsRun } from '@material-design-icons/svg/round/directions_run.svg'

import Description from './Description'
import Radio from '../Radio'

export type TimeAttackProps = {
  handleTimeAttackUpdate: (multiplier: number) => void
  timeAttackMultipliers: number[],
  selectedMultiplier: number
}

const getMultiplierName = (multiplier: number) => {
  if (multiplier === 0) return 'Off'

  return `x${multiplier}`
}

const TimeAttack = ({
  handleTimeAttackUpdate,
  timeAttackMultipliers,
  selectedMultiplier
}: TimeAttackProps): JSX.Element => {
  const [multiplier, setMultiplier] = useState(0)

  const handleMultiplierUpdate = useCallback((multiplier: number) => {
    setMultiplier(multiplier)
    handleTimeAttackUpdate(multiplier)
  }, [setMultiplier, handleTimeAttackUpdate])

  return <Description
    svg={DirectionsRun}
    title="Time Attack"
  >
    <div className="new-game-mode-time-attack-input-holder">
      <div className="new-game-mode-time-attack-options">
        Multipliers: 
        {timeAttackMultipliers.map(m => <Radio
          checked={m===multiplier}
          group="time-attack-multipliers"
          onChange={() => handleMultiplierUpdate(m)}
          title={getMultiplierName(m)}
          value={m}
          key={m}
        />)}
      </div>
      <div className="new-game-mode-time-attack-example">
        Adds (Word Length score x {multiplier}) second(s) per word found
      </div>
    </div>
    {/* <input type="checkbox" name="time-attack" checked={timeAttack} onChange={handleOnClick}/> */}
  </Description>
}

export default TimeAttack
