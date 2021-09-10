import { ComponentStory, ComponentMeta } from '@storybook/react'
import { useContext } from 'react'

import Providers from './Providers'
import Guesses, { GuessOrientation } from '../components/Guesses'

const GuessesBuilder: React.FC<{
  guesses: string[],
  foundWords: string[],
  orientation: GuessOrientation
}> = ({
  guesses,
  foundWords,
  orientation
}) => <Providers {...{
  guess: { guesses },
  score: { foundWords }
}}
>
  <Guesses
    orientation={orientation}
  />
</Providers>


export default {
  title: 'Guess list',
  component: Guesses,
  argTypes: {
    ScoreContext: {
      description: 'This component requires the Score context',
      name: 'Score Context',
    },
    GuessContext: {
      description: 'This component requires the Guess context',
      name: 'Guess Context'
    },
    orientation: {
      defaultValue: GuessOrientation.Horizontal,
      description: 'The flow of the listed guesses, either stacked vertically, or side by side horizontally',
      name: 'orientation'
    }
  },
} as ComponentMeta<typeof GuessesBuilder>

const Template: ComponentStory<typeof GuessesBuilder> = (args) => <GuessesBuilder {...args}/>
export const Vertical = Template.bind({})
Vertical.args = {
  guesses: ['incorrect', 'correct', 'correct',],
  foundWords: ['correct'],
  orientation: GuessOrientation.Vertical
}

export const Horizontal = Template.bind({})
Horizontal.args = {
  guesses: ['incorrect', 'correct', 'correct',],
  foundWords: ['correct'],
  orientation: GuessOrientation.Horizontal
}
