import { ComponentMeta, ComponentStory } from '@storybook/react'

import ScoredWords, { ScoredWordsProps } from '../components/ScoredWordList'
import { ScoreType } from '../game/rules'

const metadata: ComponentMeta<typeof ScoredWords> = {
  title: 'ScoredWords',
  argTypes: {
    scoredWords: {
      description: 'A list of words that should be scored. If they are invalid words, they will still be displayed and scored',
      name: 'scoredWords'
    },
    scoreType: {
      description: 'Enum value of either "l" or "w", please see `./game/rules` for full enum',
      name: 'scoreType'
    }
  },
  args: {
    scoreType: ScoreType.Letters,
    scoredWords: ['flibbertygibbit', 'onomonopia']
  },
  component: ScoredWords
}

export default metadata

export const Template: ComponentStory<typeof ScoredWords> = args => <ScoredWords {...args}/>

export const ScoredByWordlength = Template.bind({})
ScoredByWordlength.args = {
  scoreType: ScoreType.Words
}

export const ScoredByLetter = Template.bind({})
ScoredByLetter.args = {
  scoreType: ScoreType.Letters
}
