import { ReactComponent as Timer } from '@material-design-icons/svg/round/timer.svg'
import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as Sort } from '@material-design-icons/svg/round/sort.svg'
import { Duration, normalize } from 'duration-fns'

import Svg, { SvgComponent } from './Svg'
import { useContext } from 'react'
import { Rules } from '../game/rules'

import './GameModeDetails.css'

const getScoringType = (scoringType: string): string => ({
  'l': 'Letter Points',
  'w': 'Word Length'
}[scoringType] as any)

const getReadableTime = (time: Duration) => {
  const { minutes = 0 } = normalize(time)
  if (minutes === 1) return '1 min'
  return `${minutes} mins`
}

export type GameModeDetailsProps = {
  svgSize?: number
  color?: string,
}

const getOverrideObject = (svgSize?: number, color?: string) => {
  if (svgSize === undefined && color === undefined) return {}
  return svgSize === undefined
    ? { fill: color }
    : color === undefined
    ? { width: svgSize, height: svgSize }
    : { width: svgSize, height: svgSize, fill: color }
}

const GameModeDetails = ({
  svgSize,
  color,
}: GameModeDetailsProps): JSX.Element => {
  const rules = useContext(Rules)

  const overrides = getOverrideObject(svgSize, color)

  const getOverrides = (title: string) => ({ ...overrides, title })

  const getSvg = (svg: SvgComponent, title: string) => <Svg.Customizable svg={svg} props={getOverrides(title)}/>

  return <div className="game-mode-details-container">
      <div className="game-mode-details-info">
        {getSvg(Timer, 'Time')}
        <div>{getReadableTime(rules.time)}</div>
      </div>
      <div className="game-mode-details-info">
        {getSvg(GridView, 'Grid-Size')}
        <div>{rules.boardWidth}x{rules.boardWidth}</div>
      </div>
      <div className="game-mode-details-info">
        {getSvg(EmojiEvents, 'scoring')}
        <div>{getScoringType(rules.score)}</div>
      </div>
      <div className="game-mode-details-info">
        {getSvg(Sort, 'Minimum Word Length')}
        <div>&ge; {rules.minimumWordLength}</div>
      </div>
    </div>
}

export default GameModeDetails
