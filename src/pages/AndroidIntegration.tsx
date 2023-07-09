import { useCallback, useContext, useMemo, useState } from 'react'
import Button from '../components/Button'
import Radio from '../components/Radio'
import { Translations } from '../translations'
import { useAndroidInteropSettings, androidDetectBehaviors, AndroidDetectBehavior } from '../util/android-interop'
import RadioList, { RadioListOption } from '../components/RadioList'
import { useStaticValue } from '../util/hooks'


// const AndroidDetectSettings = (): JSX.Element => {
//   const { androidDetectBehavior, setAndroidDetectBehavior } = useAndroidInteropSettings()


// }
enum IntegrationOption {
  AutoOpen = 'auto-open',
  AutoDetect = AndroidDetectBehavior.AutoDetect,
  ForceShow = AndroidDetectBehavior.ActAsAndroid,
  ForceHide = AndroidDetectBehavior.ActAsNonAndroid,
}

const AndroidIntegration = (): JSX.Element => {
  const { androidDetectBehavior, setAndroidDetectBehavior, autoAppRedirect, setAutoAppRedirect } = useAndroidInteropSettings()

  const { translationsFn } = useContext(Translations)
  const autoOpenAppPrompt = translationsFn('pages.androidIntegration.autoRedirectPrompt')
  const autoOpenAppHint = translationsFn('pages.androidIntegration.autoRedirectHint')
  const autoDetectPrompt = translationsFn('pages.androidIntegration.autoDetectAndroidPrompt')
  const autoDetectHint = translationsFn('pages.androidIntegration.autoDetectAndroidHint')
  const forceHidePrompt = translationsFn('pages.androidIntegration.forceHideAndroidSettingsPrompt')
  const forceHideHint = translationsFn('pages.androidIntegration.forceHideAndroidSettingsHint')
  const forceShowPrompt = translationsFn('pages.androidIntegration.forceShowAndroidSettingsPrompt')
  const forceShowHint = translationsFn('pages.androidIntegration.forceShowAndroidSettingsHint')
  const options = useMemo<RadioListOption<string>[]>(() => [
    {
      title: autoOpenAppPrompt,
      hint: autoOpenAppHint,
      value: IntegrationOption.AutoOpen,
    },
    {
      title: autoDetectPrompt,
      hint: autoDetectHint,
      value: IntegrationOption.AutoDetect,
    },
    {
      title: forceHidePrompt,
      hint: forceHideHint,
      value: IntegrationOption.ForceHide,
    },
    {
      title: forceShowPrompt,
      hint: forceShowHint,
      value: IntegrationOption.ForceShow,
    }
  ], [autoOpenAppPrompt, autoOpenAppHint, autoDetectPrompt,autoDetectHint, forceHidePrompt, forceHideHint, forceShowPrompt, forceShowHint])

  const selectedValue: IntegrationOption = autoAppRedirect ? IntegrationOption.AutoOpen : androidDetectBehavior as any

  const setSelectedValue = useCallback((value: string) => {
    const enumVal: IntegrationOption = value as any
    switch (enumVal) {
    case IntegrationOption.AutoOpen:
      setAutoAppRedirect(true)
      setAndroidDetectBehavior(AndroidDetectBehavior.ActAsAndroid)
      break
    default:
      setAutoAppRedirect(false)
      setAndroidDetectBehavior(enumVal as any as AndroidDetectBehavior)
      break
    }
  }, [setAutoAppRedirect, setAndroidDetectBehavior])

  return (
    <div className="Page android-integration android-integration-button-list">
      <RadioList
        options={options}
        onValueSelect={setSelectedValue}
        selectedValue={selectedValue}
        roundHighlightCorners
      />
    </div>
  )
}

export default AndroidIntegration
