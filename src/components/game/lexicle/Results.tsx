import { useCallback, useContext, useState, useMemo } from 'react'
import { Guess } from '../../../game/guess'
import { LetterCorrectness, Score as ScoreContext } from '../../../game/lexicle/score'

import StaticBoard from '../../StaticBoard'
import Score from './Score'

import './Results.css'
import { useOrientation, ScreenOrientation } from '../../../util/hooks'

const correctnessMap: { [C in LetterCorrectness]: string } = {
  [LetterCorrectness.Perfect]: '🟩',
  [LetterCorrectness.InWord]: '🟨',
  [LetterCorrectness.NotInWord]: '⬛'
}

const Share = ({ wordOfTheDay }: { wordOfTheDay: boolean }): JSX.Element => {
  const score = useContext(ScoreContext)
  const wordOfTheDayDisplay = useMemo(
    () => wordOfTheDay
      ? `Word of the Day ${(new Date()).toLocaleDateString()} `
      : '',
    [wordOfTheDay]
  )
  const [clickFeedbackClass, setClickFeedbackClass] = useState('')
  const onClick = useCallback(() => {
    const scoreBreakdown = score.guessScores
      .map(guess => guess.wordBreakdown.map(
        ({ correctness }) => correctnessMap[correctness]
      ).join(''))
      .join('\n')
    navigator.clipboard.writeText(`Lexicle ${wordOfTheDayDisplay}${score.guessScores.length}/6\n\n${scoreBreakdown}`)
    setClickFeedbackClass('clicked')
    setTimeout(() => setClickFeedbackClass(''), 1010)
  }, [score, wordOfTheDayDisplay, setClickFeedbackClass])
  return <>
    <div className={`lexicle-results-share-confirmation ${clickFeedbackClass}`}>Score Copied to Clipboard!</div>
    <div
      className={`lexicle-results-share-button ${clickFeedbackClass}`}
      onClick={onClick}
    >
      Share
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
