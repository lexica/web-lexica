import { useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router'
import ResultsScreen from '../components/ResultsScreen'
import InGameScreen from '../components/InGameScreen'
import { Board, BoardRefresh, useBoardFromUrl } from '../game/board/hooks'
import { Language, useLanguage } from '../game/language'
import { Rules, useDefaultRules, useRulesFromQueryString } from '../game/rules'
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
import { useTimeAttack } from '../game/time-attack'
import { storage } from '../util/storage'
import { getSavedGamesWithUrl, SavedGame } from '../game/save-game'

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
  useEffect(() => {
    if (!shouldAutoStart || triggered) return

    if (condition) {
      handleStart()
      setTriggered(true)
    }
  }, [shouldAutoStart, condition, handleStart, triggered, setTriggered])
}

const Game = ({
  autoStart: shouldAutoStart,
  handleBoardRefresh,
  showQrCode,
  isMultiplayer
}: GameProps): JSX.Element => {
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

  useTimeAttack(rules, timer, score)

  const pageTitle = `Web Lexica ${showQrCode ? 'New ' : ''}${isMultiplayer ? 'Multiplayer Game' : ''}`

  const toRender = getNextScreenLogic({
    startScreenProps: {
      loading,
      error,
      handleStart,
      handleBoardRefresh,
      showQrCode,
      pageTitle
    },
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

  return <Game
    handleBoardRefresh={handleBoardRefresh}
    showQrCode={isMultiplayer}
    isMultiplayer={isMultiplayer}
    autoStart={!isMultiplayer}
  />
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
          <Game showQrCode={false} isMultiplayer />
        </LetterScores.Provider>
      </Language.Provider>
    </Rules.Provider>
  </Board.Provider>
}

const ResumedGame = ({ gameId }: { gameId: string }): JSX.Element => {
  const [finished, updateFinished] = useState(false)
  const defaultRules = useDefaultRules()
  const savedGame = useMemo(() => storage.getWithDefault<SavedGame>({
    key: gameId,
    defaultValue: {
      board: [],
      foundWords: [],
      gameUrl: '',
      guesses: [],
      languageMetadata: { letterScores: {} } as any,
      remainingTime: { seconds: 0 },
      remainingWords: [],
      rules: defaultRules
    }
  }), [defaultRules, gameId])
  const [guessState, guessDispatch] = useGuesses(savedGame.board, savedGame.guesses)

  const handleFinish = useCallback(() => {
    logger.debug('handling finish...')
    updateFinished(true)
  }, [updateFinished])

  const boardDictionary = useMemo(() => [...savedGame.foundWords, ...savedGame.remainingWords], [savedGame])
  const dictionaryState = useMemo(() => ({ boardDictionary, loading: false }), [boardDictionary])
  const score = useScore(guessState, dictionaryState, savedGame)
  const timer = useTimer(toSeconds(savedGame.remainingTime), handleFinish)

  useAutoStart(true, true, timer.startTime)

  const toRender = getNextScreenLogic({
    startScreenProps: {} as any,
    autoStart: true,
    started: true,
    finished
  })

  return <Board.Provider value={savedGame.board}>
    <Rules.Provider value={savedGame.rules}>
      <Dictionary.Provider value={dictionaryState}>
        <LetterScores.Provider value={savedGame.languageMetadata.letterScores}>
          <Guess.Provider value={guessState}>
            <GuessDispatch.Provider value={guessDispatch}>
              <Score.Provider value={score}>
                <Timer.Provider value={timer}>
                  {toRender}
                </Timer.Provider>
              </Score.Provider>
            </GuessDispatch.Provider>
          </Guess.Provider>
        </LetterScores.Provider>
      </Dictionary.Provider>
    </Rules.Provider>
  </Board.Provider>
}

const getIdOfGameWithSameUrl = (location: ReturnType<typeof useLocation>) => {
  const currentUrl = `${location.pathname}${location.search}`

  const [matchingGame] = getSavedGamesWithUrl(currentUrl)

  if (!matchingGame) return undefined

  return matchingGame.gameId
}

const GameScreen = ({ isMultiplayer: m, isNewGame: n }: GameScreenProps): JSX.Element => {
  const [isMultiplayer, isNewGame] = [m === true, n === true]

  const refreshBoard = useContext(BoardRefresh)
  useEffect(() => {
    logger.debug('running GameScreen useEffect...')
    return refreshBoard
  }, [refreshBoard])
  const location = useLocation()
  const gameId = getIdOfGameWithSameUrl(location)
  if (gameId) return <ResumedGame gameId={gameId} />

  if (isNewGame) return <NewGame isMultiplayer={isMultiplayer} />
  return <Multiplayer/>
}

export default GameScreen
