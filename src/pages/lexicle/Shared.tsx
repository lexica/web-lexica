import { ReactNode, useEffect , useCallback, useContext, useMemo, useState } from 'react'
import { ConfirmationEffect } from '../../components/game/Board/hooks'
import { Board, getB64DelimitedURLBoard } from '../../game/board/hooks'
import { Dictionary, useCustomDictionaryWithBoard } from '../../game/dictionary/hooks'
import { Guess, GuessDispatch, useGuesses } from '../../game/guess'
import { Language, useLanguage } from '../../game/language'
import { useConfirmationEffect } from '../../game/lexicle/confirmation-effect'
import { useScore, ValidAnswers } from '../../game/lexicle/score'
import { useGameConfigFromUrl } from '../../game/lexicle/shared-game'
import { Rules, useDefaultRules } from '../../game/rules/hooks'
import { Score } from '../../game/lexicle/score'
import { GameBoard } from './Game'
import { sort } from '../../util'

import WithWordleWords from './WithWordleWords'
import Results from '../../components/game/lexicle/Results'
import { useOnGameFinishedCallback } from './GameSetup'

// const useUpdatingUrl = (config: GameConfig) => {
//   const history = useHistory()
//   const host = `${window.location.protocol}//${window.location.hostname}`
//   const url = useMemo(() => getGameUrl({ ...config, host }), [host, config])
//   logger.debug({ url })
//   const path = url.replace(/https?:\/\/.*\/web-lexica\/lexicle\//, '')

//   useEffect(() => {
//     history.replace(path)
//   }, [history, path])
// }

const SharedGameSetup = ({ children, onGameFinish }: { children: ReactNode, onGameFinish: () => void }): JSX.Element => {
  const gameConfig = useGameConfigFromUrl()
  const board = useMemo(() => getB64DelimitedURLBoard({ board: gameConfig.encodedBoard, delimiter: ',' }), [gameConfig])
  const rules = useDefaultRules()
  const language = useContext(Language)
  const boardCtx = useCustomDictionaryWithBoard(language.dictionary, board, 5)
  const dictionary = useMemo(
    () => boardCtx.loading ? [] : boardCtx.boardDictionary.filter(({ length }) => length === 5),
    [boardCtx]
  )
  const desiredWord = useMemo(
    () => dictionary.length ? sort(dictionary)[gameConfig.wordIndex] : '',
    [dictionary, gameConfig]
  )
  const dictionaryState = useMemo(() => ({ boardDictionary: dictionary, loading: dictionary.length === 0 }), [dictionary])
  const [guesses, dispatchGuess] = useGuesses(board)

  const [score, dispatchScoreUpdate] = useScore(desiredWord, dictionaryState)

  useOnGameFinishedCallback(onGameFinish, score)

  const latestGuess = useMemo(() => guesses.guesses[guesses.guesses.length - 1], [guesses])

  useEffect(() => {
    dispatchScoreUpdate(latestGuess)
  }, [latestGuess, dispatchScoreUpdate])

  // useUpdatingUrl(gameConfig)


  return <>
    <ConfirmationEffect.Provider value={useConfirmationEffect}>
      <Board.Provider value={board}>
        <Dictionary.Provider value={dictionaryState}>
          <Rules.Provider value={rules}>
            <Score.Provider value={score}>
              <Guess.Provider value={guesses}>
                <GuessDispatch.Provider value={dispatchGuess}>
                  {children}
                </GuessDispatch.Provider>
              </Guess.Provider>
            </Score.Provider>
          </Rules.Provider>
        </Dictionary.Provider>
      </Board.Provider>
    </ConfirmationEffect.Provider>
  </>
}

const WithLexicaWords = ({ languageCode, children }: { languageCode: string, children: ReactNode }): JSX.Element => {
  const language = useLanguage(languageCode)
  const validAnswers = useMemo(() => language.loading ? [] : language.dictionary, [language])

  return <>
    <Language.Provider value={language}>
      <ValidAnswers.Provider value={validAnswers}>
        {children}
      </ValidAnswers.Provider>
    </Language.Provider>
  </>
}

const SharedGameLanguageSetup = ({ children }: { children: ReactNode }): JSX.Element => {
  const gameConfig = useGameConfigFromUrl()

  const LanguageProvider = useMemo(() => {
    const { language: languageCode, useWordleWords } = gameConfig

    const LexicleWords = ({ children }: { children: ReactNode }) => <WithLexicaWords {...{ children, languageCode }}/>

    return useWordleWords ? WithWordleWords : LexicleWords
  }, [gameConfig])

  return <LanguageProvider>
    {children}
  </LanguageProvider>
}


const Shared = (): JSX.Element => {
  const config = useGameConfigFromUrl()
  const [{ Display }, setToDisplay] = useState<{ Display: () => JSX.Element }>({
    Display: GameBoard
  })

  const onGameFinish = useCallback(
    () => setToDisplay({ Display: () => <Results wordOfTheDay={config.wordOfTheDay}/>}),
    [config, setToDisplay]
  )

  return <>
    <SharedGameLanguageSetup>
      <SharedGameSetup onGameFinish={onGameFinish}>
        <Display/>
      </SharedGameSetup>
    </SharedGameLanguageSetup>
  </>
}

export default Shared