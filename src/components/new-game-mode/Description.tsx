import Svg, { SvgComponent } from '../Svg'

const Description = ({ title, svg }: { title: string, svg: SvgComponent }): JSX.Element => <div
  className="new-game-mode-description-container"
>
  <Svg.Standard svg={svg} title={title}/>
  <div>{title}</div>
</div>

export default Description
