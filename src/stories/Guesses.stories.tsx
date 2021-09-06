import { ComponentStory, ComponentMeta } from '@storybook/react'

import Guesses, { GuessOrientation } from '../components/Guesses'

export default {
  title: 'Guess list',
  component: Guesses,
  argTypes: {
    dictionary: ['word'],
    guesses: ['guess'],
    orientation: GuessOrientation
  },
} as ComponentMeta<typeof Guesses>

const Template: ComponentStory<typeof Guesses> = ({ guesses, dictionary, orientation }) => <Guesses
  guesses={guesses}
  dictionary={dictionary}
  orientation={orientation}
/>

export const Vertical = Template.bind({})
Vertical.args = {
  guesses: ['incorrect', 'correct', 'correct',],
  dictionary: ['correct'],
  orientation: GuessOrientation.Vertical
}

export const Horizontal = Template.bind({})
Horizontal.args = {
  guesses: ['incorrect', 'correct', 'correct',],
  dictionary: ['correct'],
  orientation: GuessOrientation.Horizontal
}

// export const SixBySix = Template.bind({})
// SixBySix.args = {
//   board: getBoard('aaaaaabbbbbbccccccddddddeeeeeeffffff')
// }

