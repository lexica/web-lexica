import { Ruleset } from '../../game/rules'
import { getSearchString } from '../../game/url'
import constants from '../../style/constants'
import { useCssExp } from '../../util/css-parse'
import { ScreenOrientation, useOrientation } from '../../util/hooks'
import { getBaseUrl } from '../../util/url'
import QrCode from '../QrCode'

export enum Platform {
  Android = 'android',
  Web = 'web'
}

const getMultiplayerUrl = (platform: Platform) => {
  switch (platform) {
    case Platform.Android:
      return `${getBaseUrl()}/m`
    case Platform.Web:
      return `${getBaseUrl()}/multiplayer`
  }
}

export type ShareGameQrCodeProps = {
  platform: Platform
  rules: Ruleset
  board: string[]
  language: string
}

const ShareGameQrCode = ({
  board,
  rules,
  language,
  platform
}: ShareGameQrCodeProps) => {
  const search = getSearchString({
    board,
    language,
    ...rules,
  })

  const multiplayerUrl = getMultiplayerUrl(platform)
  const orientation = useOrientation()

  const landscapeSize = useCssExp`min(50vw, 55vh)`

  const portraitSize = useCssExp`min(95vw, 55vh)`

  const size = orientation === ScreenOrientation.Landscape ? landscapeSize : portraitSize

  return <QrCode
    info={`${multiplayerUrl}/${search}`}
    colors={{
      foreground: constants.colorBackgroundDark,
      background: constants.colorBackgroundLight
    }}
    size={size}
  />
}

export default ShareGameQrCode
