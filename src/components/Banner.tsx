import { ReactComponent as ArrowBack } from '@material-design-icons/svg/round/arrow_back.svg'

import Svg from './Svg'

import './Banner.css'
import { useHistory } from 'react-router'
import { useCallback } from 'react'

const Banner = (): JSX.Element => {

  const history = useHistory()

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
  </div>
}

export default Banner
