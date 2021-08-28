import { useEffect, useCallback, useState } from "react"

const getHeight = (id: string) => {
  const rawHeight = getComputedStyle(document.getElementById(id) as HTMLElement).height
  const height = parseFloat(rawHeight)

  console.log(JSON.stringify({ rawHeight, height, id }))

  return height
}

// eslint-disable-next-line
const em = (value: number) => {
  const emPerPixel = getHeight('em-cheat')
  return value * emPerPixel
}

const vh = (value: number) => {
  const vhPerPixel = getHeight('viewport-height-cheat')
  return value * vhPerPixel
}

// eslint-disable-next-line
const vw = (value: number) => {
  const vwPerPixel = getHeight('viewport-width-cheat')
  return value * vwPerPixel
}

const clamp = (min: number, target: number, max: number) => {
  const clampMin = Math.max(target, min)
  const clampMax = Math.min(clampMin, max)
  return clampMax
}

const getConstants = () => ({
  fontSize: clamp(vw(3), vh(2.5), vw(6)),
  fontSizeTitle: clamp(vw(3.5), vh(3), vw(7)),
  fontWeightBold: 700,
  fontWeightLight: 100,

  colorContentDark: '#93a1a1',
  colorContentLight: '#586e75',

  colorContentLowContrastDark: '#657b83',
  colorContentLowContrastLight: '#839496',

  colorBackgroundDark: '#002b36',
  colorBackgroundLight: '#eee8d5',
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
  fontSize: 'clamp(1em, 2.5vh, 2em)',
  fontSizeTitle: 'clamp(1.4em, 3vh, 2.4em)',
  fontWeightBold: 'bolder',
  fontWeightLight: 'lighter',

  colorContentDark: '#93a1a1',
  colorContentLight: '#586e75',

  colorContentLowContrastDark: '#657b83',
  colorContentLowContrastLight: '#839496',

  colorBackgroundDark: '#002b36',
  colorBackgroundLight: '#eee8d5',
  colorAccent: '#268bd2'
}

export default constants
