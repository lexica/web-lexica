import { ComponentMeta, ComponentStory } from '@storybook/react'

import StartScreen from '../components/StartScreen'
import { Rules, ScoreType } from '../game/rules'
import Cheats from './Cheats'

const metadata: ComponentMeta<typeof StartScreen> = {
  title: 'StartScreen',
  component: StartScreen,
  argTypes: {
    handleStart: {
      description: 'A callback used when the user wishes to start the game.',
      name: 'handleStart'
    },
    dictionary: {
      description: 'a list of words that is possible given the current board',
      name: 'dictionary'
    },
    loading: {
      description: 'the loading state of the `dictionary` to be used during the game, true means the dictionary is still loading',
      name: 'loading'
    },
    error: {
      description: 'the error state of the dictionary being loaded',
      name: 'error'
    }
  },
  args: {
    handleStart: () => {},
    dictionary: ['hero', 'green', 'wednesday'],
    error: false,
    loading: false
  }
}

export default metadata

export const Template: ComponentStory<typeof StartScreen> = args => <Rules.Provider
  value={{
    board: 'aaaabbbbccccdddd',
    language: 'en_US',
    minimumVersion: 0,
    version: 0,
    minimumWordLength: 2,
    score: ScoreType.Words,
    time: 180
  }}
>
  <StartScreen {...args}/>
  <Cheats/>
</Rules.Provider>
