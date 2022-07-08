import { useCallback, useContext } from 'react'
import { ReactComponent as Add } from '@material-design-icons/svg/round/add.svg'

import { Ruleset, Rulesets, setCurrentRuleset, useRulesets, useRulesFromStorage } from '../game/rules'
import GameModeDetails from '../components/GameModeDetails'
import constants, { useConstants } from "../style/constants"
import { makeClasses } from '../util/classes'
import { useBannerBadge } from '../components/Banner'
import { useNavigate } from 'react-router-dom'
import { logger } from '../util/logger'

import './GameModes.css'
import { Translations } from '../translations'

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

const GameModes = (): JSX.Element => {
  const { translationsFn } = useContext(Translations)

  const rulesets = useRulesets()
  const selectedRulesetId = useRulesFromStorage()[1]
  const navigate = useNavigate()

  const handleAddGameModeOnClick = useCallback(() => navigate('/new-game-mode'), [navigate])

  useBannerBadge({
    svgTitle: translationsFn('pages.gameModes.addGameMode'),
    svg: Add,
    onClick: handleAddGameModeOnClick,
    prompt: translationsFn('pages.gameModes.addGameMode')
  })


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
