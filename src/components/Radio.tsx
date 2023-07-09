import { useCallback, useMemo, useRef } from 'react'
import { ReactComponent as RadioButtonUnchecked } from '@material-design-icons/svg/round/radio_button_unchecked.svg'
import { ReactComponent as RadioButtonChecked } from '@material-design-icons/svg/round/radio_button_checked.svg'

import Svg from './Svg'
import { useConstants } from '../style/constants'

export enum RadioSize {
  Subscript = 'subscript',
  Normal = 'normal',
  Title = 'title'
}

export type RadioProps<T extends string | number | readonly string[]> = {
  title: string,
  value: T,
  group: string,
  id?: string,
  checked: boolean,
  className?: string
  onChange: (value: T) => void
  /** @default {RadioSize.Normal} */
  size?: RadioSize
}

function Radio<T extends string | number | readonly string[]>({
  title,
  value,
  group,
  id,
  onChange,
  checked,
  className,
  size = RadioSize.Normal
}: RadioProps<T>): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(undefined as any)

  const handleChange = useCallback(() => {
    inputRef.current && (inputRef.current.checked = true)
    onChange(value)
  }, [onChange, inputRef, value])

  const { fontSize, fontSizeSubscript, fontSizeTitle } = useConstants()
  const classes = className || ''

  const svgSize = useMemo(() => {
    if (size === RadioSize.Subscript) return {
      width: fontSizeSubscript,
      height: fontSizeSubscript,
    }

    if (size === RadioSize.Normal) return {
      width: fontSize,
      height: fontSize,
    }

    if (size === RadioSize.Title) return {
      width: fontSizeTitle,
      height: fontSizeTitle,
    }
  }, [size, fontSize, fontSizeTitle, fontSizeSubscript])

  return <>
    <div
      onClick={handleChange}
      style={{ display: 'flex' }}
      className={classes}
    >
      <Svg.Customizable
        svg={checked ? RadioButtonChecked : RadioButtonUnchecked}
        props={{
          title,
          ...svgSize
        }}

      />
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
      className={classes}
    />
    <label
      className={classes}
      onClick={handleChange}
    >{title}</label>
  </>
}

export default Radio
