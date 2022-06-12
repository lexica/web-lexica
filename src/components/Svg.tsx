import { CSSProperties } from "react"
import constants, { useConstants } from "../style/constants"

export type SvgComponent = React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>

export type SvgProps = {
  title: string,
  width: number | string,
  height: number | string,
  fill: string
}

export type CustomizableProps = {
  svg: SvgComponent,
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
  const render: (props: SvgProps) => JSX.Element = (svg as  any).render || svg
  const { fontSize } = useConstants()
  const defaults: Omit<SvgProps, 'title'> = {
    width: fontSize,
    height: fontSize,
    fill: constants.colorContentDark
  }

  const withOverrides = { ...defaults, ...props, style }
  return <>{render(withOverrides)}</>
}

export type StandardProps = {
  svg: SvgComponent,
  title: string
}

const Standard = ({ svg, title }: StandardProps) => <Customizable svg={svg} props={{ title }}/>

const Svg = {
  Customizable,
  Standard
}

export default Svg
