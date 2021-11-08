import { useContext, useEffect } from 'react'
import { ReactComponent as Add } from '@material-design-icons/svg/round/add.svg'

import { Ruleset, Rulesets, setCurrentRuleset, useRulesets, useRulesFromStorage } from '../game/rules'
import GameModeDetails from '../components/GameModeDetails'
import Svg from "../components/Svg"
import constants, { useConstants } from "../style/constants"
import { makeClasses } from '../util/classes'

import './GameModes.css'
import { Renderable, RenderInBanner } from '../components/Banner'
import { Link } from 'react-router-dom'
import { logger } from '../util/logger'

type ModeProps = {
  rulesetTuple: [string, Ruleset]
  handleOnClick: (id: string) =>  void,
  isSelected: boolean
}

const Mode = ({
  rulesetTuple,
  handleOnClick,
  isSelected
}: ModeProps): JSX.Element => {

  const [id, ruleset] = rulesetTuple

  const { fontSizeSubscript } = useConstants()

  const classNames = makeClasses(
    'game-modes-ruleset',
    { condition: isSelected, name: 'game-modes-ruleset-selected' }
  )

  return <div
    className={classNames}
    onClick={() => handleOnClick(id)}
  >
    <div className="game-mode-ruleset-name">
      {ruleset.name}
    </div>
    {isSelected ? <GameModeDetails
      ruleset={rulesetTuple[1]}
      size={fontSizeSubscript}
      color={constants.colorContentDark}
      /> : ''}
  </div>
}

type ModesListProps = {
  rulesets: Rulesets,
  selectedRulesetId: string
  handleOnClick: (id: string) => void
}

const ModesList = ({
  rulesets: rulesetsObject,
  selectedRulesetId,
  handleOnClick
}: ModesListProps): JSX.Element => {
  const rulesets = Object.entries(rulesetsObject)

  logger.debug(rulesets)

  const getMode = (ruleset: typeof rulesets[number]) => <Mode
    rulesetTuple={ruleset}
    isSelected={ruleset[0] === selectedRulesetId}
    key={ruleset[0]}
    handleOnClick={handleOnClick}
  />

  return <div className="game-modes-ruleset-list">
    {rulesets.map(getMode)}
  </div>
}

const shouldAddPropmt = (height: number, width: number) => {
  return width / height > 6.5
}

const AddGameMode: Renderable = ({ maxHeight, maxWidth }) => <Link
  className="game-modes-add-game-mode-button"
  style={{
    height: maxHeight,
    maxHeight: maxHeight,
    paddingRight: shouldAddPropmt(maxHeight, maxWidth) ? '0.5vh' : 0,
    borderRadius: maxHeight / 2,
  }}
  to="/new-game-mode"
>
  <Svg.Customizable
    svg={Add}
    props={{
      title: 'Add new game mode',
      width: maxHeight - 1,
      height: maxHeight - 1
    }}
  />
  {shouldAddPropmt(maxHeight, maxWidth) ? <div className="game-modes-add-game-mode-prompt">
    Add game mode
  </div> : ''}
</Link>


const GameModes = (): JSX.Element => {

  const rulesets = useRulesets()
  const selectedRulesetId = useRulesFromStorage()[1]

  const renderInBanner = useContext(RenderInBanner)

  useEffect(() => {
    const { setElement, cleanUp } = renderInBanner

    setElement(AddGameMode)

    return cleanUp
  }, [renderInBanner])

  return <div className="Page game-modes">
    <ModesList
      rulesets={rulesets}
      selectedRulesetId={selectedRulesetId}
      handleOnClick={setCurrentRuleset}
    />
  </div>
}

export default GameModes
