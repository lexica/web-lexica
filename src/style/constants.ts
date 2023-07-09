import { useEffect, useCallback, useState } from 'react'
import { evaluateCssExp } from '../util/css-parse'


const getConstants = () => {
  const style = getComputedStyle(document.body)

  const fontSizeXS = evaluateCssExp(style.getPropertyValue('--font-size-xs'))
  const fontSizeS = evaluateCssExp(style.getPropertyValue('--font-size-s'))
  const fontSizeM = evaluateCssExp(style.getPropertyValue('--font-size-m'))
  const fontSizeL = evaluateCssExp(style.getPropertyValue('--font-size-l'))
  const fontSizeXL = evaluateCssExp(style.getPropertyValue('--font-size-xl'))
  const fontSize = fontSizeM
  const fontSizeSubscript = fontSizeS
  const fontSizeTitle = fontSizeL

  const paddingXS = fontSizeXS * 2 / 3
  const paddingS = fontSizeS * 2 / 3
  const paddingM = fontSizeM * 2 / 3
  const paddingL = fontSizeL * 2 / 3
  const paddingXL = fontSizeXL * 2 / 3
  const computed = {
    fontSize,
    fontSizeTitle,
    fontSizeSubscript,
    fontWeightBold: style.getPropertyValue('--font-weight-bold'),
    fontWeightLight: style.getPropertyValue('--font-weight-light'),

    fontSizeXS,
    fontSizeS,
    fontSizeM,
    fontSizeL,
    fontSizeXL,

    colorContentDark: style.getPropertyValue('--color-content-dark'),
    colorContentLight: style.getPropertyValue('--color-content-light'),

    colorContentLowContrastDark: style.getPropertyValue('--color-content-low-contrast-dark'),
    colorContentLowContrastLight: style.getPropertyValue('--color-content-low-contrast-light'),

    colorBackgroundDark: style.getPropertyValue('--color-background-dark'),
    colorBackgroundDarkAlt: style.getPropertyValue('--color-background-dark-alt'),
    colorBackgroundLight: style.getPropertyValue('--color-background-light'),
    colorBackgroundLightAlt: style.getPropertyValue('--color-background-light-alt'),

    colorAccent: style.getPropertyValue('--color-accent'),
    colorGreen: style.getPropertyValue('--color-green'),
    colorRed: style.getPropertyValue('--color-red'),
    colorYellow: style.getPropertyValue('--color-yellow'),

    paddingXS,
    paddingS,
    paddingM,
    paddingL,
    paddingXL,
  }
  return computed
}

const useUnits = () => {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (document.getElementById('viewport-height-cheat')) {
      setReady(true)
    }
  }, [setReady])
  return ready
}

export const useConstants = () => {
  const [constants, updateConstants] = useState(getConstants())
  const updateState = useCallback(() => updateConstants(getConstants()), [])

  const ready = useUnits()

  useEffect(() => {
    if (ready) updateConstants(getConstants())
  }, [updateConstants, ready])

  useEffect(() => {
    const eventListener = () => {
      updateState()
    }
    window.addEventListener('resize', eventListener)
    return () => window.removeEventListener('resize', eventListener)
  }, [updateState])

  return constants
}


const constants = {
  fontSize: 'clamp(1rem, min(2.5vh, 4vw), 2rem)',
  fontSizeTitle: 'clamp(1.5rem, min(3vh, 5.25vw), 3rem)',
  fontSizeSubscript: 'clamp(0.5rem, min(2vh, 2.75vw), 1rem)',
  fontWeightBold: 'bolder',
  fontWeightLight: 'lighter',

  fontSizeXS: 'clamp(0.25rem, min(1.5vh, 1.50vw), 0.5rem)',
  fontSizeS: 'clamp(0.5rem, min(2vh, 2.75vw), 1rem)',
  fontSizeM: 'clamp(1rem, min(2.5vh, 4vw), 2rem)',
  fontSizeL: 'clamp(1.5rem, min(3vh, 5.25vw), 3rem)',
  fontSizeXL: 'clamp(2rem, min(3.5vh, 6.50vw), 4rem)',

  colorContentDark: '#93a1a1',
  colorContentLight: '#586e75',

  colorContentLowContrastDark: '#657b83',
  colorContentLowContrastLight: '#839496',

  colorBackgroundDark: '#002b36',
  colorBackgroundDarkAlt: '#073642',
  colorBackgroundLight: '#eee8d5',
  colorBackgroundLightAlt: '#fdf6e3',

  colorAccent: '#268bd2',
  colorGreen: '#2aa198',
  colorRed: '#dc322f',
  colorYellow: '#b58900',

  paddingXS: 'calc(2 / 3 * clamp(0.25rem, min(1.5vh, 1.50vw), 0.5rem))',
  paddingS: 'calc(2 / 3 * clamp(0.5rem, min(2vh, 2.75vw), 1rem))',
  paddingM: 'calc(2 / 3 * clamp(1rem, min(2.5vh, 4vw), 2rem))',
  paddingL: 'calc(2 / 3 * clamp(1.5rem, min(3vh, 5.25vw), 3rem))',
  paddingXL: 'calc(2 / 3 * clamp(2rem, min(3.5vh, 6.50vw), 4rem))',
}

export default constants
