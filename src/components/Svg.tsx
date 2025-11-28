import type { CSSProperties } from "react"
import constants, { useConstants } from "../style/constants"

export type SvgProps = {
  title: string,
  width: number | string,
  height: number | string,
  fill: string
}

export type CustomizableProps = {
  svg: string,
  props: {
    title: string,
    width?: number | string,
    height?: number | string,
    fill?: string
  },
  style?: CSSProperties
}

const Customizable = ({ svg, props, style }: CustomizableProps): JSX.Element => {
  // The typescript types are wrong for this component.
  // the svgs imported by webpack are not (at least in development) functional components
  // but rather of type react.forward_ref
  const { fontSize } = useConstants()
  const defaults: Omit<SvgProps, 'title'> = {
    width: fontSize,
    height: fontSize,
    fill: constants.colorContentDark
  }

  const withOverrides: SvgProps = { ...defaults, ...props }
  return <div
    className="svg-div"
    style={{
      ...style,
      width: withOverrides.width,
      height: withOverrides.height,
      backgroundColor: withOverrides.fill,
      mask: `url("${svg}") no-repeat`,
      maskSize: "cover"
    }}
    aria-label={props.title || ""}
  />
}

export type StandardProps = {
  svg: string,
  title: string
}

const Standard = ({ svg, title }: StandardProps) => <Customizable svg={svg} props={{ title }}/>

const Svg = {
  Customizable,
  Standard
}

export default Svg
