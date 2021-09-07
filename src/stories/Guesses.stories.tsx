import { ComponentStory, ComponentMeta } from '@storybook/react'

import Guesses, { GuessOrientation } from '../components/Guesses'

export default {
  title: 'Guess list',
  component: Guesses,
  argTypes: {
    dictionary: {
      defaultValue: [''],
      description: 'A list of valid words, does not need to container every possible valid word, but at least all valid words that appear in `guesses`',
      name: 'dictionary',
    },
    guesses: {
      defaultValue: [''],
      description: 'A list of guesses made during a game',
      name: 'guesses'
    },
    orientation: {
      defaultValue: GuessOrientation.Horizontal,
      description: 'The flow of the listed guesses, either stacked vertically, or side by side horizontally',
      name: 'orientation'
    }
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
