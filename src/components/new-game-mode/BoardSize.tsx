import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'

import { getClass } from './util'

import Description from './Description'
import Radio from '../Radio'
import { useCallback, useState } from 'react'

const {
  optionClass
} = getClass

export type BoardSizeProps = {
  handleBoardSizeChange: (size: number) => void,
  sizes: number[] 
}

const BoardSize = ({
  handleBoardSizeChange,
  sizes
}: BoardSizeProps) => {
  const [boardSize, setBoardSize] = useState(0)
  const title = 'Board Size'
  const prefix = 'new-game-mode'
  const ruleClass = title.toLowerCase().replace(/\s+/g, '-')

  const handleChange = useCallback((size: number) => {
    if (!sizes.includes(size)) return
    setBoardSize(size)
    handleBoardSizeChange(size)
  }, [handleBoardSizeChange, setBoardSize, sizes])

  return <div className={`${prefix}-container ${prefix}-${ruleClass}-container`}>
    <Description {...{ title, svg: GridView }}/>
    <div>
        {sizes.map(size => {
          const id = `${size}x${size}`
          return <div className={optionClass('board-size')}>
            <Radio
              group="board-size"
              value={size}
              id={id}
              title={id}
              onChange={handleChange}
              checked={boardSize===size}
            />
          </div>
        })}
    </div>
  </div>
}

export default BoardSize
