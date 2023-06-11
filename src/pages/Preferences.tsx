import { useContext } from 'react'
import { ReactComponent as Language } from '@material-design-icons/svg/round/language.svg'
import { ReactComponent as Gamepad } from '@material-design-icons/svg/round/gamepad.svg'
import { SvgComponent } from '../components/Svg'

import Button, { ButtonFontSizing } from '../components/Button'
import './Preferences.css'
import { Translations } from '../translations'

const PrefButton = ({ to, title, svg }: { to: string, title: string, svg: SvgComponent }) => <Button
  svgTitle={title}
  svg={svg}
  prompt={title}
  to={to}
  fontSizing={ButtonFontSizing.Title}
  key={title}
  svgToSide
/>
const Preferences = (): JSX.Element => {
  const { translationsFn } = useContext(Translations)
  const language = translationsFn('pages.preferences.language')
  const lexicon = translationsFn('pages.preferences.lexicon')
  return (<div className="Page">
    <div className="preferences-page-button-list">
      <PrefButton title={language} to="/languages" svg={Language} />
      <PrefButton title={lexicon} to="/lexicons" svg={Gamepad} />
    </div>
  </div>)
}

export default Preferences
