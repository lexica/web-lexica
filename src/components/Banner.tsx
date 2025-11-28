import { createContext, useMemo, useState, useEffect, useContext } from 'react'
import type { MouseEvent } from 'react'
import ArrowBack from '@material-design-icons/svg/round/arrow_back.svg'

import Svg from './Svg'

import './Banner.css'
import { useLocation } from 'react-router'
import { useCallback } from 'react'
import { ElementIdentifier, useElementSize, useScreenSize } from '../util/hooks'
import { logger } from '../util/logger'
import { useCssExp } from '../util/css-parse'
import constants, { useConstants } from '../style/constants'
import { useSafeNavigateBack } from '../util/url'
import { makeClasses } from '../util/classes'
import { Translations } from '../translations'
import type { TranslationsFn } from '../translations/types'

const getPageName = (path: string, translationsFn: TranslationsFn): string => {
  const segment = path.split('/').filter(s => s.length).pop()
  if (!segment) return ''

  const key = segment.replace(/(-[a-z])/ig, $1 => $1.replace('-', '').toUpperCase())
  return translationsFn(`pages.${key}.title` as any)
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

export type RenderableBadgeProps = {
  svgTitle: string,
  prompt?: string,
  svg?: string,
  disabled?: boolean,
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}

const makeRenderableBadge = ({ svgTitle, prompt, svg, disabled = false, onClick }: RenderableBadgeProps): Renderable => ({
  maxWidth,
  maxHeight
}) => {
  const showPrompt = prompt && maxWidth / maxHeight > (prompt.length + 1)/2
  const isClickable = !disabled && onClick !== undefined

  const BadgeSvg = svg ? () => <Svg.Customizable
      svg={svg}
      props={{
        title: svgTitle,
        fill: disabled ? constants.colorContentLowContrastDark : constants.colorContentDark,
        width: maxHeight * .8,
        height: maxHeight * .8
      }}
    /> : () => <></>
  const classes = makeClasses(
    'banner-rendered-prop-badge',
    'banner-rendered-prop-container',
    { condition: disabled , name: 'banner-rendered-prop-badge-disabled' },
    { condition: isClickable, name: 'banner-rendered-prop-badge-clickable' }
  )

  return <div className={classes} onClick={onClick} >
    <BadgeSvg />
    {showPrompt ? <div className={makeClasses(
      'banner-rendered-prop-label'
    )}>{prompt}</div> : ''}
  </div>
}

export const useBannerBadge = ({ svgTitle, prompt, svg, disabled = false, onClick }: RenderableBadgeProps) => {
  const { setElement, cleanUp } = useContext(RenderInBanner)
  const renderable = useMemo(
    () => makeRenderableBadge({ svgTitle, prompt, svg, disabled, onClick }),
    [svgTitle, prompt, disabled, onClick, svg]
  )

  useEffect(() => {
    setElement(renderable)
    return cleanUp
  }, [setElement, cleanUp, renderable])
}

const Banner = ({ toRender: RenderProp }: { toRender: Renderable }): JSX.Element => {
  const back = useSafeNavigateBack()
  const { pathname } = useLocation()

  const { translationsFn } = useContext(Translations)

  const pageName = getPageName(pathname, translationsFn)

  const onClickHandler = useCallback(() => {
    back()
  }, [back])

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
      <Svg.Standard svg={ArrowBack} title={translationsFn('general.back')}/>
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
