import * as R from 'ramda'

const getCanvas = R.memoizeWith(() => 'hi', () => document.createElement('canvas'))

export type GetTextWidth = {
  text: string,
  fontSizeInPx: number,
  fontWeight?: string,
  fontFamily?: string,
  defaultValue?: number
}

const getFontFamily = R.memoizeWith(() => 'hi', () => {
  const [body]: HTMLBodyElement[] = document.getElementsByTagName('body') as any
  return window.getComputedStyle(body).getPropertyValue('font-family')
})

export const getTextWidthInPx = ({
  text,
  fontSizeInPx,
  fontWeight = 'normal',
  fontFamily = '',
  defaultValue = -1
}: GetTextWidth) => {
  const canvas = getCanvas()
  const context = canvas.getContext('2d')
  if (!context) return defaultValue
  const fontFamilyName = fontFamily || getFontFamily()
  context.font = `${fontWeight} ${fontSizeInPx}px ${fontFamilyName}`
  return context.measureText(text).width
}
