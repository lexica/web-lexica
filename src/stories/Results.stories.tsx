
import { ComponentMeta, ComponentStory } from '@storybook/react'
import Results from '../components/Results'
import ScoredWordList from '../components/ScoredWordList'
import Score from '../components/Score'
import Cheats from './Cheats'
import Providers from './Providers'
import { ScreenOrientation } from '../util/hooks'

const ComponentBuilder: React.FC<{
  score: {
    foundWords: string[],
    remainingWords: string[]
  }
}> = ({
  score,
}) => <Providers score={score}><Results /></Providers>

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

const metadata: ComponentMeta<typeof ComponentBuilder> = {
  title: 'Results',
  argTypes: {
    ScoreContext: {
      defaultValue: undefined,
      description: 'This component requires the score context in order to render properly',
      name: 'Score Context'
    },
  },
  args: {
    score: getLists(),
  },
  component: Results,
  subcomponents: {
    ScoredWordList,
    Score
  }
}

export default metadata

export const Template: ComponentStory<typeof ComponentBuilder> = args => <>
  <Cheats/>
  <ComponentBuilder {...args}/>
</>
