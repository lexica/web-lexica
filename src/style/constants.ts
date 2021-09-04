import { useEffect, useCallback, useState } from 'react'

import { cssExp } from '../util/css-parse'

const getConstants = () => ({
  fontSize: cssExp`clamp(1em, min(2.5vh, 4vw), 2em)`,
  fontSizeTitle: cssExp`clamp(1.5em, min(3vh, 5.25vw), 3em)`,
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

  colorAccent: '#268bd2'
})

export const useConstants = () => {
  const [constants, updateConstants] = useState(getConstants())
  const updateState = useCallback(() => updateConstants(getConstants()), [])

  useEffect(() => {
    const eventListener = () => {
      console.log(JSON.stringify(getConstants()))
      updateState()
    }
    window.addEventListener('resize', eventListener)
    return () => window.removeEventListener('resize', eventListener)
  })

  return constants
}


const constants = {
  fontSize: 'clamp(1em, min(2.5vh, 4vw), 2em)',
  fontSizeTitle: 'clamp(1.5em, min(3vh, 5.25vw), 3em)',
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

  colorAccent: '#268bd2'
}

export default constants
