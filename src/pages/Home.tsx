import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Rules } from '../game/rules'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as GroupAdd } from '@material-design-icons/svg/round/group_add.svg'
import './Home.css'
import constants, { useConstants } from '../style/constants'

type StandardSvgProps = {
  title: string,
  width: number,
  height: number,
  fill: string
}

const StandardSvg: React.FC<{
  svg: (props: StandardSvgProps) => JSX.Element
  title: string
}> = ({ svg, title }) => {
  const { fontSize } = useConstants()
  return <>{svg({
    title,
    fill: constants.colorContentDark,
    width: fontSize,
    height: fontSize
  })}</>
}

const Home: React.FC = () => {
  const ruleset = useContext(Rules)

  return <div className="Page home">
    <div className="home-game-options">
      <Link to='/game-modes' className="home-game-option home-button-defaults">
        <StandardSvg svg={props => <EmojiEvents {...props}/>} title="Game Mode"/>
        <div>{ruleset.name}</div>
      </Link>
    </div>

    {/* <div className="home-title">Web Lexica</div> */}
    <div className="home-title">
      <div className="home-title-letters">
        {'LEXICA'.split('').map(l => <div className="home-title-letter">{l}</div>)}
      </div>
      <div className="home-sub-title">online</div>
    </div>

    <div className="home-game-buttons">
      <Link
        to='/singleplayer'
        className="home-play-game-button home-button-defaults"
      >
        <StandardSvg svg={props => <PlayCircle {...props} />} title="New Game"/>
        New Game
      </Link>
      <Link
        to='/new-multiplayer'
        className="home-play-game-button home-button-defaults"
      >
        <StandardSvg svg={props => <GroupAdd {...props} />} title="New Game"/>
        Multiplayer
      </Link>
    </div>

  </div>
}

export default Home
