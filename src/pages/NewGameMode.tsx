import { useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { ReactComponent as Save } from '@material-design-icons/svg/round/save.svg'

import Svg from '../components/Svg'
import Name from '../components/new-game-mode/Name'
import TimeLimit from '../components/new-game-mode/TimeLimit'
import ScoringType from '../components/new-game-mode/ScoringType'

import './NewGameMode.css'
import { makeClasses } from '../util/classes'
import { ScoreType } from '../game/score'
import { logger } from '../util/logger'
import { Renderable, RenderInBanner } from '../components/Banner'
import constants from '../style/constants'
import { addRuleset, setCurrentRuleset } from '../game/rules'
import { Duration } from 'duration-fns'
import { useHistory } from 'react-router'
import BoardSize from '../components/new-game-mode/BoardSize'
import MinimumWordLength from '../components/new-game-mode/MinimumWordLength'

const validTimeLimit = (time: number) => time > 0
const validName = (name: string) => /([\w\s\d_-]+)/.test(name)
const boardSizes = [4, 5, 6]
const scoreTypes = [ScoreType.Words, ScoreType.Letters]
const wordLengths = [3, 4, 5, 6]

const NewGameMode = (): JSX.Element => {
  const [name, setName] = useState('')
  const [timeLimit, setTimeLimit] = useState(0)
  const [boardSize, setBoardSize] = useState(0)
  const [scoreType, setScoreType] = useState<ScoreType>('invalid' as any)
  const [minimumWordLength, setMinimumWordLength] = useState(0)


  const history = useHistory()

  const isValid = useMemo(() => {
    return validTimeLimit(timeLimit) &&
      boardSizes.includes(boardSize) &&
      validName(name) &&
      scoreTypes.includes(scoreType) &&
      wordLengths.includes(minimumWordLength)
  }, [timeLimit, boardSize, name, scoreType, minimumWordLength])

  const handleSave = useCallback(() => {
    logger.debug('handling save...', {
      isValid,
      timeLimit,
      boardSize,
      name,
      scoreType,
      minimumWordLength,
    })
    if (!isValid) return
    const id = addRuleset({
      boardWidth: boardSize,
      minimumWordLength,
      score: scoreType,
      name,
      time: { minutes: timeLimit } as Duration
    })

    setCurrentRuleset(id)

    history.push('/')
  }, [
    isValid,
    timeLimit,
    boardSize,
    name,
    scoreType,
    minimumWordLength,
    history
  ])

  const BannerElement = useCallback<Renderable>(({ maxWidth, maxHeight }) => {
    const showName = maxWidth / maxHeight > 6.5

    const classes = makeClasses(
      'new-game-mode-submit-button',
      {
        condition: !isValid,
        name: 'new-game-mode-submit-button-disabled'
      }
    )

    return <div
      className={classes}
      onClick={handleSave}
    >
      <Svg.Customizable
        svg={Save}
        props={{
          title: 'Save Game Mode',
          fill: isValid
            ? constants.colorContentLowContrastDark
            : constants.colorBackgroundDark,
          width: maxHeight,
          height: maxHeight
        }}
      />
      {
        showName
          ? <div className="new-game-mode-submit-label">
              Save Game Mode
            </div>
          : ''
      }
    </div>
  }, [isValid, handleSave])

  const { setElement, cleanUp } = useContext(RenderInBanner)

  useEffect(() => {
    setElement(BannerElement)
    return cleanUp
  }, [BannerElement, setElement, cleanUp])

  return <div className="Page new-game-mode">
    <Name handleNameUpdate={setName} />
    <TimeLimit handleTimeUpdate={setTimeLimit} />
    <BoardSize handleBoardSizeChange={setBoardSize} sizes={boardSizes} />
    <ScoringType handleScoreUpdate={setScoreType} scoreTypes={scoreTypes} />
    <MinimumWordLength handleLengthUpdate={setMinimumWordLength} wordLengths={wordLengths} />
  </div>
}

export default NewGameMode
