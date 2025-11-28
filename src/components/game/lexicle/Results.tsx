import { useCallback, useContext, useState, useMemo } from 'react'
import { Guess } from '../../../game/guess'
import { LetterCorrectness, Score as ScoreContext } from '../../../game/lexicle/score'
import type { LetterCorrectnessType } from '../../../game/lexicle/score'

import StaticBoard from '../../StaticBoard'
import Score from './Score'

import './Results.css'
import { useOrientation, ScreenOrientation } from '../../../util/hooks'
import { getGameUrl } from '../../../game/lexicle/shared-game'
import { Dictionary } from '../../../game/dictionary'
import { sort } from '../../../util'
import { encodeBoard } from '../../../game/url'
import { Board } from '../../../game/board/hooks'
import { useLocation } from 'react-router'
import { Language } from '../../../game/language'
import { makeClasses } from '../../../util/classes'
import { getBaseUrl } from '../../../util/url'
import { Translations } from '../../../translations'

const correctnessMap: { [C in LetterCorrectnessType]: string } = {
  [LetterCorrectness.Perfect]: '🟩',
  [LetterCorrectness.InWord]: '🟨',
  [LetterCorrectness.NotInWord]: '⬛'
}

const ShareType = {
  Score: 'Score',
  Link: 'Game Link'
} as const

type ShareTypeType = typeof ShareType[keyof typeof ShareType]

const withPrefix = <T extends string>(suffix: T): `lexicleGameScreens.results.${T}` => `lexicleGameScreens.results.${suffix}`

const useShareLink = (wordOfTheDay: boolean) => {
  const { boardDictionary: dictionary } = useContext(Dictionary)
  const score = useContext(ScoreContext)
  const board = useContext(Board)
  const language = useContext(Language)
  const location = useLocation()

  const link = useMemo(() => {
    const wordIndex = sort(dictionary).indexOf(score.desiredWord)

    const encodedBoard = encodeBoard(board)
    const useWordleWords = location.pathname.includes('with-wordle-words')

    return getGameUrl({
      encodedBoard,
      wordIndex,
      wordOfTheDay,
      useWordleWords,
      host: getBaseUrl(),
      language: language.metadata.locale
    })
  }, [score, dictionary, board, language, location, wordOfTheDay])

  return link
}

const useScoreSummary = (wordOfTheDay: boolean) => {
  const score = useContext(ScoreContext)
  const { translationsFn } = useContext(Translations)
  const scoreBreakdown = score.guessScores
    .map(guess => guess.wordBreakdown.map(
      ({ correctness }) => correctnessMap[correctness]
    ).join(''))
    .join('\n')

  const link = useShareLink(wordOfTheDay)

  const guessCount = score.guessScores.length
  return useMemo(
    () => ({
      shareScore: wordOfTheDay
        ? translationsFn(withPrefix('shareScoreTextWordOfTheDay'), { date: (new Date()).toLocaleDateString(), numericScore: guessCount, visualScore: scoreBreakdown })
        : translationsFn(withPrefix('shareScoreText'), { numericScore: guessCount, visualScore: scoreBreakdown }),
      shareGame: wordOfTheDay
        ? translationsFn(withPrefix('shareGameTextWordOfTheDay'), { date: (new Date()).toLocaleDateString(), numericScore: guessCount, visualScore: scoreBreakdown, url: link })
        : translationsFn(withPrefix('shareGameText'), { numericScore: guessCount, visualScore: scoreBreakdown, url: link })
    }),
    [guessCount, scoreBreakdown, wordOfTheDay, translationsFn, link])
}

const Share = ({ wordOfTheDay }: { wordOfTheDay: boolean }): JSX.Element => {
  const { translationsFn } = useContext(Translations)
  const [{ shareScoreClicked, shareLinkClicked }, setClickFeedback] = useState({
    shareLinkClicked: false,
    shareScoreClicked: false
  })
  const [action, setAction] = useState<ShareTypeType>(ShareType.Score)
  const scoreSummary = useScoreSummary(wordOfTheDay)

  const onClickShareScore = useCallback(() => {
    navigator.clipboard.writeText(scoreSummary.shareScore)
    setAction(ShareType.Score)
    setClickFeedback(previous => ({ ...previous, shareScoreClicked: true }))
    setTimeout(() => setClickFeedback(p => ({ ...p, shareScoreClicked: false })), 1010)
  }, [scoreSummary, setAction, setClickFeedback])

  const onClickShareScoreAndLink = useCallback(() => {
    navigator.clipboard.writeText(scoreSummary.shareGame)
    setAction(ShareType.Link)
    setClickFeedback(p => ({ ...p, shareLinkClicked: true }))
    setTimeout(() => setClickFeedback(p => ({ ...p, shareLinkClicked: false })), 1010)
  }, [scoreSummary, setAction, setClickFeedback])


  const confirmationClasses = makeClasses(
    'lexicle-results-share-confirmation',
    { condition: shareLinkClicked, name: 'share-link-clicked '},
    { condition: shareScoreClicked, name: 'share-score-clicked'}
  )

  const shareLinkClasses = makeClasses(
    'lexicle-results-share-button',
    { condition: shareLinkClicked, name: 'share-link-clicked'}
  )

  const shareScoreClasses = makeClasses(
    'lexicle-results-share-button',
    { condition: shareScoreClicked, name: 'share-score-clicked'}
  )

  return <>
    <div className={confirmationClasses}>{
      action === ShareType.Link
        ? translationsFn(withPrefix('shareGameConfirmationText'))
        : translationsFn(withPrefix('shareScoreConfirmationText'))
    }</div>
    <div className='lexicle-results-share-button-container'>
      <div
        className={shareScoreClasses}
        onClick={onClickShareScore}
      >
        {translationsFn(withPrefix('shareScore'))}
      </div>
      <div
        className={shareLinkClasses}
        onClick={onClickShareScoreAndLink}
      >
        {translationsFn(withPrefix('shareGame'))}
      </div>
    </div>
  </>
}

const Results = ({ wordOfTheDay }: { wordOfTheDay: boolean }): JSX.Element => {
  const orientation = useOrientation()
  const score = useContext(ScoreContext)
  const { board } = useContext(Guess)
  const Landscape = <div className='lexicle-results'>
    <div className='lexicle-results-board-container'><StaticBoard board={board}/></div>
    <div className='lexicle-results-landscape-container'>
      <div className='lexicle-results-desired-word'>{score?.desiredWord?.toLocaleUpperCase()}</div>
      <Share wordOfTheDay={wordOfTheDay}/>
    </div>
    <div className='lexicle-results-score-container'><Score/></div>
  </div>

  const Portrait = <div>
    <div className='lexicle-results-desired-word'>{score?.desiredWord?.toLocaleUpperCase()}</div>
    <div className='lexicle-results-portrait-container'>
      <div className='lexicle-results-score-container'><Score/></div>
    </div>
    <Share wordOfTheDay={wordOfTheDay}/>
    <div className='lexicle-results-board-container'><StaticBoard board={board}/></div>
  </div>

  return orientation === ScreenOrientation.Landscape ? Landscape : Portrait
}

export default Results
