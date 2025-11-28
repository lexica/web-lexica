import type { WithChildren } from '../util/types'
import './Theme.css'

export const Themes = {
  Light: 'light',
  Dark: 'dark'
} as const

export type ThemesType = typeof Themes[keyof typeof Themes]

const Theme = ({ theme, children }: WithChildren<{ theme: ThemesType }>) => <div className={`${theme} defaults`}>{children}</div>

export default Theme
