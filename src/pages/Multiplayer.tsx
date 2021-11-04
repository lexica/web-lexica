import { useContext } from 'react'
import { CurrentGameType, GameType } from '../game'
import GameScreen from './GameScreen'

const Multiplayer = (): JSX.Element => {
  const gameType = useContext(CurrentGameType)

  return <GameScreen isMultiplayer isNewGame={gameType === GameType.Create} />
}

export default Multiplayer
