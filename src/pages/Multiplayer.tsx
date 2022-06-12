import { useState } from 'react'
import GameScreen from './GameScreen'

const Multiplayer = (): JSX.Element => {
  const search = useState(window.location.search)[0]
  const isNewGame = search === ''

  return <GameScreen isMultiplayer isNewGame={isNewGame} />
}

export default Multiplayer
