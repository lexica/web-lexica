import { ComponentStory, ComponentMeta } from '@storybook/react'

import MostRecentGuess from '../components/MostRecentGuess'

const defaults = {
  dictionary: ['correct'],
  guesses: ['incorrect'],
  currentLetterChain: '',
}

const componentMeta: ComponentMeta<typeof MostRecentGuess> = {
  title: 'Most Recent Guess',
  argTypes: {
    guesses: {
      description: 'All previous guesses made during the current game',
      defaultValue: [''],
      name: 'guesses'
    },
    dictionary: {
      description: 'List of valid words, does not need to be full dictionary, usually is set to any "found" words during the current game',
      defalutValue: [''],
      name: 'dictionary'
    },
    currentLetterChain: {
      description: 'the "in-progress" guess of a user',
      defaultValue: '',
      name: 'currentLetterChain',
    },
  },
  args: {
    ...defaults,
  },
  component: MostRecentGuess
}

export default componentMeta

export const Template: ComponentStory<typeof MostRecentGuess> = args => <MostRecentGuess {...args}/>

export const CorrectFirstGuess = Template.bind({})
CorrectFirstGuess.args = {
  dictionary: ['correct'],
  guesses: ['correct'],
  currentLetterChain: '',
}

export const RepeatCorrectGuess = Template.bind({})
RepeatCorrectGuess.args = {
  dictionary: ['correct'],
  guesses: ['correct', 'correct', 'correct'],
  currentLetterChain: '',
}

export const IncorrectGuess = Template.bind({})
IncorrectGuess.args = {
  dictionary: ['correct'],
  guesses: ['correct', 'correct', 'correct', 'incorrect'],
  currentLetterChain: '',
}
