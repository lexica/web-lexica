import { WithChildren } from '../util/types'
import './Theme.css'

export enum Themes {
  Light = 'light',
  Dark = 'dark'
}

const Theme = ({ theme, children }: WithChildren<{ theme: Themes }>) => <div className={`${theme} defaults`}>{children}</div>

export default Theme
