import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'

import { getClass } from './util'

import Description from './Description'
import Radio from '../Radio'
import { useCallback, useContext, useState } from 'react'
import { Translations } from '../../translations'

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
  const { translationsFn } = useContext(Translations)
  const title = translationsFn('pages.newGameMode.boardSize')

  const handleChange = useCallback((size: number) => {
    if (!sizes.includes(size)) return
    setBoardSize(size)
    handleBoardSizeChange(size)
  }, [handleBoardSizeChange, setBoardSize, sizes])

  return <Description title={title} svg={GridView}>
    <div>
      {sizes.map((size, index) => {
        const id = `${size}x${size}`
        return <div
          className={optionClass('board-size')}
          key={`board-size-${index}`}
        >
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
  </Description>
}

export default BoardSize
