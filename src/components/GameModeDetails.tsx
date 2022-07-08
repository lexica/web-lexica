import { ReactComponent as Timer } from '@material-design-icons/svg/round/timer.svg'
import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'
import { ReactComponent as DirectionsRun } from '@material-design-icons/svg/round/directions_run.svg'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as Sort } from '@material-design-icons/svg/round/sort.svg'
import { toMinutes } from 'duration-fns'
import { TranslationsFn } from '../translations/types'
import { Translations } from '../translations'

import Svg, { SvgComponent } from './Svg'
import { useContext } from 'react'
import { Rules, Ruleset } from '../game/rules'

import './GameModeDetails.css'

const getScoringType = (scoringType: string, translationsFn: TranslationsFn): string => ({
  'l': translationsFn('scoreDetails.letterPoints'),
  'w': translationsFn('scoreDetails.wordLength')
}[scoringType] as any)

export type GameModeDetailsProps = {
  size?: number
  color?: string,
  ruleset?: Ruleset
}

const getOverrideObject = (size?: number, color?: string) => {
  if (size === undefined && color === undefined) return {}
  return size === undefined
    ? { fill: color }
    : color === undefined
    ? { width: size, height: size }
    : { width: size, height: size, fill: color }
}

const GameModeDetails = ({
  size,
  color,
  ruleset: rulesetOverride
}: GameModeDetailsProps): JSX.Element => {
  const defaultRules = useContext(Rules)
  const rules = rulesetOverride || defaultRules

  const { translationsFn } = useContext(Translations)

  const timeAttack = rules.timeAttack !== undefined ? rules.timeAttack : 0

  const overrides = getOverrideObject(size, color)

  const getOverrides = (title: string) => ({ ...overrides, title })

  const getSvg = (svg: SvgComponent, title: string) => <Svg.Customizable svg={svg} props={getOverrides(title)}/>

  return <div style={size !== undefined ? { fontSize: size } : {}} className="game-mode-details-container">
      <div className="game-mode-details-info">
        {getSvg(Timer, 'Time')}
        <div>{translationsFn('gameModeDetails.time', { count: toMinutes(rules.time) })}</div>
      </div>
      <div className="game-mode-details-info">
        {getSvg(GridView, 'Grid-Size')}
        <div>{rules.boardWidth}x{rules.boardWidth}</div>
      </div>
      <div className="game-mode-details-info">
        {getSvg(EmojiEvents, 'scoring')}
        <div>{getScoringType(rules.score, translationsFn)}</div>
      </div>
      <div className="game-mode-details-info">
        {getSvg(Sort, 'Minimum Word Length')}
        <div className='game-mode-details-min-word-length'>
          &ge;{rules.minimumWordLength}
        </div>
      </div>
      {timeAttack > 0
        ? <div className="game-mode-details-info">
          {getSvg(DirectionsRun, 'Time Attack')}
          <div>x{timeAttack}</div>
        </div>
        : ''
      }
    </div>
}

export default GameModeDetails
