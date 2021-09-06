import { ComponentStory, ComponentMeta } from '@storybook/react'

import MostRecentGuess from '../components/MostRecentGuess'
import { ScoreType } from '../game/rules'

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
    scoreType: {
      description: 'the way in which correct guesses will be scored, either by word lenght or by point value',
      defaultValue: ScoreType.Letters,
      name: 'scoreType'
    },
  },
  component: MostRecentGuess
}

export default componentMeta

const defaults = {
  dictionary: ['correct'],
  guesses: ['incorrect'],
  currentLetterChain: '',
  scoreType: ScoreType.Letters
}

export const Template: ComponentStory<typeof MostRecentGuess> = args => <MostRecentGuess {...{ ...defaults, ...args }}/>

export const CorrectFirstGuess = Template.bind({})
CorrectFirstGuess.args = {
  dictionary: ['correct'],
  guesses: ['correct'],
  scoreType: ScoreType.Letters,
  currentLetterChain: '',
}

export const RepeatCorrectGuess = Template.bind({})
RepeatCorrectGuess.args = {
  dictionary: ['correct'],
  guesses: ['correct', 'correct', 'correct'],
  scoreType: ScoreType.Letters,
  currentLetterChain: '',
}

export const IncorrectGuess = Template.bind({})
IncorrectGuess.args = {
  dictionary: ['correct'],
  guesses: ['correct', 'correct', 'correct', 'incorrect'],
  scoreType: ScoreType.Letters,
  currentLetterChain: '',
}
