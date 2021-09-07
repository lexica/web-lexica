import { ComponentMeta, ComponentStory } from '@storybook/react'

import Score from '../components/Score'

const metadata: ComponentMeta<typeof Score> = {
  title: 'Score',
  argTypes: {
    remainingWords: {
      defaultValue: undefined,
      description: 'Words that the user has not found but are possible given the current board',
      name: 'remainingWords'
    },
    foundWords: {
      description: 'Words that the user has found during the game',
      name: 'foundWords'
    },
    remainingTime: {
      description: 'This component doubles as both the in-game and post-game scoreboard. remainingTime represents the amount of time left in a game',
      name: 'remainingTime'
    },
    hideTime: {
      description: 'Flag for hiding the remaining time',
      defaultValue: false,
      name: 'hideTime'
    },
    showPercent: {
      description: 'Flag for showing the percentage of a score, either for points out of total possible points or for found wourds out of all possible words',
      defaultValue: false,
      name: 'showPercent'
    }
  },
  args: {
    remainingTime: 0,
    remainingWords: ['thyme', 'parsley', 'sage'],
    foundWords: ['rosemary'],
    hideTime: false,
    showPercent: false
  },
  component: Score
}

export default metadata

export const Template: ComponentStory<typeof Score> = (args) => <Score {...args}/>

export const HideTime = Template.bind({})
HideTime.args = {
  remainingTime: 0,
  remainingWords: ['thyme', 'parsley', 'sage'],
  foundWords: ['rosemary'],
  hideTime: true,
  showPercent: false
}

export const ShowPercent = Template.bind({})
ShowPercent.args = {
  remainingTime: 0,
  remainingWords: ['thyme', 'parsley', 'sage'],
  foundWords: ['rosemary'],
  hideTime: false,
  showPercent: true
}
