import { ReactComponent as ArrowBack } from '@material-design-icons/svg/round/arrow_back.svg'

import Svg from './Svg'

import './Banner.css'
import { useHistory, useLocation } from 'react-router'
import { useCallback } from 'react'

const getPageName = (path: string): string => {
  const segment = path.split('/').filter(s => s.length).pop()
  if (!segment) return ''

  // note: check the css, it may be doing the titlecaseing via a text-transform
  return segment.replace(/-/g, ' ')
}

const Banner = (): JSX.Element => {
  const history = useHistory()
  const location = useLocation()

  const pageName = getPageName(location.pathname)

  const onClickHandler = useCallback(() => {
    history.push('/')
  }, [history])

  return <div className="banner">
    <div
      className="banner-button-area"
      onClick={onClickHandler}
    >
      <Svg.Standard svg={ArrowBack} title="Return home"/>
    </div>
    {pageName}
  </div>
}

export default Banner
