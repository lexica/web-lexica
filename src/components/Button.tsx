import { MouseEventHandler } from 'react'
import { makeClasses } from '../util/classes'
import Svg, { SvgComponent } from './Svg'
import { Link } from 'react-router-dom'
import { WithChildren } from '../util/types'
import constants, { useConstants } from '../style/constants'

import './Button.css'

export enum ButtonThemeType {
  Standard = 'standard',
  AltStandard = 'alternative-standard',
  Emphasis = 'emphasis'
}

export enum ButtonFontSizing {
  Normal = 'normal',
  Title = 'title',
  Subscript = 'subscript'
}

export type ButtonProps = {
  /** @default {false} */
  disabled?: boolean,
  onClick?: MouseEventHandler<HTMLDivElement>,
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
  /** @default {true} */
  nowrap?: boolean
  /** @default {false} */
  svgToSide?: boolean
}

const contentColors: { [P in ButtonThemeType]: { enabled: string, disabled: string } } = {
  [ButtonThemeType.Emphasis]: { enabled: constants.colorBackgroundLight, disabled: constants.colorContentLowContrastDark },
  [ButtonThemeType.Standard]: { enabled: constants.colorContentDark, disabled: constants.colorContentLowContrastDark },
  [ButtonThemeType.AltStandard]: { enabled: constants.colorContentDark, disabled: constants.colorContentLowContrastDark }
}

const Button = (props: ButtonProps): JSX.Element => {
  const {
    svgTitle = props.prompt,
    to = '',
    fontSizing = ButtonFontSizing.Normal,
    themeType = ButtonThemeType.Standard,
    disabled = false,
    roundedEdges = true,
    nowrap = false,
    svgToSide = false,
  } = props
  const constants = useConstants()
  const usingLink = to !== '' && !props.disabled
  const mainClasses = makeClasses(
    'button-component',
    `button-component-${themeType}`,
    `button-component-font-size-${fontSizing}`,
    { condition: disabled, name: 'button-component-disabled' },
    { condition: roundedEdges, name: 'button-component-rounded-edges' },
    { condition: nowrap, name: 'button-component-nowrap'},
    { condition: svgToSide, true: 'button-with-svg-spread', false: 'button-with-svg-centered' }
  )

  const contentColor = contentColors[themeType][disabled ? 'disabled' : 'enabled']
  const svgSize = {
    [ButtonFontSizing.Normal]: constants.fontSize,
    [ButtonFontSizing.Subscript]: constants.fontSizeSubscript,
    [ButtonFontSizing.Title]: constants.fontSizeTitle,
  }[fontSizing]

  const Wrapper = usingLink
    ? ({ children }: WithChildren) => <Link to={to} >{children}</Link>
    : ({ children }: WithChildren) => <>{children}</>

  return <div
    className={mainClasses}
    onClick={props.disabled ? undefined : props.onClick}
  >
    <Wrapper>
      {props.svg ? <Svg.Customizable
        svg={props.svg}
        props={{
          title: svgTitle,
          height: `${svgSize}px`,
          width: `${svgSize}px`,
          fill: contentColor
        }}
      /> : ''}
      {props.prompt}
    </Wrapper>
  </div>
}

export default Button
