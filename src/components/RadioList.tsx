import { useMemo } from 'react'
import { v4 as uuid } from 'uuid'

import { makeClasses } from '../util/classes'
import { useStaticValue } from '../util/hooks'
import Radio, { RadioSize } from './Radio'

import './RadioList.css'
import { MaybeRender } from '../util/elements'

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

type StrNumStrArr = string | number | readonly string[]

export type RadioListProps<T extends StrNumStrArr = string> = {
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
  renderOnSelected?: (props: { option: RadioListOption<T> }) => JSX.Element,
  group?: string
  /** @default {true} */
  highlightSelected?: boolean,
  /** @default {false} */
  noHighlightSelected?: boolean,
  /** @default {false} */
  roundHighlightCorners?: boolean,
  /**
   * If the main background color should be color-content-dark-alt
   * @default {false}
   */
  altBackground?: boolean
}

type RadioItemProps<T extends StrNumStrArr, RLP extends RadioListProps<T> = RadioListProps<T>> = {
  option: RadioListOption<T>,
  onClick: RLP['onValueSelect'],
  classes: string,
  selected: T,
  renderOnSelected: RLP['renderOnSelected'],
  group: Exclude<RLP['group'], undefined>,
  size: RadioSize
}

function RadioItem<T extends StrNumStrArr>(props: RadioItemProps<T>): JSX.Element {
  const {
    classes,
    option,
    onClick,
    selected,
    renderOnSelected: RenderOnSelected,
    group,
    size
  } = props

  const isSelected = option.value === selected
  const className = makeClasses(classes, { condition: isSelected, name: 'item-selected' })
  return (
    <div
      className={makeClasses(cssClass`item-container`, className)}
      onClick={() => onClick(option.value)}
    >
      <div className={makeClasses(cssClass`item-radio-container`, className)}>
        <Radio
          size={size}
          checked={isSelected}
          group={group}
          onChange={onClick}
          title={option.title}
          value={option.value}
          className={makeClasses(cssClass`item-radio`, className)}
        />
      </div>
      <MaybeRender
        maybeRender={option?.hint}
      >
        <div className={makeClasses(cssClass`item-hint`, className)}>{option?.hint}</div>
      </MaybeRender>
      <MaybeRender
        maybeRender={isSelected && RenderOnSelected}
      >
        <div
          className={makeClasses(cssClass`item-render-on-selected-container`, className)}
        >
          {RenderOnSelected && <RenderOnSelected option={option}/>}
        </div>
      </MaybeRender>
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

function RadioList<T extends StrNumStrArr>(props: RadioListProps<T>): JSX.Element {
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
    noHighlightSelected = false,
    roundHighlightCorners = false,
    altBackground = false,
  } = props

  const safeOptions = useMemo(() => getSafeOptions(options), [options])

  const fontSize = titleFont ? 'title' : 'normal'
  const radioSize = titleFont ? RadioSize.Title : RadioSize.Normal
  const marginSize = marginSmall ? 'small' : marginLarge ? 'large' : 'normal'
  const direction = horizontal ? 'horizontal' : 'vertical'

  const universalClasses = makeClasses(
    `font-${fontSize}`,
    `margin-${marginSize}`,
    direction,
    { condition: noHighlightSelected, true: 'no-highlight-selected', false: 'highlight-selected' },
    { condition: hintOnlyOnSelect, name: `hint-on-select`},
    { condition: roundHighlightCorners, name: 'rounded-selection'},
    { condition: altBackground, true: 'alt-background', false: 'main-background' },
  )

  const listClasses = makeClasses(
    'radio-list-component',
    universalClasses,
  )

  return (
    <div className={listClasses}>
      {safeOptions.map(o => (
        <RadioItem
          size={radioSize}
          classes={universalClasses}
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
