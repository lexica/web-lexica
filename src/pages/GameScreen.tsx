import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ResultsScreen from '../components/ResultsScreen'
import InGameScreen from '../components/InGameScreen'
import { Board, BoardRefresh, useBoardFromUrl } from '../game/board/hooks'
import { Language, LanguageState, useLanguage } from '../game/language'
import { Rules, useRulesFromQueryString } from '../game/rules'
import { getSearchString, useGameUrlParameters } from '../game/url'
import { Dictionary, DictionaryState, useBoardDictionary } from '../game/dictionary'
import { logger } from '../util/logger'
import { toSeconds } from 'duration-fns'
import { Timer, useTimer } from '../game/timer'
import StartScreen from '../components/StartScreen'
import GameModeDetails from '../components/GameModeDetails'
import { Guess, GuessDispatch, useGuesses } from '../game/guess'
import { Score, useScore } from '../game/score'
import { LetterScores } from '../game'
import { useTimeAttack } from '../game/time-attack'
import { GameLocalStorage, savedGameExistsForUrl, useResumedGame } from '../game/save-game'
import { sort } from '../util'
import { getGamePath, isValidGamePath } from '../util/url'

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

    // if (!statefulCondition) {
    //   setTriggered(false)
    //   return
    // }

    // if (triggered) return

    if (statefulCondition) {
      handleStart()
      setTriggered(true)
    }
  }, [shouldAutoStart, statefulCondition, handleStart, triggered, setTriggered])
}

const ResumedGameProviders = ({ gamePath, children }: { gamePath: string, children: ReactNode }) => {
  const resumedGame = useResumedGame(gamePath)
  const board = useMemo(() => resumedGame.board, [resumedGame])
  const dictionary = useMemo(() => {
    const { foundWords, remainingWords } = resumedGame[GameLocalStorage.Score]
    return sort([...foundWords, ...remainingWords])
  }, [resumedGame])
  const boardDictionary: DictionaryState = useMemo(() => ({
    boardDictionary: dictionary,
    loading: false
  }), [dictionary])
  const language: LanguageState = useMemo(() => ({
    loading: false,
    error: false,
    metadata: resumedGame.language,
    dictionary: dictionary
  }), [resumedGame, dictionary])

  const rules = useMemo(() => resumedGame.rules, [resumedGame])
  const [guess, dispatchGuess] = useGuesses(board, resumedGame.guesses)

  const timer = useTimer(resumedGame.timer)

  const [score, dispatchScoreUpdate] = useScore(boardDictionary, resumedGame[GameLocalStorage.Score])

  const lastGuess = useMemo(() => guess.guesses[guess.guesses.length - 1], [guess])

  useEffect(() => {
    dispatchScoreUpdate(lastGuess)
  }, [dispatchScoreUpdate, lastGuess])

  return <Language.Provider value={language}>
    <Rules.Provider value={rules}>
      <LetterScores.Provider value={language.metadata.letterScores}>
        <Board.Provider value={board}>
          {/* Begin standard providers */}
          <Guess.Provider value={guess}>
            <GuessDispatch.Provider value={dispatchGuess}>
              <Dictionary.Provider value={boardDictionary}>
                <Score.Provider value={score}>
                  <Timer.Provider value={timer}>
                    {children}
                  </Timer.Provider>
                </Score.Provider>
              </Dictionary.Provider>
            </GuessDispatch.Provider>
          </Guess.Provider>
          {/* End standard providers */}
        </Board.Provider>
      </LetterScores.Provider>
    </Rules.Provider>
  </Language.Provider>
}

const StandardGameProviders = ({ children }: { children: ReactNode }) => {
  const board = useContext(Board)
  const language = useContext(Language)
  const rules= useContext(Rules)
  const dictionary = useBoardDictionary(language, board, rules.minimumWordLength)
  const [guess, dispatchGuess] = useGuesses(board)

  const timer = useTimer(toSeconds(rules.time))

  const [score, dispatchScoreUpdate] = useScore(dictionary)

  const lastGuess = useMemo(() => guess.guesses[guess.guesses.length - 1], [guess])

  useEffect(() => {
    dispatchScoreUpdate(lastGuess)
  }, [dispatchScoreUpdate, lastGuess])

  return <Guess.Provider value={guess}>
    <GuessDispatch.Provider value={dispatchGuess}>
      <Dictionary.Provider value={dictionary}>
        <Score.Provider value={score}>
          <Timer.Provider value={timer}>
            {children}
          </Timer.Provider>
        </Score.Provider>
      </Dictionary.Provider>
    </GuessDispatch.Provider>
  </Guess.Provider>
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

  const toRender = getNextScreenLogic({
    startScreenProps: {
      loading,
      error,
      handleStart,
      handleBoardRefresh,
      showQrCode,
      pageTitle,
    },
    autoStart,
    started,
    finished
  }) // ,[loading, error, handleStart, handleBoardRefresh, showQrCode, pageTitle, autoStart, started, finished])

  return <>{toRender}</>
  // return <ToRender />
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

  return <StandardGameProviders>
    <Game
      handleBoardRefresh={handleBoardRefresh}
      showQrCode={isMultiplayer}
      isMultiplayer={isMultiplayer}
      autoStart={!isMultiplayer}
    />
  </StandardGameProviders>
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
          <StandardGameProviders>
            <Game showQrCode={false} isMultiplayer />
          </StandardGameProviders>
        </LetterScores.Provider>
      </Language.Provider>
    </Rules.Provider>
  </Board.Provider>
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
