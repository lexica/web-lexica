import * as uuid from 'uuid'
import { CSSProperties, MouseEventHandler, useEffect, useState } from 'react'
import { makeClasses } from '../util/classes'
import { ElementIdentifier, ElementSizeInfo, useElementSize } from '../util/hooks'
import Svg, { SvgComponent } from './Svg'
import { Link } from 'react-router-dom'
import { WithChildren } from './GameProviders'
import { getTextWidthInPx } from '../util/text-sizing'
import constants, { useConstants } from '../style/constants'

import './Button.css'

export enum ButtonThemeType {
  Standard = 'standard',
  AltStandard = 'alternative-standard',
  Emphasis = 'emphasis'
}

export enum ButtonFontSizing {
  Dynamic = 'dynamic',
  Normal = 'normal',
  Title = 'title',
  Subscript = 'subscript'
}

export enum ButtonFontWeight {
  Normal = 'normal',
  Bolder = 'bolder',
  Lighter = 'lighter'
}

type OnClickHandler = MouseEventHandler<HTMLDivElement>

export type ButtonProps = {
  /** @default {false} */
  disabled?: boolean,
  onClick?: OnClickHandler,
  to?: string,
  /** @default {true} */
  roundedEdges?: boolean,
  /** @default {ButtonThemeType.Standard} */
  themeType?: ButtonThemeType,
  svg?: SvgComponent,
  /** @default prompt is used */
  svgTitle?: string,
  prompt: string,
  /** @default {ButtonFontSizing.Normal} */
  fontSizing?: ButtonFontSizing
  /** @default {ButtonFontWeight.Normal} */
  fontWeight?: ButtonFontWeight
  /** @default {true} */
  nowrap?: boolean
}

type PrivateButtonProps = {
  outerDivStyling?: CSSProperties,
  svgStyling?: CSSProperties,
  id?: string,
  svgSize: number,
  showText?: boolean
} & ButtonProps

type Theme = { content: string, background: string }

type FullTheme = { enabled: Theme, disabled: Theme }

const themes: { [P in ButtonThemeType]: FullTheme } = {
  [ButtonThemeType.Emphasis]: {
    enabled: { content: constants.colorBackgroundLight, background: constants.colorAccent },
    disabled: { content: constants.colorContentLowContrastDark, background: constants.colorContentDark }
  },
  [ButtonThemeType.Standard]: {
    enabled: { content: constants.colorContentDark, background: constants.colorBackgroundDarkAlt },
    disabled: { content: constants.colorContentLowContrastDark, background: constants.colorBackgroundDarkAlt }
  },
  [ButtonThemeType.AltStandard]: {
    enabled: { content: constants.colorContentDark, background: constants.colorBackgroundDark },
    disabled: { content: constants.colorContentLowContrastDark, background: constants.colorBackgroundDark }
  }
}

const makeButtonMainClasses = ({
  themeType = ButtonThemeType.Standard,
  fontSizing = ButtonFontSizing.Normal,
  fontWeight = ButtonFontWeight.Normal,
  roundedEdges = true,
  nowrap = true,
  disabled = false,
}: ButtonProps) => makeClasses(
    'button-component',
    `button-component-${themeType}`,
    `button-component-font-size-${fontSizing}`,
    `button-component-font-weight-${fontWeight}`,
    { condition: disabled, name: 'button-component-disabled' },
    { condition: roundedEdges, name: 'button-component-rounded-edges' },
    { condition: nowrap, name: 'button-component-nowrap'}
)

const getWidthPerHeightRatio = (height: number, text: string) => {
  if (height === 0) return 0
  return getTextWidthInPx({ fontSizeInPx: height, text })/height
}

type GetTextPropertiesParams = {
  elementSize: ElementSizeInfo['size'],
  useSvg: boolean,
  verticalMargin: number,
  horizontalMargin: number,
  text: string,
}

