import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as GroupAdd } from '@material-design-icons/svg/round/group_add.svg'
import { ReactComponent as Grid } from '@material-design-icons/svg/round/grid_on.svg'
import { ReactComponent as Language } from '@material-design-icons/svg/round/language.svg'
import { ReactComponent as Redo } from '@material-design-icons/svg/round/redo.svg'

import Svg from '../components/Svg'
import { Rules, useRulesFromStorage } from '../game/rules'
import './Home.css'
import { CurrentGameType, GameType } from '../game'
import { useLanguageCodeFromLocalStorage } from '../game/language'
import { Translation } from '../translations/implemented-languages'
import { useTranslations } from '../translations'
import { makeClasses } from '../util/classes'
import { useHighScore } from '../game/high-scores'
import { useConstants } from '../style/constants'
import { useSavedGameList } from '../game/save-game'
import MainTitle from '../components/MainTitle'

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

const ResumeGameButton = (): JSX.Element => {
  const savedGames = useSavedGameList()
  const { fontSizeTitle } = useConstants()
  // const savedGames = []

  if (savedGames.length === 0) return <></>

  return <Link className='home-button-defaults home-play-game-button' to="/saved-games">
    <Svg.Customizable svg={Redo} props={{
      title: 'Resume Game',
        height: fontSizeTitle,
        width: fontSizeTitle
    }}/>
    Resume Game
  </Link>
}

const PlayGameButtons = (): JSX.Element => {
  const { fontSizeTitle } = useConstants()
  const classes = makeClasses('home-button-defaults', 'home-play-game-button')

  return <div className="home-game-buttons">
    <Link
      to='/singleplayer'
      className={classes}
    >
      <Svg.Customizable svg={PlayCircle} props={{
        title: 'New Game',
        height: fontSizeTitle,
        width: fontSizeTitle
      }}/>
      New Game
    </Link>
    <Link
      to='/multiplayer'
      className={classes}
    >
      <Svg.Customizable svg={GroupAdd} props={{
        title: 'New Game',
        height: fontSizeTitle,
        width: fontSizeTitle,
      }}/>
      Multiplayer
    </Link>
    <Link
      to='/lexicle'
      className={classes}
    >
      <Svg.Customizable svg={Grid} props={{
        title: 'Lexicle',
        height: fontSizeTitle,
        width: fontSizeTitle
      }}/>
      Try Lexicle
    </Link>
    <ResumeGameButton/>
  </div>
}

const HighScore = (): JSX.Element => {
  const [{ name }, currentId] = useRulesFromStorage()
  const highScore = useHighScore(currentId)
  return <div className="home-high-score">
    <div>Mode: {name}</div>
    <div>High Score: {highScore}</div>
  </div>
}

const Home = ({ setGameType }: { setGameType: (type: GameType) => void }) => {

  const gameType = useContext(CurrentGameType)

  if (gameType !== GameType.Create) setGameType(GameType.Create)

  return <div className="Page home">
    <HighScore />
    <MainTitle title='lexica' subtitle='online' />
    <div className="home-buttons-container">
      <PlayGameButtons />
      <GameSettings />
    </div>
  </div>
}

export default Home
