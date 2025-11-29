import { useCallback, useContext, useMemo, useState } from 'react'
import CheckCircle from '@material-design-icons/svg/round/check_circle.svg'
import HighlightOff from '@material-design-icons/svg/round/highlight_off.svg'

import { LetterScores, orderByWordScore } from "../game"
import ScoredWordList from './game/ScoredWordList'
import Score from './game/Score'
import { Rules } from '../game/rules'
import { Score as ScoreContext } from '../game/score'
import { makeClasses } from '../util/classes'
import Button, { ButtonThemeType } from './Button'

import './ResultsScreen.css'
import { Translations } from '../translations'

const Lists = {
  FoundWords:'found',
  MissedWords: 'missed'
} as const

type ListsType = typeof Lists[keyof typeof Lists]

type ListSelectorProps = {
  listName: ListsType,
  displayedList: ListsType,
  updateDisplayedList: (list: ListsType) => void,
}

const ListSelector = ({
  listName,
  displayedList,
  updateDisplayedList,
}: ListSelectorProps) => {
  const { translationsFn } = useContext(Translations)

  const selected = displayedList === listName
  const title = listName === Lists.FoundWords
    ? translationsFn('lexicaGameScreens.results.foundWords')
    : translationsFn('lexicaGameScreens.results.missedWords')

  const svg = listName === Lists.FoundWords ? CheckCircle : HighlightOff
  const theme = selected ? ButtonThemeType.Standard : ButtonThemeType.AltStandard

  const onClick = useCallback(() => updateDisplayedList(listName), [updateDisplayedList, listName])

  return <Button onClick={onClick} svg={svg} prompt={title} themeType={theme} roundedEdges={false}/>
}

const Results: React.FC = () => {
  const { foundWords, remainingWords } = useContext(ScoreContext)
  const { translationsFn } = useContext(Translations)
  const letterScores = useContext(LetterScores)

  const [displayedList, updateDisplayedList] = useState<ListsType>(Lists.FoundWords)
  const { score: scoreType } = useContext(Rules)
  const orderedFoundWords = useMemo(() => orderByWordScore(foundWords, scoreType, letterScores), [foundWords, scoreType, letterScores])
  const orderedMissedWords = useMemo(() => orderByWordScore(remainingWords, scoreType, letterScores), [remainingWords, scoreType, letterScores])

  let foundWordsClass = makeClasses('results-found-words', { condition: displayedList === Lists.MissedWords, name: 'disabled' })
  let missedWordsClass = makeClasses('results-missed-words', { condition: displayedList === Lists.FoundWords, name: 'disabled' })

  const listSelectorProps = { displayedList, updateDisplayedList }

  return <div className="results">
    <Score hideTime showPercent />
    <div className='titles'>
      <div
        className={displayedList === Lists.MissedWords ? 'disabled' : ''}
      >
        {translationsFn('lexicaGameScreens.results.foundWords')}
      </div>
      <div
        className={displayedList === Lists.FoundWords ? 'disabled' : ''}
      >
        {translationsFn('lexicaGameScreens.results.missedWords')}
      </div>
    </div>
    <div className='results-main-container'>
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
    <div className='results-list-selector'>
      <ListSelector {...{ ...listSelectorProps, listName: Lists.FoundWords }}/>
      <ListSelector {...{ ...listSelectorProps, listName: Lists.MissedWords }}/>
    </div>
  </div>
}

export default Results
