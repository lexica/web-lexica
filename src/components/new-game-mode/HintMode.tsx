import { useContext } from 'react'
import MedicalServices from '@material-design-icons/svg/round/medical_services.svg'
import Unchecked from '@material-design-icons/svg/round/check_box_outline_blank.svg'
import Checked from '@material-design-icons/svg/round/check_box.svg'

import Description from './Description'
import Button from '../Button'
import { Translations } from '../../translations'

export type HintModeProps = {
  handleHintModeUpdate: (hints: boolean) => void
  hintStatus: boolean
}


const HintMode = ({
  handleHintModeUpdate,
  hintStatus,
}: HintModeProps): JSX.Element => {
  const { translationsFn } = useContext(Translations)


  return <Description
    svg={MedicalServices}
    title={translationsFn('pages.newGameMode.hints.hintMode')}
  >
    <div className="new-game-mode-hint-mode-input-holder">
        <Button
          svg={hintStatus ? Checked : Unchecked}
          onClick={() => handleHintModeUpdate(!hintStatus)}
          prompt={translationsFn('pages.newGameMode.hints.hintDesc')}
          themeType='alternative-standard'
        />
    </div>
    {/* <input type="checkbox" name="time-attack" checked={timeAttack} onChange={handleOnClick}/> */}
  </Description>
}

export default HintMode
