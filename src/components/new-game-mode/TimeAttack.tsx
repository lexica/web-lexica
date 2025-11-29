import { useCallback, useContext, useState } from 'react'
import DirectionsRun from '@material-design-icons/svg/round/directions_run.svg'

import Description from './Description'
import Radio from '../Radio'
import { Translations } from '../../translations'

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
}: TimeAttackProps): JSX.Element => {
  const [multiplier, setMultiplier] = useState(0)
  const { translationsFn } = useContext(Translations)

  const handleMultiplierUpdate = useCallback((multiplier: number) => {
    setMultiplier(multiplier)
    handleTimeAttackUpdate(multiplier)
  }, [setMultiplier, handleTimeAttackUpdate])

  return <Description
    svg={DirectionsRun}
    title={translationsFn('pages.newGameMode.timeAttack.title')}
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
        {translationsFn('pages.newGameMode.timeAttack.hint', { multiplier })}
      </div>
    </div>
    {/* <input type="checkbox" name="time-attack" checked={timeAttack} onChange={handleOnClick}/> */}
  </Description>
}

export default TimeAttack
