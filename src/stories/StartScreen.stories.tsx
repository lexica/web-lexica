import { ComponentMeta, ComponentStory } from '@storybook/react'

import StartScreen from '../components/StartScreen'
import Cheats from './Cheats'
import Providers from './Providers'

const metadata: ComponentMeta<typeof ComponentBuilder> = {
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
      description: 'the loading state of the language metadata and dictionary processing',
      name: 'loading'
    },
    error: {
      description: 'the error state of the language metadata being loaded',
      name: 'error'
    }
  },
  args: {
    dictionary: {
      boardDictionary: ['hero', 'green', 'wednesday']
    },
    error: false,
    loading: false
  }
}

export default metadata

const ComponentBuilder: React.FC<{
  dictionary: {
    boardDictionary: string[],
  },
  loading: boolean,
  error: boolean
}> = ({
  dictionary,
  loading,
  error
}) => <Providers dictionary={dictionary}>
  <Cheats/>
  <StartScreen {...{ loading, error, handleStart: () => {}}}/>
</Providers>

export const Template: ComponentStory<typeof ComponentBuilder> = args => <ComponentBuilder {...args}/>
