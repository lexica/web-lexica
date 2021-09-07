
import './Theme.css'

export enum Themes {
  Light = 'light',
  Dark = 'dark'
}

const Theme: React.FC<{
  theme: Themes
}> = ({ theme, children }) => <div className={`${theme} defaults`}>{children}</div>

export default Theme
