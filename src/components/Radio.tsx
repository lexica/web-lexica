import { useCallback, useRef } from 'react'
import { ReactComponent as RadioButtonUnchecked } from '@material-design-icons/svg/round/radio_button_unchecked.svg'
import { ReactComponent as RadioButtonChecked } from '@material-design-icons/svg/round/radio_button_checked.svg'

import Svg from './Svg'

export type RadioProps<T extends string | number | readonly string[]> = {
  title: string,
  value: T,
  group: string,
  id: string,
  checked: boolean,
  className?: string
  onChange: (value: T) => void
}

function Radio<T extends string | number | readonly string[]>({
  title,
  value,
  group,
  id,
  onChange,
  checked
}: RadioProps<T>): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(undefined as any)

  const handleChange = useCallback(() => {
    inputRef.current && (inputRef.current.checked = true)
    onChange(value)
  }, [onChange, inputRef, value])

  return <>
    <div
      onClick={handleChange}
      style={{ display: 'flex' }}
    >
      <Svg.Standard svg={checked ? RadioButtonChecked : RadioButtonUnchecked} title={title} />
    </div>
    <input
      type="radio"
      id={id}
      value={value}
      name={group}
      ref={inputRef}
      onChange={() => onChange(value)}
      checked={checked}
      style={{display: 'none'}}
    />
    <label
      onClick={handleChange}
    >{title}</label>
  </>
}

export default Radio
