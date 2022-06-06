import { ReactComponent as Add } from '@material-design-icons/svg/round/add.svg'

import { Ruleset, Rulesets, setCurrentRuleset, useRulesets, useRulesFromStorage } from '../game/rules'
import GameModeDetails from '../components/GameModeDetails'
import Svg from "../components/Svg"
import constants, { useConstants } from "../style/constants"
import { makeClasses } from '../util/classes'

import './GameModes.css'
import { Renderable, useRenderInBanner } from '../components/Banner'
import { Link, useNavigate } from 'react-router-dom'
import { logger } from '../util/logger'
import { useCallback } from 'react'

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

const shouldAddPrompt = (height: number, width: number) => {
  return width / height > 6.75
}

const AddGameMode: Renderable = ({ maxHeight, maxWidth }) => <Link
  className={makeClasses(
    'game-modes-add-game-mode-button',
    'banner-rendered-prop-container'
  )}
  style={{
    height: maxHeight,
    maxHeight: maxHeight,
  }}
  to="/new-game-mode"
>
  <Svg.Customizable
    svg={Add}
    props={{
      title: 'Add new game mode',
      width: maxHeight,
      height: maxHeight
    }}
  />
  {shouldAddPrompt(maxHeight, maxWidth) ? <div
    className={makeClasses(
      'game-modes-add-game-mode-prompt',
      'banner-rendered-prop-label'
      )}
  >
    Add Game Mode
  </div> : ''}
</Link>


const GameModes = (): JSX.Element => {

  const rulesets = useRulesets()
  const selectedRulesetId = useRulesFromStorage()[1]

  useRenderInBanner(AddGameMode)

  const navigate = useNavigate()

  const handleOnClick = useCallback((id: string) => {
    if (id === selectedRulesetId) {
      navigate('/')
      return
    }

    setCurrentRuleset(id)
  }, [selectedRulesetId, navigate])

  return <div className="Page game-modes">
    <ModesList
      rulesets={rulesets}
      selectedRulesetId={selectedRulesetId}
      handleOnClick={handleOnClick}
    />
  </div>
}

export default GameModes
