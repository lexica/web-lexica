import { ReactNode } from 'react'
import Svg, { SvgComponent } from '../Svg'

export type DescriptionProps = {
  title: string,
  svg: SvgComponent,
  children?: ReactNode
}

const getPrefixedClass = (...segments: string[]) => {
  const prefix = 'new-game-mode'
  if (!segments.length) return `${prefix}`

  return `${prefix}-${segments.join('-')}`
}

const getClasses = (...classes: string[][]) => {
  return classes.map(c => getPrefixedClass(...c)).join(' ')
}

export const Description = ({ title, svg, children }: DescriptionProps): JSX.Element => {
  const ruleClass = title.toLowerCase().replace(/\s+/g, '-')

  return <div className={getClasses(['container'], [ruleClass, 'container'])} >
    <div className="new-game-mode-description-container" >
      <Svg.Standard svg={svg} title={title}/>
      <div>{title}</div>
    </div>
    {children ? children : ''}
  </div>
}

export default Description
