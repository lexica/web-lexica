import { useCallback, useContext, useState, useMemo } from 'react'
import { Guess } from '../../../game/guess'
import { LetterCorrectness, Score as ScoreContext } from '../../../game/lexicle/score'

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

const correctnessMap: { [C in LetterCorrectness]: string } = {
  [LetterCorrectness.Perfect]: '🟩',
  [LetterCorrectness.InWord]: '🟨',
  [LetterCorrectness.NotInWord]: '⬛'
}

enum ShareType {
  Score = 'Score',
  Link = 'Score+Link'
}

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
      host: window.location.protocol + '//' + window.location.hostname,
      language: language.metadata.locale
    })
  }, [score, dictionary, board, language, location, wordOfTheDay])

  return link
}

const useScoreSummary = (wordOfTheDay: boolean) => {
  const score = useContext(ScoreContext)
  const wordOfTheDayDisplay = useMemo(
    () => wordOfTheDay
      ? `Word of the Day ${(new Date()).toLocaleDateString()} `
      : '',
    [wordOfTheDay]
  )
  const scoreBreakdown = score.guessScores
    .map(guess => guess.wordBreakdown.map(
      ({ correctness }) => correctnessMap[correctness]
    ).join(''))
    .join('\n')

  const guessCount = score.guessScores.length
  return useMemo(
    () => `Lexicle ${wordOfTheDayDisplay}${guessCount}/6\n\n${scoreBreakdown}`,
    [guessCount, scoreBreakdown, wordOfTheDayDisplay])
}

const Share = ({ wordOfTheDay }: { wordOfTheDay: boolean }): JSX.Element => {
  const [{ shareScoreClicked, shareLinkClicked }, setClickFeedback] = useState({
    shareLinkClicked: false,
    shareScoreClicked: false
  })
  const [action, setAction] = useState(ShareType.Score)
  const link = useShareLink(wordOfTheDay)
  const scoreSummary = useScoreSummary(wordOfTheDay)

  const onClickShareScore = useCallback(() => {
    navigator.clipboard.writeText(scoreSummary)
    setAction(ShareType.Score)
    setClickFeedback(previous => ({ ...previous, shareScoreClicked: true }))
    setTimeout(() => setClickFeedback(p => ({ ...p, shareScoreClicked: false })), 1010)
  }, [scoreSummary, setAction, setClickFeedback])

  const onClickShareScoreAndLink = useCallback(() => {
    navigator.clipboard.writeText(`${scoreSummary}\n\nSee if you can beat my score: ${link}`)
    setAction(ShareType.Link)
    setClickFeedback(p => ({ ...p, shareLinkClicked: true }))
    setTimeout(() => setClickFeedback(p => ({ ...p, shareLinkClicked: false })), 1010)
  }, [scoreSummary, link, setAction, setClickFeedback])


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
    <div className={confirmationClasses}>{action} Copied to Clipboard!</div>
    <div className='lexicle-results-share-button-container'>
      <div
        className={shareScoreClasses}
        onClick={onClickShareScore}
      >
        Share Score
      </div>
      <div
        className={shareLinkClasses}
        onClick={onClickShareScoreAndLink}
      >
        Share Score+Word
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
