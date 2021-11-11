import { useCallback, useReducer } from 'react'
import { ReactComponent as DirectionsRun } from '@material-design-icons/svg/round/directions_run.svg'
import { ReactComponent as CheckBox } from '@material-design-icons/svg/round/check_box.svg'
import { ReactComponent as CheckBoxOutlineBlank } from '@material-design-icons/svg/round/check_box_outline_blank.svg'

import Description from './Description'
import Svg from '../Svg'


const TimeAttack = ({ handleTimeAttackToggle }: { handleTimeAttackToggle: () => void }): JSX.Element => {
  const [timeAttack, dispatchTimeAttack] = useReducer((state: boolean) => !state, false)
  const handleOnClick = useCallback(() => {
    dispatchTimeAttack()
    handleTimeAttackToggle()
  }, [handleTimeAttackToggle, dispatchTimeAttack])

  const checkBoxSvg = timeAttack ? CheckBox : CheckBoxOutlineBlank
  return <Description
    svg={DirectionsRun}
    title="Time Attack"
  >
    <div
      onClick={handleOnClick}
      className="new-game-mode-time-attack-check-box"
    >
      <Svg.Standard svg={checkBoxSvg} title="Time Attack"/>
      <div>Race against the clock, gaining more time with each word found</div>
    </div>
    {/* <input type="checkbox" name="time-attack" checked={timeAttack} onChange={handleOnClick}/> */}
  </Description>
}

export default TimeAttack
