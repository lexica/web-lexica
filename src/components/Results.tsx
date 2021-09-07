import { useContext, useState } from 'react'

import { orderByWordScore } from "../game"
import ScoredWordList from './ScoredWordList'
import { useConstants } from '../style/constants'

import './Results.css'
import { ReactComponent as CheckCircle } from '@material-design-icons/svg/round/check_circle.svg'
import { ReactComponent as HighlightOff } from '@material-design-icons/svg/round/highlight_off.svg'
import Score from './Score'
import { Rules } from '../game/rules'
import { makeClasses } from '../util/classes'

enum Lists {
  FoundWords = 'found',
  MissedWords = 'missed'
}

type ListSelectorProps = {
  listName: Lists,
  displayedList: Lists,
  updateDisplayedList: (list: Lists) => void,
  orientation: ResultsOrientation
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

export enum ResultsOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal'
}

const Results: React.FC<{ 
  foundWords: string[],
  remainingWords: string[],
  orientation: ResultsOrientation
}> = ({
  foundWords,
  remainingWords,
  orientation
}) => {
  const [displayedList, updateDisplayedList] = useState(Lists.FoundWords)
  const { score: scoreType } = useContext(Rules)
  const orderedFoundWords = orderByWordScore(foundWords)
  const orderedMissedWords = orderByWordScore(remainingWords)


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
    <Score
      hideTime
      foundWords={foundWords}
      remainingWords={remainingWords}
      remainingTime={0}
      showPercent
    />
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
