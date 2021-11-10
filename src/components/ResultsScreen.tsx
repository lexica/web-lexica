import { useContext, useEffect, useMemo, useState } from 'react'

import { LetterScores, orderByWordScore } from "../game"
import ScoredWordList from './game/ScoredWordList'
import { useConstants } from '../style/constants'

import './ResultsScreen.css'
import { ReactComponent as CheckCircle } from '@material-design-icons/svg/round/check_circle.svg'
import { ReactComponent as HighlightOff } from '@material-design-icons/svg/round/highlight_off.svg'
import Score from './game/Score'
import { Rules } from '../game/rules'
import { Score as ScoreContext } from '../game/score'
import { makeClasses } from '../util/classes'
import { ScreenOrientation, useOrientation } from '../util/hooks'
import { BoardRefresh } from '../game/board/hooks'
import { logger } from '../util/logger'

enum Lists {
  FoundWords = 'found',
  MissedWords = 'missed'
}

type ListSelectorProps = {
  listName: Lists,
  displayedList: Lists,
  updateDisplayedList: (list: Lists) => void,
  orientation: ScreenOrientation
}

const ListSelector: React.FC<ListSelectorProps> = ({
  listName,
  displayedList,
  updateDisplayedList,
  orientation
}) => {
  const constants = useConstants()

  const title = listName === Lists.FoundWords
    ? 'Found words'
    : 'Missed words'

  const svgProps = {
    fill: constants.colorContentDark,
    width: constants.fontSize,
    height: constants.fontSize,
    title
  }
  const svg = listName === Lists.FoundWords
    ? <CheckCircle {...svgProps} />
    : <HighlightOff {...svgProps}/>

  const selectorClass = makeClasses(
    'results-list-selector-button',
    orientation,
    { condition: displayedList === listName, name: 'selected' }
  )

    return <div
      className={selectorClass}
      onClick={() =>updateDisplayedList(listName)}
    >
      {svg}
      <div className={`results-select-${listName}-words`}>{title}</div>
    </div>
}

const Results: React.FC = () => {
  const orientation = useOrientation()
  const { foundWords, remainingWords } = useContext(ScoreContext)
  const letterScores = useContext(LetterScores)

  const [displayedList, updateDisplayedList] = useState(Lists.FoundWords)
  const { score: scoreType } = useContext(Rules)
  const orderedFoundWords = useMemo(() => orderByWordScore(foundWords, scoreType, letterScores), [foundWords, scoreType, letterScores])
  const orderedMissedWords = useMemo(() => orderByWordScore(remainingWords, scoreType, letterScores), [remainingWords, scoreType, letterScores])

  const refreshBoard = useContext(BoardRefresh)
  useEffect(() => {
    logger.debug('running ResultsScreen useEffect...')
    return refreshBoard
  }, [refreshBoard])

  let foundWordsClass = makeClasses(
    'results-found-words',
    orientation,
    { condition: displayedList === Lists.MissedWords, name: 'disabled' }
  )
  let missedWordsClass = makeClasses(
    'results-missed-words',
    orientation,
    { condition: displayedList === Lists.FoundWords, name: 'disabled' }
    )

  const listSelectorProps = { displayedList, updateDisplayedList, orientation }

  return <div className="results">
    <Score hideTime showPercent />
    <div className={`titles ${orientation}`}>
      <div
        className={displayedList === Lists.MissedWords ? 'disabled' : ''}
      >
        Found Words
      </div>
      <div
        className={displayedList === Lists.FoundWords ? 'disabled' : ''}
      >
        Missed Words
      </div>
    </div>
    <div className={`results-main-container ${orientation}`}>
      <div className={foundWordsClass}>
        <ScoredWordList {...{
          scoredWords: orderedFoundWords,
          scoreType
        }}/>
      </div>
      <div className={missedWordsClass}>
        <ScoredWordList {...{
          scoredWords: orderedMissedWords,
          scoreType
        }}/>
      </div>
    </div>
    <div className={`results-list-selector ${orientation}`}>
      <ListSelector {...{ ...listSelectorProps, listName: Lists.FoundWords }}/>
      <ListSelector {...{ ...listSelectorProps, listName: Lists.MissedWords }}/>
    </div>
  </div>
}

export default Results
