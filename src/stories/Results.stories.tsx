
import { ComponentMeta, ComponentStory } from '@storybook/react'
import Results, { ResultsOrientation } from '../components/Results'
import ScoredWordList from '../components/ScoredWordList'
import Score from '../components/Score'
import { Rules, ScoreType } from '../game/rules'
import Cheats from './Cheats'

const getLists = () => ({
  foundWords: [
    'alfalfa',
    'geronemo',
    'onomonopia',
    'wellington'
  ],
  remainingWords: [
    'the',
    'isnt',
    'rest',
    'hellogoodbyenicetoknowyou'
  ]
})

const metadata: ComponentMeta<typeof Results> = {
  title: 'Results',
  argTypes: {
    foundWords: {
      defaultValue: undefined,
      description: 'A list of words found by the user throughout the course of a game',
      name: 'foundWords'
    },
    remainingWords: {
      defaultValue: undefined,
      description: 'A list of words that the player did not find, but that were possible given the board',
      name: 'remainingWords'
    },
    orientation: {
      defaultValue: undefined,
      description: 'The orientation that the results page should use when rendering itself',
      name: 'orientation'
    }
  },
  args: {
    ...getLists(),
    orientation: ResultsOrientation.Horizontal
  },
  component: Results,
  subcomponents: {
    ScoredWordList,
    Score
  }
}

export default metadata

export const Template: ComponentStory<typeof Results> = args => <Rules.Provider
  value={{
    board: 'abcdefghijklmnop',
    language: 'en_US',
    minimumVersion: 0,
    version: 0,
    minimumWordLength: 1,
    score: ScoreType.Letters,
    time: 0
  }}
>
  <Cheats>
    <Results {...args}/>
  </Cheats>
</Rules.Provider>

export const HorizontalLayout = Template.bind({})
HorizontalLayout.args = {
  ...getLists(),
  orientation: ResultsOrientation.Horizontal
}
