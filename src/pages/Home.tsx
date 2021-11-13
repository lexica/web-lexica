import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as GroupAdd } from '@material-design-icons/svg/round/group_add.svg'
import { ReactComponent as Language } from '@material-design-icons/svg/round/language.svg'

import Svg from '../components/Svg'
import { Rules } from '../game/rules'
import './Home.css'
import { CurrentGameType, GameType } from '../game'
import { useLanguageCodeFromLocalStorage } from '../game/language'
import { Translation } from '../translations/implemented-languages'
import { useTranslations } from '../translations'
import { makeClasses } from '../util/classes'

const GameSettings = (): JSX.Element => {
  const classes = makeClasses('home-game-option', 'home-button-defaults')

  const ruleset = useContext(Rules)

  const languageCode = useLanguageCodeFromLocalStorage() as any as keyof Translation['languageTitles']

  const { languageTitles } = useTranslations()

  const languageTitle = languageTitles[languageCode] || languageCode

  return <div className="home-game-options">
    <Link to='/lexicons' className={classes}>
      <Svg.Standard svg={Language} title="Lexicon" />
      <div>{languageTitle}</div>
    </Link>
    <Link to='/game-modes' className={classes}>
      <Svg.Standard svg={EmojiEvents} title="Game Mode"/>
      <div>{ruleset.name}</div>
    </Link>
  </div>

}

const Title = (): JSX.Element => {
  return <div className="home-title">
    <div className="home-title-letters">
      {'LEXICA'.split('').map(l => <div className="home-title-letter">{l}</div>)}
    </div>
    <div className="home-sub-title">online</div>
  </div>
}

const PlayGameButtons = (): JSX.Element => {
  const classes = makeClasses('home-button-defaults', 'home-play-game-button')

  return <div className="home-game-buttons">
    <Link
      to='/singleplayer'
      className={classes}
    >
      <Svg.Standard svg={PlayCircle} title="New Game"/>
      New Game
    </Link>
    <Link
      to='/multiplayer'
      className={classes}
    >
      <Svg.Standard svg={GroupAdd} title="New Game"/>
      Multiplayer
    </Link>
  </div>
}

const Home = ({ setGameType }: { setGameType: (type: GameType) => void }) => {

  const gameType = useContext(CurrentGameType)

  if (gameType !== GameType.Create) setGameType(GameType.Create)

  return <div className="Page home">
    <Title />
    <div className="home-buttons-container">
      <GameSettings />
      <PlayGameButtons />
    </div>
  </div>
}

export default Home
