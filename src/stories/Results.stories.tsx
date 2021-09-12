
import { ComponentMeta, ComponentStory } from '@storybook/react'
import Results, { ResultsOrientation } from '../components/Results'
import ScoredWordList from '../components/ScoredWordList'
import Score from '../components/Score'
import Cheats from './Cheats'
import Providers from './Providers'

const ComponentBuilder: React.FC<{
  score: {
    foundWords: string[],
    remainingWords: string[]
  },
  orientation: ResultsOrientation
}> = ({
  score,
  orientation
}) => <Providers score={score}><Results orientation={orientation}/></Providers>

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
    orientation: {
      defaultValue: undefined,
      description: 'The orientation that the results page should use when rendering itself, the vertical orientation allows for swapping between lists to save screen realistate',
      name: 'orientation'
    }
  },
  args: {
    score: getLists(),
    orientation: ResultsOrientation.Horizontal
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

export const HorizontalLayout = Template.bind({})
HorizontalLayout.args = {
  orientation: ResultsOrientation.Horizontal
}

export const VerticalLayout = Template.bind({})
VerticalLayout.args = {
  orientation: ResultsOrientation.Vertical
}
