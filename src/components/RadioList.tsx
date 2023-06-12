import { useMemo } from "react"
import { v4 as uuid } from 'uuid'

import { makeClasses } from "../util/classes"
import { useStaticValue } from "../util/hooks"
import Radio from "./Radio"

const cssClass = (strings: TemplateStringsArray, ...args: any[]): string => {
  return strings.reduce((acc: string, str: string, index) => {
    if (index >= args.length) return `${acc}${str}`
    return `${acc}${str}${args[index]}`
  }, 'radio-list-component-')
}

export type RadioListOption<T> = {
  title: string
  hint?: string
  value: T
}

export type RadioListProps<T = string> = {
  selectedValue: T,
  options: T[] | RadioListOption<T>[]
  /** @default {false} */
  horizontal?: boolean,
  /** @default {true} */
  vertical?: boolean,
  onValueSelect: (value: T) => void
  /** @default {false} */
  titleFont?: boolean,
  /** @default {false} */
  marginSmall?: boolean,
  /** @default {false} */
  marginLarge?: boolean,
  /** @default {false} */
  hintOnlyOnSelect?: boolean,
  /** @default {false} */
  renderOnSelected?: (option: RadioListOption<T>) => JSX.Element,
  group?: string
}

type RadioItemProps<T, RLP extends RadioListProps<T> = RadioListProps<T>> = {
  option: RadioListOption<T>,
  onClick: RLP['onValueSelect'],
  classes: string,
  selected: T,
  renderOnSelected: RLP['renderOnSelected'],
  group: RLP['group'],
}

function RadioItem<T>(props: RadioItemProps<T>): JSX.Element {
  const {
    classes,
    option,
    onClick,
    selected,
    renderOnSelected,
    group,
  } = props

  const isSelected = option.value === selected

  return (
    <div className={makeClasses(classes, { condition: isSelected, name: cssClass`item-selected` })}>
      <Radio
        checked={isSelected}

      />
    </div>
  )
}

function isRadioListOption<X>(val: any): val is RadioListOption<X> {
  return val?.value !== undefined && typeof val?.title === 'string'
}

function getSafeOptions<T>(options: T[] | RadioListOption<T>[]): RadioListOption<T>[] {
  if (options.length === 0) return []

  if (isRadioListOption<T>(options[0])) {
    return options as RadioListOption<T>[]
  }
  return options.map(o => ({ title: `${o}`, value: o }) as RadioListOption<T>)
}

function RadioList<T>(props: RadioListProps<T>): JSX.Element {
  const defaultGroup = useStaticValue(uuid())
  const {
    options,
    horizontal = false,
    onValueSelect,
    titleFont = false,
    marginSmall = false,
    marginLarge = false,
    hintOnlyOnSelect = false,
    renderOnSelected = undefined,
    selectedValue,
    group = defaultGroup,
  } = props

  const safeOptions = useMemo(() => getSafeOptions(options), [options])

  const fontSize = titleFont ? 'title' : 'normal'
  const marginSize = marginSmall ? 'small' : marginLarge ? 'large' : 'normal'
  const direction = horizontal ? 'horizontal' : 'vertical'

  const listItemClasses = makeClasses(
    cssClass`item-font-${fontSize}`,
    cssClass`item-margin-${marginSize}`,
    { condition: hintOnlyOnSelect, name: cssClass`item-hint-on-select`}
  )

  const listClasses = makeClasses(
    'radio-list-component',
    cssClass`${direction}`,
  )

  return (
    <div className={listClasses}>
      {safeOptions.map(o => (
        <RadioItem
          classes={listItemClasses}
          onClick={onValueSelect}
          option={o}
          selected={selectedValue}
          renderOnSelected={renderOnSelected}
          group={group}
        />
      ))}
    </div>
  )
}

export default RadioList
