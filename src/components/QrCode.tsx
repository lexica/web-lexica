import Qr from 'qrcode-generator'

import './QrCode.css'

type Colors = {
  background: string,
  foreground: string
}

export type QrCodeProps = {
  info: string,
  colors?: Colors
}

const applyColor = ({ foreground, background }: Colors, svg: string) => {
  const foregroundRx = /fill="black"/
  const backgroundRx = /fill="white"/

  return svg.replace(foregroundRx, `fill="${foreground}"`).replace(backgroundRx, `fill="${background}"`)
}

const QrCode = (props: QrCodeProps): JSX.Element => {
  const { info } = props
  const qr = Qr(0, 'M')
  qr.addData(info)
  qr.make()
  const svg = props.colors ? applyColor(props.colors, qr.createSvgTag()) : qr.createSvgTag()

  return <div className="qr-code" dangerouslySetInnerHTML={{ __html: svg }}/>
}

export default QrCode
