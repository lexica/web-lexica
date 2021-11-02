import { ReactComponent as Timer } from '@material-design-icons/svg/round/timer.svg'
import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as Sort } from '@material-design-icons/svg/round/sort.svg'
import Svg from "../components/Svg"
import { Ruleset, Rulesets, setCurrentRuleset, useRulesets, useRulesFromStorage } from "../game/rules"
import constants, { useConstants } from "../style/constants"
import { toMinutes } from 'duration-fns'

import './GameModes.css'
import { ScoreType } from '../game/score'
import { makeClasses } from '../util/classes'

type ModeProps = {
  rulesetTuple: [string, Ruleset]
  handleOnClick: (id: string) =>  void,
  isSelected: boolean
}
type ModeDetailsProps = { rulesetTuple: [string, Ruleset] }

const ModeDetails = ({ rulesetTuple }: ModeDetailsProps): JSX.Element => {

  const ruleset = rulesetTuple[1]

  const {
    boardWidth,
    minimumWordLength,
    score,
    time
  } = ruleset

  const { fontSizeSubscript } = useConstants()

  const getProps = (title: string) => ({
    height: fontSizeSubscript,
    width: fontSizeSubscript,
    fill: constants.colorBackgroundDark,
    title
  })

  const getSvg = (svg: typeof Timer, title: string) => <Svg.Customizable svg={svg} props={getProps(title)}/>

  const scoreTitle = { [ScoreType.Letters]: 'Letter Points', [ScoreType.Words]: 'Word Length' }[score]

  const minutes = toMinutes(time)

  return <div className="game-modes-details">
    <div className="game-modes-detail-item">
      {getSvg(Timer, 'Total time')}
      {minutes} {minutes === 1 ? 'min' : 'mins'}
    </div>
    <div className="game-modes-detail-item">
      {getSvg(GridView, 'Board size')}
      {boardWidth}x{boardWidth}
      </div>
    <div className="game-modes-detail-item">
      {getSvg(EmojiEvents, 'Score type')}
      {scoreTitle}
    </div>
    <div className="game-modes-detail-item">
      {getSvg(Sort, 'Minimum word length')}
      ≥{minimumWordLength}
    </div>
  </div>
}

const Mode = ({
  rulesetTuple,
  handleOnClick,
  isSelected
}: ModeProps): JSX.Element => {

  const [id, ruleset] = rulesetTuple

  const classNames = makeClasses(
    'game-modes-ruleset',
    { condition: isSelected, name: 'game-modes-ruleset-selected' }
  )

  return <div
    className={classNames}
    onClick={() => handleOnClick(id)}
  >
    <div>
      {ruleset.name}
    </div>
    {isSelected ? <ModeDetails rulesetTuple={rulesetTuple} /> : ''}
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
