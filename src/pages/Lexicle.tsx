import {ReactComponent as Calendar } from '@material-design-icons/svg/round/calendar_today.svg'
import {ReactComponent as Shuffle } from '@material-design-icons/svg/round/shuffle.svg'
import { useState, useCallback } from 'react'
import MainTitle from '../components/MainTitle'
import Svg from '../components/Svg'
import { useConstants } from '../style/constants'
import { makeClasses } from '../util/classes'

import './Lexicle.css'
import LexicleGameScreen from './LexicleGameScreen'

enum GameType {
  WordOfTheDay = 'word-of-the-day',
  Random = 'random'
}

const ChooseGameMode = ({ handleOnClick }: { handleOnClick: (type: GameType) => void}): JSX.Element => {
  const { fontSizeTitle } = useConstants()
  const classes = makeClasses('lexicle-button-defaults', 'lexicle-play-game-button')

  return <div className='lexicle-choose-game-mode'>
    <div className='lexicle-title'>
      <MainTitle title='lexicle'/>
    </div>
    <div className="lexicle-game-buttons">
        <div
          className={classes}
          onClick={() => handleOnClick(GameType.WordOfTheDay)}
        >
          <Svg.Customizable svg={Calendar} props={{
            title: 'Word of the Day',
            height: fontSizeTitle,
            width: fontSizeTitle
          }}/>
          Word of the Day
        </div>
        <div
          className={classes}
          onClick={() => handleOnClick(GameType.Random)}
        >
          <Svg.Customizable svg={Shuffle} props={{
            title: 'Random',
            height: fontSizeTitle,
            width: fontSizeTitle,
          }}/>
          Random
        </div>
      </div>
    </div>
}

enum GameStatus {
  Choosing = 'choosing',
  Playing = 'playing'
}
const Lexicle = (): JSX.Element => {
  const [gameStatus, setGameStatus] = useState(GameStatus.Choosing)
  const [gameType, setGameType] = useState(GameType.Random)

  const handleClick = useCallback((type: GameType) => {
    setGameType(type)
    setGameStatus(GameStatus.Playing)
  }, [setGameStatus, setGameType])

  return <>
    {
      gameStatus === GameStatus.Choosing
        ? <ChooseGameMode handleOnClick={handleClick}/>
        : <LexicleGameScreen wordOfTheDay={gameType === GameType.WordOfTheDay}/>
    }
  </>
}

export default Lexicle
