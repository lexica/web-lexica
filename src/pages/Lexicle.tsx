import {ReactComponent as Calendar } from '@material-design-icons/svg/round/calendar_today.svg'
import {ReactComponent as Shuffle } from '@material-design-icons/svg/round/shuffle.svg'
import { useCallback, useMemo } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ReactComponent as Unchecked } from '@material-design-icons/svg/round/check_box_outline_blank.svg'
import { ReactComponent as Checked } from '@material-design-icons/svg/round/check_box.svg'
import Button, { ButtonFontSizing } from '../components/Button'
import MainTitle from '../components/MainTitle'
import Random from './lexicle/Random'
import WordOfTheDay from './lexicle/WordOfTheDay'
import { logger } from '../util/logger'
import Shared from './lexicle/Shared'
import { storage, useStorage } from '../util/storage'

import './Lexicle.css'

enum LocalStorage { UseWordleWords = 'use-wordle-words' }

const toggleUseWordleWords = (initialValue: boolean) => {
    const storedValue = storage.get<boolean>({ key: LocalStorage.UseWordleWords })
    const previousValue = storedValue === null ? initialValue : storedValue
    storage.set(LocalStorage.UseWordleWords, !previousValue)
}

const ChooseGameMode = (): JSX.Element => {
  const defaultUseWordleWords = /^en\b/.test(navigator.language)
  const useWordleWords = useStorage(LocalStorage.UseWordleWords, defaultUseWordleWords)

  const basePath = useMemo(
    () => `/lexicle/${useWordleWords ? '/with-wordle-words' : ''}`,
    [useWordleWords]
  )

  const handleUseWordleWordList = useCallback(() => toggleUseWordleWords(defaultUseWordleWords), [defaultUseWordleWords])

  return <div className='lexicle-choose-game-mode'>
    <div className='lexicle-title'>
      <MainTitle title='lexicle'/>
    </div>
    <div className="lexicle-game-buttons">
        <Button
          to={`${basePath}/word-of-the-day`}
          svg={Calendar}
          prompt='Word of the Day'
          fontSizing={ButtonFontSizing.Title}
        />
        <Button
          to={`${basePath}/random`}
          svg={Shuffle}
          fontSizing={ButtonFontSizing.Title}
          prompt='Random'
        />
        <Button
          onClick={handleUseWordleWordList}
          prompt='Use Wordle Word List'
          svg={useWordleWords ? Checked : Unchecked}
        />
      </div>
    </div>
}

const Lexicle = (): JSX.Element => {
  logger.debug('Reloading lexicle main screen')
  return <div className='lexicle'>
    <Routes >
      <Route path="/" element={<ChooseGameMode/>} />
      <Route path="/random" element={<Random />} />
      <Route path="/with-wordle-words/random" element={<Random useWordleWords/>} />
      <Route path="/word-of-the-day" element={<WordOfTheDay />} />
      <Route path="/with-wordle-words/word-of-the-day" element={<WordOfTheDay useWordleWords/>} />
      <Route path="/shared/*" element={<Shared/>} />
    </Routes>
  </div>
}

export default Lexicle
