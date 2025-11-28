import { useCallback, useState, useMemo, useContext } from 'react'
import Save from '@material-design-icons/svg/round/save.svg'

import Name from '../components/new-game-mode/Name'
import TimeLimit from '../components/new-game-mode/TimeLimit'
import ScoringType from '../components/new-game-mode/ScoringType'

import { ScoreType, type ScoreTypeType } from '../game/score'
import { logger } from '../util/logger'
import { useBannerBadge } from '../components/Banner'
import { addRuleset, setCurrentRuleset } from '../game/rules'
import { type Duration } from 'duration-fns'
import { useNavigate } from 'react-router-dom'
import BoardSize from '../components/new-game-mode/BoardSize'
import MinimumWordLength from '../components/new-game-mode/MinimumWordLength'

import './NewGameMode.css'
import TimeAttack from '../components/new-game-mode/TimeAttack'
import { Translations } from '../translations'

const validTimeLimit = (time: number) => time > 0
const validName = (name: string) => /([\w\s\d_-]+)/.test(name)
const boardSizes = [4, 5, 6]
const scoreTypes = [ScoreType.Length, ScoreType.Letters]
const wordLengths = [3, 4, 5, 6]
const timeAttackMultipliers = [0, 1, 2, 3, 4, 5]

const isValidTimeAttackMultiplier = (multiplier: number) => multiplier >= 0

const NewGameMode = (): JSX.Element => {
  const [timeAttack, setTimeAttack] = useState(0)

  const [name, setName] = useState('')
  const [timeLimit, setTimeLimit] = useState(0)
  const [boardSize, setBoardSize] = useState(0)
  const [scoreType, setScoreType] = useState<ScoreTypeType>('invalid' as any)
  const [minimumWordLength, setMinimumWordLength] = useState(0)

  const { translationsFn } = useContext(Translations)


  const navigate = useNavigate()

  const isValid = useMemo(() => {
    return validTimeLimit(timeLimit) &&
      boardSizes.includes(boardSize) &&
      validName(name) &&
      scoreTypes.includes(scoreType) &&
      wordLengths.includes(minimumWordLength) &&
      isValidTimeAttackMultiplier(timeAttack)
  }, [timeLimit, boardSize, name, scoreType, minimumWordLength, timeAttack])

  const handleSave = useCallback(() => {
    logger.debug(
      'handling save...',
      { isValid, timeLimit, boardSize, name, scoreType, minimumWordLength, }
    )
    if (!isValid) return
    const id = addRuleset({
      boardWidth: boardSize,
      minimumWordLength,
      score: scoreType,
      name,
      time: { minutes: timeLimit } as Duration,
      timeAttack
    })

    setCurrentRuleset(id)

    navigate('/')
  }, [isValid, timeLimit, boardSize, name, scoreType, minimumWordLength, navigate, timeAttack])

  useBannerBadge({
    disabled: !isValid,
    svg: Save,
    svgTitle: translationsFn('pages.newGameMode.saveGameMode'),
    onClick: handleSave,
    prompt: translationsFn('pages.newGameMode.saveGameMode')
  })

  return <div className="Page new-game-mode">
    <Name handleNameUpdate={setName} />
    <TimeLimit handleTimeUpdate={setTimeLimit} />
    <BoardSize handleBoardSizeChange={setBoardSize} sizes={boardSizes} />
    <ScoringType handleScoreUpdate={setScoreType} scoreTypes={scoreTypes} />
    <MinimumWordLength handleLengthUpdate={setMinimumWordLength} wordLengths={wordLengths} />
    <TimeAttack handleTimeAttackUpdate={setTimeAttack} timeAttackMultipliers={timeAttackMultipliers} selectedMultiplier={timeAttack} />
  </div>
}

export default NewGameMode
