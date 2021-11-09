import { useState, useCallback  } from 'react'
import { ReactComponent as Sort } from '@material-design-icons/svg/round/sort.svg'

import Description from './Description'
import Radio from '../Radio'

import { getClass } from './util'

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

  const handleChange = useCallback((length: number) => {
    if (!wordLengths.includes(length)) return

    handleLengthUpdate(length)
    setMinimumWordLength(length)
  }, [wordLengths, handleLengthUpdate])

  return <Description title={title} svg={Sort}>
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
  </Description>
}

export default MinimumWordLength
