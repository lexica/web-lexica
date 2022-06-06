import { useCallback, useState, useMemo } from 'react'
import { ReactComponent as Save } from '@material-design-icons/svg/round/save.svg'

import Svg from '../components/Svg'
import Name from '../components/new-game-mode/Name'
import TimeLimit from '../components/new-game-mode/TimeLimit'
import ScoringType from '../components/new-game-mode/ScoringType'

import { makeClasses } from '../util/classes'
import { ScoreType } from '../game/score'
import { logger } from '../util/logger'
import { Renderable, useRenderInBanner } from '../components/Banner'
import constants from '../style/constants'
import { addRuleset, setCurrentRuleset } from '../game/rules'
import { Duration } from 'duration-fns'
import { useNavigate } from 'react-router-dom'
import BoardSize from '../components/new-game-mode/BoardSize'
import MinimumWordLength from '../components/new-game-mode/MinimumWordLength'

import './NewGameMode.css'
import TimeAttack from '../components/new-game-mode/TimeAttack'

const validTimeLimit = (time: number) => time > 0
const validName = (name: string) => /([\w\s\d_-]+)/.test(name)
const boardSizes = [4, 5, 6]
const scoreTypes = [ScoreType.Length, ScoreType.Letters]
const wordLengths = [3, 4, 5, 6]
const timeAttackMultipliers = [0, 1, 2, 3, 4, 5]

const isValidTimeAttackMultiplier = (multiplier: number) => multiplier >= 0

type SaveGameModeProps = { isValid: boolean, handleSave: () => void }

const SaveGameMode = ({ isValid, handleSave }: SaveGameModeProps): Renderable => ({
  maxWidth,
  maxHeight
}) => {
  const showName = maxWidth / maxHeight > 7.5

  const classes = makeClasses(
    'new-game-mode-submit-button',
    'banner-rendered-prop-container',
    { condition: !isValid, name: 'new-game-mode-submit-button-disabled' }
  )

  return <div className={classes} onClick={handleSave} >
    <Svg.Customizable
      svg={Save}
      props={{
        title: 'Save Game Mode',
        fill: isValid ? constants.colorContentDark : constants.colorContentLowContrastDark,
        width: maxHeight * .8,
        height: maxHeight * .8
      }}
    />
    {showName ? <div className={makeClasses(
      'new-game-mode-submit-label',
      'banner-rendered-prop-label'
    )}> Save Game Mode </div> : ''}
  </div>
}

const NewGameMode = (): JSX.Element => {
  const [timeAttack, setTimeAttack] = useState(0)

  const [name, setName] = useState('')
  const [timeLimit, setTimeLimit] = useState(0)
  const [boardSize, setBoardSize] = useState(0)
  const [scoreType, setScoreType] = useState<ScoreType>('invalid' as any)
  const [minimumWordLength, setMinimumWordLength] = useState(0)


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

  const BannerElement = useMemo(() => SaveGameMode({ isValid, handleSave }), [isValid, handleSave])

  useRenderInBanner(BannerElement)

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
