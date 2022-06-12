import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as GroupAdd } from '@material-design-icons/svg/round/group_add.svg'
import { ReactComponent as Grid } from '@material-design-icons/svg/round/grid_on.svg'
import { ReactComponent as Language } from '@material-design-icons/svg/round/language.svg'
import { ReactComponent as Redo } from '@material-design-icons/svg/round/redo.svg'

import { useRulesFromStorage } from '../game/rules'
import './Home.css'
import { useLanguageCodeFromLocalStorage } from '../game/language'
import { Translation } from '../translations/implemented-languages'
import { useTranslations } from '../translations'
import { useHighScore } from '../game/high-scores'
import { useSavedGameList } from '../game/save-game'
import MainTitle from '../components/MainTitle'
import Button, { ButtonFontSizing } from '../components/Button'

const GameSettings = (): JSX.Element => {
  const [ruleset] = useRulesFromStorage()

  const languageCode = useLanguageCodeFromLocalStorage() as any as keyof Translation['languageTitles']

  const { languageTitles } = useTranslations()

  const languageTitle = languageTitles[languageCode] || languageCode

  return <div className="home-game-options">
    <Button to='/lexicons' svg={Language} svgTitle={'Lexicon'} prompt={languageTitle} />
    <Button to='/game-modes' svg={EmojiEvents} svgTitle="Game Mode" prompt={ruleset.name} />
  </div>

}

const PlayGameButtons = (): JSX.Element => {
  const savedGames = useSavedGameList()
  const fontSizing = ButtonFontSizing.Title

  const resumeGame = <Button to="/saved-games" fontSizing={fontSizing} svg={Redo} prompt='Resume Game'/>

  return <div className="home-game-buttons">
    <Button to='/singleplayer' svg={PlayCircle} fontSizing={fontSizing} prompt='New Game' />
    <Button to='/multiplayer' svg={GroupAdd} fontSizing={fontSizing} prompt='Multiplayer' />
    <Button
      to='/lexicle'
      svg={Grid}
      svgTitle='Lexicle'
      fontSizing={fontSizing}
      prompt='Try Lexicle'
    />
    { savedGames?.length > 0 ? resumeGame : ''}
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

const Home = () => {
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
