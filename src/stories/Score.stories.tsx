import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useContext, useEffect } from 'react'

import Score from '../components/Score'
import { Rules } from '../game/rules'
import { useTimer } from '../game/timer'
import Providers from './Providers'

const ComponentBuilder: React.FC<{
  hideTime: boolean,
  showPercent: boolean
  score: {
    foundWords: string[],
    remainingWords: string[],
  },
}> = ({
  hideTime,
  showPercent,
  score
}) => {
  const rules = useContext(Rules)
  const timer = useTimer(rules.time, () => {})

  const { startTime } = timer

  useEffect(() => {
    startTime()
  }, [startTime])

  return <Providers score={score} timer={timer}>
    <Score hideTime={hideTime} showPercent={showPercent}/>
  </Providers>
}

const metadata: ComponentMeta<typeof ComponentBuilder> = {
  title: 'Score',
  argTypes: {
    ScoreContext: {
      description: 'This component requires the Score context to work properly',
      name: 'Score Context'
    },
    Timer: {
      description: 'This component requires the Timer context in order to function correctly (if the timer is being displayed)',
      name: 'remainingTime'
    },
    hideTime: {
      description: 'Flag for hiding the remaining time',
      defaultValue: false,
      name: 'hideTime'
    },
    showPercent: {
      description: 'Flag for showing the percentage of a score, either for points out of total possible points or for found wourds out of all possible words',
      defaultValue: false,
      name: 'showPercent'
    }
  },
  args: {
    score: {
      remainingWords: ['thyme', 'parsley', 'sage'],
      foundWords: ['rosemary'],
    },
    hideTime: false,
    showPercent: false
  },
  component: Score
}

export default metadata

export const Template: ComponentStory<typeof ComponentBuilder> = (args) => <ComponentBuilder {...args}/>

export const HideTime = Template.bind({})
HideTime.args = {
  score: {
    remainingWords: ['thyme', 'parsley', 'sage'],
    foundWords: ['rosemary'],
  },
  hideTime: true,
  showPercent: false
}

export const ShowPercent = Template.bind({})
ShowPercent.args = {
  score: {
    remainingWords: ['thyme', 'parsley', 'sage'],
    foundWords: ['rosemary'],
  },
  hideTime: false,
  showPercent: true
}
