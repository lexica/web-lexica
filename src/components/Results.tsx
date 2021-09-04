import { useState } from 'react'

import { orderByWordScore, useGameParameters } from "../game"
import ScoredWordList from './ScoredWordList'
import { useConstants } from '../style/constants'

import './Results.css'
import { ReactComponent as CheckCircle } from '@material-design-icons/svg/round/check_circle.svg'
import { ReactComponent as HighlightOff } from '@material-design-icons/svg/round/highlight_off.svg'
import Score from './Score'

enum Lists {
  FoundWords = 'found',
  MissedWords = 'missed'
}

const ListSelector: React.FC<{ listName: Lists, displayedList: Lists, updateDisplayedList: (list: Lists) => void }> = ({
  listName,
  displayedList,
  updateDisplayedList
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

    return <div
      className={[
        'results-list-selector-button',
        displayedList === listName ? 'selected' : ''
      ].join(' ') }
      onClick={() =>updateDisplayedList(listName)}
    >
      {svg}
      <div className={`results-select-${listName}-words`}>{title}</div>
    </div>
}


const Results: React.FC<{ foundWords: string[], remainingWords: string[] }> = ({
  foundWords,
  remainingWords,
}) => {
  const [displayedList, updateDisplayedList] = useState(Lists.FoundWords)
  const { score: scoreType } = useGameParameters()
  const orderedFoundWords = orderByWordScore(foundWords)
  const orderedMissedWords = orderByWordScore(remainingWords)


  let foundWordsClass = 'results-found-words'
  let missedWordsClass = 'results-missed-words'

  switch (displayedList) {
    case Lists.MissedWords:
      foundWordsClass += ' disabled'
      break;
    case Lists.FoundWords:
    default:
      missedWordsClass += ' disabled'
  }

  const listSelectorProps = { displayedList, updateDisplayedList }

  return <div className="results">
    <Score
      hideTime
      foundWords={foundWords}
      remainingWords={remainingWords}
      remainingTime={0}
      showPercent
    />
    <div className="titles">
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
    <div className="results-main-container">
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
    <div className="results-list-selector">
      <ListSelector {...{ ...listSelectorProps, listName: Lists.FoundWords }}/>
      <ListSelector {...{ ...listSelectorProps, listName: Lists.MissedWords }}/>
    </div>
  </div>
}

export default Results
