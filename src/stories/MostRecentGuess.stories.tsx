import { StoryFn, Meta } from '@storybook/react'

import MostRecentGuess from '../components/game/MostRecentGuess'
import Providers from './Providers'

const defaults = {
  foundWords: ['correct'],
  guesses: ['incorrect'],
  currentGuess: '',
}

const ComponentBuilder: React.FC<{
  foundWords: string[],
  guesses: string[],
  currentGuess: string,
  isGuessing: boolean
}> = ({
  foundWords,
  currentGuess,
  guesses,
  isGuessing,
}) => {

  return <Providers 
    guess={{
      currentGuess,
      isGuessing,
      guesses
    }}
    score={{
      foundWords
    }}
  >
    <MostRecentGuess/>
  </Providers>
}

// const componentMeta: Meta<typeof ComponentBuilder> = {
const componentMeta: Meta = {
  title: 'Most Recent Guess',
  argTypes: {
    GuessContext: {
      description: 'This component requires the Guess context in order to function properly',
      name: 'Guess Context'
    },
    ScoreContext: {
      description: 'This component requires the Score context in order to function properly',
      name: 'Score Context'
    },
  },
  args: {
    ...defaults,
  },
  component: MostRecentGuess
}

export default componentMeta

export const Template: StoryFn<typeof ComponentBuilder> = args => <ComponentBuilder {...args}/>

export const CorrectFirstGuess = Template.bind({})
CorrectFirstGuess.args = {
  foundWords: ['correct'],
  guesses: ['correct'],
  currentGuess: '',
  isGuessing: false
}

export const RepeatCorrectGuess = Template.bind({})
RepeatCorrectGuess.args = {
  foundWords: ['correct'],
  guesses: ['correct', 'correct', 'correct'],
}

export const IncorrectGuess = Template.bind({})
IncorrectGuess.args = {
  foundWords: ['correct'],
  guesses: ['correct', 'correct', 'correct', 'incorrect'],
}

export const InProgressGuess = Template.bind({})
InProgressGuess.args = {
  isGuessing: true,
  currentGuess: 'onomonopia'
}
