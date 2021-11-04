import { useCallback, useContext, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import Results from '../components/Results'
import GameComponent from '../components/Game'
import { Board, BoardRefresh, useBoardFromUrl } from '../game/board/hooks'
import { Language, useLanguage } from '../game/language'
import { Rules, useRulesFromQueryString } from '../game/rules'
import { getSearchString, useGameUrlParameters } from '../game/url'
import { Dictionary, useBoardDictionary } from '../game/dictionary'
import { logger } from '../util/logger'
import { toSeconds } from 'duration-fns'
import { Timer, useTimer } from '../game/timer'
import StartScreen from '../components/StartScreen'
import GameModeDetails from '../components/GameModeDetails'
import { Guess, GuessDispatch, useGuesses } from '../game/guess'
import { Score, useScore } from '../game/score'
import { LetterScores } from '../game'

export type GameScreenProps = {
  isMultiplayer?: boolean,
  isNewGame?: boolean
}

const LoadingScreen = (): JSX.Element => {
  return <>
    <div className="single-player-loading-screen">
      <GameModeDetails />
      Loading board...
    </div>
  </>
}

type GetNextScreenParameters = {
  startScreenProps: {
    loading: boolean,
    error: boolean,
    showQrCode: boolean
    handleStart: () => void,
    handleBoardRefresh?: () => void,
  }
  autoStart: boolean,
  started: boolean,
  finished: boolean
}

const getNextScreenLogic = ({
  startScreenProps, autoStart, started, finished
}: GetNextScreenParameters) => {

  if (finished) return <Results />

  if (started) return <GameComponent />

  if (autoStart) return <LoadingScreen />

  return <StartScreen {...startScreenProps}/>
}

type GameProps = {
  autoStart?: boolean,
  showQrCode: boolean,
  handleBoardRefresh?: () => void
}

const useAutoStart = (shouldAutoStart: boolean, condition: boolean, handleStart: () => void) =>  {
  const [triggered, setTriggered] = useState(false)
  useEffect(() => {
    if (!shouldAutoStart || triggered) return

    if (condition) {
      handleStart()
      setTriggered(true)
    }
  }, [shouldAutoStart, condition, handleStart, triggered, setTriggered])
}

const Game = ({ autoStart: shouldAutoStart, handleBoardRefresh, showQrCode }: GameProps): JSX.Element => {
  const autoStart = shouldAutoStart === true
  const [finished, updateFinished] = useState(false)
  const [started, updateStarted] = useState(false)

  const board = useContext(Board)
  const language = useContext(Language)
  const rules= useContext(Rules)
  const dictionary = useBoardDictionary(language, board, rules.minimumWordLength)
  const [guess, dispatchGuess] = useGuesses(board)

  const loading = language.loading || dictionary.loading
  const { error } = language

  const handleFinish = useCallback(() => {
    logger.debug('handling finish...')
    updateFinished(true)
  }, [updateFinished])

  const timer = useTimer(toSeconds(rules.time), handleFinish)

  const { startTime } = timer

  const score = useScore(guess, dictionary)

  const handleStart = useCallback(() => { updateStarted(true); startTime() }, [updateStarted, startTime])

  useAutoStart(autoStart, loading && !error, handleStart)

  const toRender = getNextScreenLogic({
    startScreenProps: { loading, error, handleStart, handleBoardRefresh, showQrCode },
    autoStart,
    started,
    finished
  })

  return <Guess.Provider value={guess}>
    <GuessDispatch.Provider value={dispatchGuess}>
      <Dictionary.Provider value={dictionary}>
        <Score.Provider value={score}>
          <Timer.Provider value={timer}>
            {toRender}
          </Timer.Provider>
        </Score.Provider>
      </Dictionary.Provider>
    </GuessDispatch.Provider>
  </Guess.Provider>
}

const useUpdatingSearchString = (shouldUpdateSearch: boolean) => {
  const { pathname } = useLocation()
  const board = useContext(Board)
  const language = useContext(Language)
  const rules = useContext(Rules)
  const history = useHistory()
  useEffect(() => {
    if (shouldUpdateSearch === true) {
      const searchString = getSearchString({ board, language: language.metadata.name, ...rules })

      const url = `${pathname}${searchString}`
      history.replace(url)
    }
  }, [board, language, shouldUpdateSearch, rules, pathname, history])
}

const NewGame = ({ isMultiplayer }: { isMultiplayer: boolean }): JSX.Element => {

  const handleBoardRefresh = useContext(BoardRefresh)

  useUpdatingSearchString(isMultiplayer)

  return <Game handleBoardRefresh={handleBoardRefresh} showQrCode={isMultiplayer} />
}

const Multiplayer = (): JSX.Element => {
  const board = useBoardFromUrl()
  const rules = useRulesFromQueryString(board)
  const params = useGameUrlParameters()
  const language = useLanguage(params.language)

  return <Board.Provider value={board}>
    <Rules.Provider value={rules}>
      <Language.Provider value={language}>
        <LetterScores.Provider value={language?.metadata?.letterScores}>
          <Game showQrCode={false} />
        </LetterScores.Provider>
      </Language.Provider>
    </Rules.Provider>
  </Board.Provider>
}

const GameScreen = ({ isMultiplayer: m, isNewGame: n }: GameScreenProps): JSX.Element => {
  const [isMultiplayer, isNewGame] = [m === true, n === true]
  if (isNewGame) return <NewGame isMultiplayer={isMultiplayer} />
  return <Multiplayer/>
}

export default GameScreen
