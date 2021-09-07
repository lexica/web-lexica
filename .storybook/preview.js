export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

import Theme from '../src/components/Theme'
import { Rules } from '../src/game/rules'

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Component theme testing',
    defaultValue: 'dark',
    toolbar: {
      icon: 'circlehollow',
      items: [{ value: 'light', title: 'Light' }, { value: 'dark', title: 'Dark' }],
      showName: true
    }
  },
  score: {
    name: 'Score Type',
    description: 'How the stories should score words',
    defaultValue: 'w',
    toolbar: {
      icon: 'star',
      items: [
        { value: 'w', title: 'Word Length' },
        { value: 'l', title: 'Letter Score'}
      ],
      showName: true
    }
  },
  board: {
    name: 'Board',
    description: 'The board to be used while rendering stories',
    defaultValue: 'aaaabbbbccccdddd',
    toolbar: {
      icon: 'grid',
      items: [
        { value: 'aaaabbbbccccdddd', title: '4x4' },
        { value: 'aaaaabbbbbcccccdddddeeeee', title: '5x5' },
        { value: 'aaaaaabbbbbbccccccddddddeeeeeeffffff', title: '6x6' }
      ],
      showName: true
    }
  },
  language: {
    name: 'Language',
    description: 'The language used when scoring the stories',
    defaultValue: 'en_US',
    toolbar: {
      icon: 'info',
      items: [
        { value: 'en_US', title: 'English (US)' }
      ],
      showName: true
    }
  },
  time: {
    name: 'Time',
    description: 'The "remaining time" to be used in stories',
    defaultValue: 0,
    toolbar: {
      icon: 'timer',
      items: [
        { value: 180, title: '3m' },
        { value: 0, title: '0m' }
      ],
      showName: true
    }
  }
}

const withTheme = (Story, context) => {
  const theme = context.globals.theme
  return <Theme theme={theme}>
    <Story {...context}/>
  </Theme>
}

const withRules = (Story, context) => {
  const {
    score,
    board,
    language,
    time
  } = context.globals
  return <Rules.Provider
    value={{
      score,
      board,
      language,
      time,
      minimumVersion: 0,
      version: 0,
      minimumWordLength: 3
    }}
  >
    <Story {...context}/>
  </Rules.Provider>
}

export const decorators = [
  withTheme,
  withRules
]
