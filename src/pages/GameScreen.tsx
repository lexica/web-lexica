import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ResultsScreen from '../components/ResultsScreen'
import InGameScreen from '../components/InGameScreen'
import { Board, BoardRefresh } from '../game/board/hooks'
import { Language } from '../game/language'
import { Rules } from '../game/rules'
import { getSearchString } from '../game/url'
import { Dictionary } from '../game/dictionary'
import { logger } from '../util/logger'
import { Timer } from '../game/timer'
import StartScreen from '../components/StartScreen'
import GameModeDetails from '../components/GameModeDetails'
import { Score } from '../game/score'
import { useTimeAttack } from '../game/time-attack'
import { savedGameExistsForUrl } from '../game/save-game'
import { getGamePath, isValidGamePath } from '../util/url'
import { NewGameProviders, ResumedGameProviders, SharedGameProviders } from '../components/GameProviders'

export type GameScreenProps = {
  isMultiplayer?: boolean,
  isNewGame?: boolean
  isResumedGame?: boolean
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
    pageTitle: string
  }
  autoStart: boolean,
  started: boolean,
  finished: boolean
}

const getNextScreenLogic = ({
  startScreenProps, autoStart, started, finished
}: GetNextScreenParameters) => {

  if (finished) return <ResultsScreen />

  if (started) return <InGameScreen />

  if (autoStart) return <LoadingScreen />

  return <StartScreen {...startScreenProps}/>
}

type GameProps = {
  autoStart?: boolean,
  showQrCode: boolean,
  handleBoardRefresh?: () => void,
  isMultiplayer: boolean,
}

const useAutoStart = (shouldAutoStart: boolean, condition: boolean, handleStart: () => void) =>  {
  const [triggered, setTriggered] = useState(false)
  const [statefulCondition, setStatefuleCondition] = useState(condition)
  useEffect(() => {
    setStatefuleCondition(condition)
  }, [condition, setStatefuleCondition])

  useEffect(() => {
    if (!shouldAutoStart || triggered) return

    if (statefulCondition) {
      handleStart()
      setTriggered(true)
    }
  }, [shouldAutoStart, statefulCondition, handleStart, triggered, setTriggered])
}

const Game = ({
  autoStart: shouldAutoStart,
  handleBoardRefresh,
  showQrCode,
  isMultiplayer
}: GameProps): JSX.Element => {
  const autoStart = shouldAutoStart === true

  const language = useContext(Language)
  const dictionary = useContext(Dictionary)
  const rules= useContext(Rules)

  const [started, updateStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const isLoading = language.loading || dictionary.loading
    logger.debug(`GameScreen->Game useEffect, isLoading: ${isLoading}`)
    setLoading(isLoading)
    setError(language.error)
  }, [language, dictionary, setLoading, setError])

  const timer = useContext(Timer)
  const { startTime } = timer

  const score = useContext(Score)

  const handleStart = useCallback(() => { updateStarted(true); startTime() }, [updateStarted, startTime])
  const handleFinish = useCallback(() => setFinished(true), [setFinished])


  useEffect(() => {
    timer.addTimerEndCallback(handleFinish)
    return () => timer.removeTimerEndCallback(handleFinish)
  }, [timer, handleFinish])

  const ready = useMemo(() => !loading && !error, [loading, error])

  useAutoStart(autoStart, ready, handleStart)

  useTimeAttack(rules, timer, score)

  const pageTitle = `Web Lexica ${showQrCode ? 'New ' : ''}${isMultiplayer ? 'Multiplayer Game' : ''}`

  useUpdatingSearchString(!loading && !error)

  const startScreenProps = {
    loading,
    error,
    handleStart,
    handleBoardRefresh,
    showQrCode,
    pageTitle,
  }

  const toRender = getNextScreenLogic({ startScreenProps, autoStart, started, finished })

  return <>{toRender}</>
}

const useUpdatingSearchString = (shouldUpdateSearch: boolean) => {
  const { pathname } = useLocation()
  const board = useContext(Board)
  const language = useContext(Language)
  const rules = useContext(Rules)
  const navigate = useNavigate()
  useEffect(() => {
    if (shouldUpdateSearch === true) {
      const searchString = getSearchString({ board, language: language.metadata.name, ...rules })

      const url = `${pathname}${searchString}`
      navigate(url, { replace: true })
    }
  }, [board, language, shouldUpdateSearch, rules, pathname, navigate])
}

const NewGame = ({ isMultiplayer }: { isMultiplayer: boolean }): JSX.Element => {

  const handleBoardRefresh = useContext(BoardRefresh)

  return <NewGameProviders>
    <Game
      handleBoardRefresh={handleBoardRefresh}
      showQrCode={isMultiplayer}
      isMultiplayer={isMultiplayer}
      autoStart={!isMultiplayer}
    />
  </NewGameProviders>
}

const Multiplayer = (): JSX.Element => {

  return <SharedGameProviders>
    <Game showQrCode={false} isMultiplayer />
  </SharedGameProviders>
}

const ResumedGame = ({ gameUrl }: { gameUrl: string }): JSX.Element => {
  const navigate = useNavigate()
  useEffect(() => {
    logger.debug('calling ResumedGame useEffect...')
    navigate(gameUrl, { replace: true })
  }, [gameUrl, navigate])
  return <ResumedGameProviders
    gamePath={gameUrl}
  >
    <Game
      isMultiplayer={gameUrl.includes('multiplayer')}
      showQrCode={false}
      autoStart
    />
  </ResumedGameProviders>
}


/**
 * 
 * Save Game Logic
 * 
 * If user navigates from the base-path:
 *  - No Resume
 * If user navigates to game url:
 *  - Resume if game is present, newgame otherwise
 * If user refreshes page:
 *  - Resume if game is present, newgame otherwise
 * If prop is reloaded:
 *  - No Resume
 * If prop is remounted (aka a new game is created):
 *  - No Resume
 */

const GameScreen = ({ isMultiplayer: m, isNewGame: n }: GameScreenProps): JSX.Element => {
  const [isMultiplayer, isNewGame] = [m === true, n === true]
  const [shouldUseSavedGame, setShouldUseSavedGame] = useState(false)
  const [path, setPath] = useState('')

  const refreshBoard = useContext(BoardRefresh)
  useEffect(() => {
    logger.debug('running GameScreen useEffect...')
    return refreshBoard
  }, [refreshBoard])

  useEffect(() => {
    const gamePath = getGamePath()
    if (!isValidGamePath(gamePath)) return

    const savedGameExists = savedGameExistsForUrl(gamePath)
    if (!savedGameExists) return

    setShouldUseSavedGame(true)
    setPath(gamePath)
  }, [setShouldUseSavedGame])
  
  const MemoizedResumeGame = useMemo(() => () => <ResumedGame gameUrl={path} />, [path])
  const MemoizedNewGame = useMemo(() => () => <NewGame isMultiplayer={isMultiplayer}/>, [isMultiplayer])
  if (shouldUseSavedGame) return <MemoizedResumeGame/>

  if (isNewGame) return <MemoizedNewGame />
  return <Multiplayer/>
}

export default GameScreen
