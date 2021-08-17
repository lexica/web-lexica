import { useState } from 'react'

const Letter: React.FC<{
  letter: string,
  handleMouseOver: (...a: any[]) => void,
  rowIndex: number,
  columnIndex: number
}> = ({
  letter,
  handleMouseOver
}) => {
  // const [isActive, updateIsActive] = useState(false)

  return <div className="spacer">
    <div
      className="letter"
      onMouseOver={() => handleMouseOver(letter)}
    >
      {letter}
    </div>
  </div>
}

const Row: React.FC<{ rowIndex: number }> = ({ rowIndex, children }) => <div id={rowIndex.toString()}>{children}</div>


const Board: React.FC<{ board: string[][] }> = ({ board }) => {
  const [mouseClicked, updateMouseClicked] = useState(false)

  const handleMouseOver = (letter: string, rowIndex: number, columnIndex: number) => {
    if (!mouseClicked) return
  }
  return (<div className="">
    {board.map((row, rowIndex) => {
      return <Row rowIndex={rowIndex}>{row.map((letter, columnIndex) => <Letter {...{ letter, columnIndex, rowIndex, handleMouseOver }}/>)}</Row>
      
    })}
  </div>)
}

export default Board
