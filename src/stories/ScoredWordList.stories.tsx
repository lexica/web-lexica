import { ComponentMeta, ComponentStory } from '@storybook/react'

import ScoredWords from '../components/game/ScoredWordList'

const metadata: ComponentMeta<typeof ScoredWords> = {
  title: 'ScoredWords',
  argTypes: {
    scoredWords: {
      description: 'A list of words that should be scored. If they are invalid words, they will still be displayed and scored',
      name: 'scoredWords'
    },
  },
  args: {
    scoredWords: ['flibbertygibbit', 'onomonopia']
  },
  component: ScoredWords
}

export default metadata

export const Template: ComponentStory<typeof ScoredWords> = args => <ScoredWords {...args}/>
