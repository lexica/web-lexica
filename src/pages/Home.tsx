import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as GroupAdd } from '@material-design-icons/svg/round/group_add.svg'

import Svg from '../components/Svg'
import { Rules } from '../game/rules'
import './Home.css'
import { CurrentGameType, GameType } from '../game'

const Home = ({ setGameType }: { setGameType: (type: GameType) => void }) => {
  const ruleset = useContext(Rules)

  const gameType = useContext(CurrentGameType)

  if (gameType !== GameType.Create) setGameType(GameType.Create)

  return <div className="Page home">
    <div className="home-game-options">
      <Link to='/game-modes' className="home-game-option home-button-defaults">
        <Svg.Standard svg={EmojiEvents} title="Game Mode"/>
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
        <Svg.Standard svg={PlayCircle} title="New Game"/>
        New Game
      </Link>
      <Link
        to='/multiplayer'
        className="home-play-game-button home-button-defaults"
      >
        <Svg.Standard svg={GroupAdd} title="New Game"/>
        Multiplayer
      </Link>
    </div>

  </div>
}

export default Home
