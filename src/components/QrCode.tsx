import Qr from 'qrcode-generator'

import './QrCode.css'

type Colors = {
  background: string,
  foreground: string
}

export type QrCodeProps = {
  info: string,
  size?: number,
  colors?: Colors
}

const applySize = (size: number, svg: string) => {
  const regex = /(width|height)="[\d]+px"/g

  return svg.replace(regex, `$1="${size}px"`)
}

const applyColor = ({ foreground, background }: Colors, svg: string) => {
  const foregroundRx = /fill="black"/
  const backgroundRx = /fill="white"/

  return svg.replace(foregroundRx, `fill="${foreground}"`).replace(backgroundRx, `fill="${background}"`)
}

const applyProps = ({ size, colors }: { size?: number, colors?: Colors}, svg: string) => {
  if (!size && !colors) return svg

  if(!size) return applyColor(colors!, svg)

  if(!colors) return applySize(size!, svg)

  return applyColor(colors, applySize(size, svg))
}

const QrCode = (props: QrCodeProps): JSX.Element => {
  const { info } = props
  const qr = Qr(0, 'M')
  qr.addData(info)
  qr.make()
  const svg = applyProps(props, qr.createSvgTag())

  return <div className="qr-code" dangerouslySetInnerHTML={{ __html: svg }}/>
}

export default QrCode
