import { type ReactNode, useCallback, useMemo, useState } from 'react'
import Board from '../../components/game/Board'
import Results from '../../components/game/lexicle/Results'
import Score from '../../components/game/lexicle/Score'
import GameSetup from './GameSetup'
import { WithWordleWords, WithLexicaWords } from './GameProviders'

import './Game.css'

export const GameBoard = (): JSX.Element => <>
  <Board/>
  <div className='lexicle-score-container scrollbar'>
    <Score/>
  </div>
</>

type SetupProps = {
  children: ReactNode,
  wordOfTheDay: boolean,
  onGameFinish: () => void 
}

const NormalSetup = ({ children, wordOfTheDay, onGameFinish }: SetupProps) => <WithLexicaWords>
  <GameSetup {...{ wordOfTheDay, onGameFinish }}>
    {children}
  </GameSetup>
</WithLexicaWords>

const WordleSetup = ({ children, wordOfTheDay, onGameFinish }: SetupProps) => <WithWordleWords>
  <GameSetup {...{ wordOfTheDay, onGameFinish }}>
    {children}
  </GameSetup>
</WithWordleWords>

const Game = (props: { wordOfTheDay?: boolean, useWordleWords?: boolean }): JSX.Element => {
  const { wordOfTheDay = false, useWordleWords = false } = props
  const [{ Display }, setToDisplay] = useState<{ Display: () => JSX.Element }>({
    Display: GameBoard
  })

  const onGameFinish = useCallback(
    () => setToDisplay({ Display: () => <Results wordOfTheDay={wordOfTheDay}/>}),
    [wordOfTheDay, setToDisplay]
  )

  const Setup = useMemo(() => {
    const props = { wordOfTheDay, onGameFinish }
    return useWordleWords
      ? ({ children }: { children: ReactNode }) => <WordleSetup {...props}>{children}</WordleSetup>
      : ({ children }: { children: ReactNode }) => <NormalSetup {...props}>{children}</NormalSetup>
  }, [wordOfTheDay, useWordleWords, onGameFinish])

  return <Setup><Display/></Setup>
}

export default Game
