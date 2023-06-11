import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as GroupAdd } from '@material-design-icons/svg/round/group_add.svg'
import { ReactComponent as Grid } from '@material-design-icons/svg/round/grid_on.svg'
import { ReactComponent as Settings } from '@material-design-icons/svg/round/settings.svg'
import { ReactComponent as Redo } from '@material-design-icons/svg/round/redo.svg'

import { useRulesFromStorage } from '../game/rules'
import './Home.css'
import { Translations } from '../translations'
import { useHighScore } from '../game/high-scores'
import { useSavedGameList } from '../game/save-game'
import MainTitle from '../components/MainTitle'
import Button, { ButtonFontSizing } from '../components/Button'
import { useContext } from 'react'

const GameSettings = (): JSX.Element => {
  const [ruleset] = useRulesFromStorage()

  const translations = useContext(Translations)

  const preferences = translations.translationsFn('pages.home.preferences')

  return <div className="home-game-options">
    <Button to='/preferences' svg={Settings} svgTitle={'Preferences'} prompt={preferences} />
    <Button to='/game-modes' svg={EmojiEvents} svgTitle="Game Mode" prompt={ruleset.name} />
  </div>

}

const PlayGameButtons = (): JSX.Element => {
  const savedGames = useSavedGameList()
  const fontSizing = ButtonFontSizing.Title

  const { translationsFn } = useContext(Translations)

  const resumeGame = <Button
    to="/saved-games"
    fontSizing={fontSizing}
    svg={Redo}
    prompt={translationsFn('pages.home.resumeGame')}
    svgToSide
  />

  return <div className="home-game-buttons">
    <Button to='/singleplayer' svg={PlayCircle} fontSizing={fontSizing} prompt={translationsFn('pages.home.newGame')} svgToSide />
    <Button to='/multiplayer' svg={GroupAdd} fontSizing={fontSizing} prompt={translationsFn('pages.home.multiplayer')} svgToSide />
    <Button
      to='/lexicle'
      svg={Grid}
      fontSizing={fontSizing}
      prompt={translationsFn('pages.home.tryLexicle')}
      svgToSide
    />
    { savedGames?.length > 0 ? resumeGame : ''}
  </div>
}

const HighScore = (): JSX.Element => {
  const [{ name }, currentId] = useRulesFromStorage()
  const { translationsFn } = useContext(Translations)

  const score = useHighScore(currentId)
  return <div className="home-high-score">
    <div>{translationsFn('pages.home.gameMode', { gameMode: name })}</div>
    <div>{translationsFn('pages.home.highScore', { score })}</div>
  </div>
}

const Home = () => {
  const { translationsFn } = useContext(Translations)
  return <div className="Page home">
    <HighScore />
    <MainTitle title={translationsFn('pages.home.headlineTitle')} subtitle={translationsFn('pages.home.subtitle')} />
    <div className="home-buttons-container">
      <PlayGameButtons />
      <GameSettings />
    </div>
  </div>
}

export default Home
