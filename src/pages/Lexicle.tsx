import {ReactComponent as Calendar } from '@material-design-icons/svg/round/calendar_today.svg'
import {ReactComponent as Shuffle } from '@material-design-icons/svg/round/shuffle.svg'
import { useState, useMemo } from 'react'
import { BrowserRouter, Link, Route } from 'react-router-dom'
import { ReactComponent as Unchecked } from '@material-design-icons/svg/round/check_box_outline_blank.svg'
import { ReactComponent as Checked } from '@material-design-icons/svg/round/check_box.svg'
import MainTitle from '../components/MainTitle'
import Svg from '../components/Svg'
import { useConstants } from '../style/constants'
import { makeClasses } from '../util/classes'

import './Lexicle.css'
import Random from './lexicle/Random'
import WordOfTheDay from './lexicle/WordOfTheDay'
import { logger } from '../util/logger'
import Shared from './lexicle/Shared'

const ChooseGameMode = (): JSX.Element => {
  const { fontSizeTitle } = useConstants()
  const classes = makeClasses('lexicle-button-defaults', 'lexicle-play-game-button')

  const [useWordleWords, setUseWordleWords] = useState(/^en\b/.test(navigator.language))

  const baseUrl = useMemo(
    () => `${useWordleWords ? '/with-wordle-words' : ''}`,
    [useWordleWords]
  )

  return <div className='lexicle-choose-game-mode'>
    <div className='lexicle-title'>
      <MainTitle title='lexicle'/>
    </div>
    <div className="lexicle-game-buttons">
        <Link
          to={`${baseUrl}/word-of-the-day`}
          className={classes}
        >
          <Svg.Customizable svg={Calendar} props={{
            title: 'Word of the Day',
            height: fontSizeTitle,
            width: fontSizeTitle
          }}/>
          Word of the Day
        </Link>
        <Link
          to={`${baseUrl}/random`}
          className={classes}
        >
          <Svg.Customizable svg={Shuffle} props={{
            title: 'Random',
            height: fontSizeTitle,
            width: fontSizeTitle,
          }}/>
          Random
        </Link>
        <div
          className={classes}
          onClick={() => setUseWordleWords(p => !p)}
        >
          Use Wordle Word List: 
          <Svg.Customizable svg={useWordleWords ? Checked : Unchecked} props={{
            title: 'Use Wordle Word List',
            height: fontSizeTitle,
            width: fontSizeTitle,
          }}/>
        </div>
      </div>
    </div>
}

const Lexicle = (): JSX.Element => {
  logger.debug('Reloading lexicle main screen')
  return <div className='lexicle'>
    <BrowserRouter basename="/web-lexica/lexicle">
      <Route exact path="/">
        <ChooseGameMode/>
      </Route>
      <Route path="/random">
        <Random />
      </Route>
      <Route path="/with-wordle-words/random">
        <Random useWordleWords/>
      </Route>
      <Route path="/word-of-the-day">
        <WordOfTheDay />
      </Route>
      <Route path="/with-wordle-words/word-of-the-day">
        <WordOfTheDay useWordleWords/>
      </Route>
      <Route path="/shared">
        <Shared/>
      </Route>
    </BrowserRouter>
  </div>
}

export default Lexicle