const useDynamicTextSizing = ({
  elementSize,
  useSvg,
  verticalMargin,
  horizontalMargin,
  text
}: GetTextPropertiesParams) => {
  const constants = useConstants()
  const { fontSizeSubscript: minHeight, fontSizeTitle: maxHeight } = constants
  const availableHeight = elementSize.height * (1 - verticalMargin)
  const availableWidth = elementSize.width * (1 - horizontalMargin)
  const svgSize = Math.min(availableHeight, availableWidth)
  const availableSvgAndTextWidth = elementSize.width * (1 - horizontalMargin) - (svgSize*1.25)

  const [widthPerHeightRatio, setWidthForHeightRatio] = useState(getWidthPerHeightRatio(constants.fontSizeTitle, text))
  const [state, setState] = useState({
    showText: true,
    fontSize: 0,
    svgSize: 0,
  })


  useEffect(() => {
    setWidthForHeightRatio(getWidthPerHeightRatio(constants.fontSizeTitle, text))
  }, [setWidthForHeightRatio, constants, text])

  useEffect(() => {
    const suggestedHeightFromWidth = availableSvgAndTextWidth / (1 + widthPerHeightRatio)
    const showText = suggestedHeightFromWidth >= minHeight || !useSvg
    setState({
      showText: showText,
      fontSize: Math.max(minHeight, Math.min(maxHeight, availableHeight, suggestedHeightFromWidth)),
      svgSize
    })

  }, [minHeight, maxHeight, widthPerHeightRatio, availableHeight, availableWidth, availableSvgAndTextWidth, useSvg, svgSize])

  return state
}

const toPx = (value: number) => `${value}px`

const PrivateButton = (props: PrivateButtonProps): JSX.Element => {
  const { svgTitle = props.prompt, showText = true, to = '' } = props
  const usingLink = to !== '' && !props.disabled
  const mainClasses = makeButtonMainClasses(props)
  const status = props.disabled ? 'disabled' : 'enabled'
  const theme = themes[props.themeType || ButtonThemeType.Standard][status]

  const Wrapper = usingLink
    ? ({ children }: WithChildren) => <Link to={to} >{children}</Link>
    : ({ children }: WithChildren) => <>{children}</>

  return <div
    id={props.id}
    className={mainClasses}
    style={props.outerDivStyling}
    onClick={props.disabled ? undefined : props.onClick}
  >
    <Wrapper>
      {props.svg ? <Svg.Customizable
        svg={props.svg}
        props={{
          title: svgTitle,
          height: `${props.svgSize}px`,
          width: `${props.svgSize}px`,
          fill: theme.content
        }}
        style={props.svgStyling}
      /> : ''}
      {showText ? props.prompt : ''}
    </Wrapper>
  </div>
}

const DynamicSizingButton = (props: ButtonProps): JSX.Element => {
  const [id] = useState(uuid.v4())
  const { size: elementSize } = useElementSize(ElementIdentifier.Id, id)
  const margins = { verticalMargin: .2, horizontalMargin: .2, svgTextMargin: .1 }
  const { showText, fontSize, svgSize } = useDynamicTextSizing(
    { ...margins, useSvg: props.svg !== undefined, elementSize, text: props.prompt }
  )

  const svgStyling: CSSProperties = { marginRight: elementSize.width*margins.svgTextMargin }
  const outerDivStyling: CSSProperties = {
    fontSize: toPx(fontSize),
    paddingBlock: toPx(elementSize.height * margins.verticalMargin/2),
    paddingInline: toPx(elementSize.width * margins.horizontalMargin/2),
  }

  return <PrivateButton {...{ ...props, outerDivStyling, svgStyling, id, showText, svgSize }}/>
}

const StandardSizingButton = (props: ButtonProps): JSX.Element => {
  const constants = useConstants()
  const svgSize = {
    [ButtonFontSizing.Normal]: constants.fontSize,
    [ButtonFontSizing.Subscript]: constants.fontSizeSubscript,
    [ButtonFontSizing.Title]: constants.fontSizeTitle,
    [ButtonFontSizing.Dynamic]: constants.fontSize,
  }[props.fontSizing || ButtonFontSizing.Normal]

  return <PrivateButton {...{ ...props, svgSize }} />
}

const Button = (props: ButtonProps): JSX.Element => {
  if (props.fontSizing === ButtonFontSizing.Dynamic) return <DynamicSizingButton {...props} />
  return <StandardSizingButton {...props} />
}

export default Button
