import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Dispatch, Reducer, useReducer } from 'react';

import { Board } from '../components/Board';
import { Board as BoardObject, Coordinates, deepCopyBoard, getBoard, getLine } from '../game/board';
import { ClickInfo, GameAction, GameContext, HoverInfo } from '../game/context';
import { Rules, ScoreType } from '../game/rules';

const metadata: ComponentMeta<typeof Board> = {
  title: 'Game Board',
  component: Board,
  argTypes: {
    board: {
      description: 'a psuedo 2d array that contains both the letter in a given position, and metadata on wether or not it has been "visited"',
      defaultValue: undefined,
      name: 'board'
    }
  },
}

export default metadata

type MiniState = {
  board: BoardObject,
  clicked: boolean,
  lastLocation: Coordinates
}

const handleClick = (originalBoard: BoardObject, state: MiniState, info: ClickInfo): MiniState => {
  const { clicked, board, lastLocation } = state
  const beginClick = !clicked && info.clicked
  const endClick = clicked && !info.clicked

  if (beginClick) {
    const { row, column } = lastLocation

    board[row][column].visited = true

    return { board, clicked: true, lastLocation }
  }

  if (endClick) return { board: deepCopyBoard(originalBoard), clicked: false, lastLocation }

  return state
}

const handleHover = (state: MiniState, info: HoverInfo): MiniState => {
  const { board, clicked } = state

  if (clicked) {
    const { coordinates: { row, column } } = info

    board[row][column].visited = true

    return { ...state, board, clicked, lastLocation: info.coordinates }
  }

  return { ...state, lastLocation: info.coordinates }
}

const useMiniReducer = (originalBoard: BoardObject): [BoardObject, Dispatch<GameAction>] => {
  const [{ board: state }, dispatch] = useReducer<Reducer<MiniState, GameAction>>(
    (state, action) => action.type === 'click'
      ? handleClick(originalBoard, state, action.info as ClickInfo)
      : handleHover(state, action.info as HoverInfo),
    { board: deepCopyBoard(originalBoard), clicked: false, lastLocation: { row: 0, column: 0 } }
  )

  return [state, dispatch]
}

const Template: ComponentStory<typeof Board> = (args) => {
  const [board, dispatch] = useMiniReducer(args.board)
  return <GameContext.Provider
    value={dispatch as any}
  >
    <Rules.Provider
      value={{
        board: getLine(args.board),
        language: 'en_US',
        minimumVersion: 0,
        minimumWordLength: 4,
        score: ScoreType.Letters,
        time: 0,
        version: 0
      }}
    >
      <Board {...{ ...args, board }}/>
    </Rules.Provider>
  </GameContext.Provider>
};

export const FourByFour = Template.bind({});
FourByFour.args = {
  board: getBoard('aaaabbbbccccdddd'),
};

export const FiveByFive = Template.bind({});
FiveByFive.args = {
  board: getBoard('aaaaabbbbbcccccdddddeeeee')
};

export const SixBySix = Template.bind({});
SixBySix.args = {
  board: getBoard('aaaaaabbbbbbccccccddddddeeeeeeffffff')
};
