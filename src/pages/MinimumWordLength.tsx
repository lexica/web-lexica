import { useState, useCallback  } from 'react'
import { ReactComponent as Sort } from '@material-design-icons/svg/round/sort.svg'

import Description from '../components/new-game-mode/Description'
import Radio from '../components/Radio'

import { getClass } from '../components/new-game-mode/util'

const {
  optionClass,
  optionsClass
} = getClass

export type MinimumWordLengthProps = {
  handleLengthUpdate: (length: number) => void,
  wordLengths: number[]
}

const MinimumWordLength = ({
  handleLengthUpdate,
  wordLengths
}: MinimumWordLengthProps): JSX.Element => {
  const [minimumWordLength, setMinimumWordLength] = useState(0)
  const title = 'Minimum Word Length'
  const prefix = 'new-game-mode'
  const ruleClass = title.toLowerCase().replace(/\s+/g, '-')

  const handleChange = useCallback((length: number) => {
    if (!wordLengths.includes(length)) return

    handleLengthUpdate(length)
    setMinimumWordLength(length)
  }, [wordLengths, handleLengthUpdate])

  return <div className={`${prefix}-container ${prefix}-${ruleClass}-container`}>
    <Description {...{ title, svg: Sort }}/>
    <div className={optionsClass('minimum-word-length')}>
      {wordLengths.map(l => <div
        className={optionClass('minimum-word-length')}
      >
        <Radio
          group="minimum-word-length"
          value={l}
          id={l.toString()}
          title={l.toString()}
          onChange={handleChange}
          checked={minimumWordLength===l}
        />
      </div>)}
    </div>
  </div>
}

export default MinimumWordLength
