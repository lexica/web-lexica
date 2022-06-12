import { useEffect, useCallback, useState } from 'react'

import { cssExp } from '../util/css-parse'

const getConstants = () => ({
  fontSize: cssExp`clamp(1rem, min(2.5vh, 4vw), 2rem)`,
  fontSizeTitle: cssExp`clamp(1.5rem, min(3vh, 5.25vw), 3rem)`,
  fontSizeSubscript: cssExp`clamp(0.5rem, min(2vh, 2.75vw), 1rem)`,
  fontWeightBold: 700,
  fontWeightLight: 100,

  colorContentDark: '#93a1a1',
  colorContentLight: '#586e75',

  colorContentLowContrastDark: '#657b83',
  colorContentLowContrastLight: '#839496',

  colorBackgroundDark: '#002b36',
  colorBackgroundLight: '#eee8d5',

  colorBackgroundDarkAlt: '#073642',
  colorBackgroundLightAlt: '#fdf6e3',

  colorAccent: '#268bd2',
  colorGreen: '#2aa198',
  colorRed: '#dc322f',
  colorYellow: '#b58900'
})

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

  colorContentDark: '#93a1a1',
  colorContentLight: '#586e75',

  colorContentLowContrastDark: '#657b83',
  colorContentLowContrastLight: '#839496',

  colorBackgroundDark: '#002b36',
  colorBackgroundLight: '#eee8d5',

  colorBackgroundDarkAlt: '#073642',
  colorBackgroundLightAlt: '#fdf6e3',

  colorAccent: '#268bd2',
  colorGreen: '#2aa198',
  colorRed: '#dc322f',
  colorYellow: '#b58900'
}

export default constants
