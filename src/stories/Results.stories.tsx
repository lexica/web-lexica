
import { Meta, StoryFn } from '@storybook/react'
import Results from '../components/ResultsScreen'
import ScoredWordList from '../components/game/ScoredWordList'
import Score from '../components/game/Score'
import Cheats from './Cheats'
import Providers from './Providers'

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

const metadata: Meta = {
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
    ScoreWordList: ScoredWordList as any,
    Score: Score as any
  }
}

export default metadata

export const Template: StoryFn<typeof ComponentBuilder> = args => <>
  <Cheats/>
  <ComponentBuilder {...args}/>
</>
