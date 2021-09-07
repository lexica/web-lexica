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

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Component theme testing',
    defaultValue: 'dark',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark'],
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

export const decorators = [
  withTheme
]
