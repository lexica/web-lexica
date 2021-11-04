import { Ruleset, Rulesets, setCurrentRuleset, useRulesets, useRulesFromStorage } from "../game/rules"
import constants, { useConstants } from "../style/constants"

import './GameModes.css'
import { makeClasses } from '../util/classes'
import GameModeDetails from '../components/GameModeDetails'

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

const GameModes = (): JSX.Element => {

  const rulesets = useRulesets()
  const selectedRulesetId = useRulesFromStorage()[1]

  return <div className="Page game-modes">
    <ModesList
      rulesets={rulesets}
      selectedRulesetId={selectedRulesetId}
      handleOnClick={setCurrentRuleset}
    />
  </div>
}

export default GameModes
