import { createContext, useMemo, useState, useEffect, useContext } from 'react'
import { ReactComponent as ArrowBack } from '@material-design-icons/svg/round/arrow_back.svg'

import Svg from './Svg'

import './Banner.css'
import { useHistory, useLocation } from 'react-router'
import { useCallback } from 'react'
import { ElementIdentifier, useElementSize, useScreenSize } from '../util/hooks'
import { logger } from '../util/logger'
import { useCssExp } from '../util/css-parse'
import { useConstants } from '../style/constants'

const getPageName = (path: string): string => {
  const segment = path.split('/').filter(s => s.length).pop()
  if (!segment) return ''

  return segment.replace(/-/g, ' ')
}

export type RenderInBannerContext = {
  cleanUp: () => void,
  setElement: (toRender: Renderable) => void
}

export type Renderable = (size: { maxHeight: number, maxWidth: number }) => JSX.Element

export type RenderState = {
  toRender: Renderable
}



export const useBannerContext = (): { renderState: RenderState, context: RenderInBannerContext } => {
  const [renderState, setState] = useState<RenderState>({
    toRender: () => <></>
  })

  const cleanUp = useCallback(() => setState({ toRender: () => <></> }), [setState])

  const setElement = useCallback((toRender: Renderable) => setState({ toRender }), [setState])

  const context = useMemo(() => ({ cleanUp, setElement }), [cleanUp, setElement])

  return useMemo(() => ({ renderState, context }), [renderState, context])
}

export const useRenderInBanner = (renderable: Renderable) => {
  const { setElement, cleanUp } = useContext(RenderInBanner)

  useEffect(() => {
    setElement(renderable)
    return cleanUp
  }, [setElement, cleanUp, renderable])
}

export const RenderInBanner = createContext<RenderInBannerContext>({
  setElement: (_: any) => {},
  cleanUp: () => {}
})

const Banner = ({ toRender: RenderProp }: { toRender: Renderable }): JSX.Element => {
  const history = useHistory()
  const { pathname } = useLocation()

  const pageName = getPageName(pathname)

  const onClickHandler = useCallback(() => {
    // kind of a hack, but check to see if the real history object has state, if so, then go back
    // otherwise, we've navigated here from somewhere else, so don't go back, go to the root of the page
    // window.history.state ? history.goBack() : history.push('/')
    history.goBack()
  }, [history])

  const { location: { right: leftBound } } = useElementSize(ElementIdentifier.Class, 'banner-page-title')

  const { width } = useScreenSize()

  const { fontSizeTitle } = useConstants()
  const maxHeight = fontSizeTitle

  const maxWidth = width - leftBound - useCssExp`0.5vh`

  useEffect(() => {
    logger.debug({ maxHeight, maxWidth })
  }, [maxWidth, maxHeight])

  return <div className="banner">
    <div
      className="banner-button-area"
      onClick={onClickHandler}
    >
      <Svg.Standard svg={ArrowBack} title="Return home"/>
    </div>
    <div className="banner-page-title">
      {pageName}
    </div>
    <div className="banner-rendered-prop">
      <RenderProp maxHeight={maxHeight} maxWidth={maxWidth}/>
    </div>
  </div>
}

export default Banner
