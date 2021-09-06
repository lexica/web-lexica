import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Board } from '../components/Board';
import { getBoard, getLine } from '../game/board';
import { GameContext } from '../game/context';
import { Rules, ScoreType } from '../game/rules';

export default {
  title: 'Game Board',
  component: Board,
  argTypes: {
    board: getBoard('aaaaaabbbbbbccccccddddddeeeeeeffffff')
  },
} as ComponentMeta<typeof Board>;

const Template: ComponentStory<typeof Board> = (args) => <GameContext.Provider
  value={(...args: any[]) => console.log(args) as any}
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
    <Board {...args} />
  </Rules.Provider>
</GameContext.Provider>;

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
