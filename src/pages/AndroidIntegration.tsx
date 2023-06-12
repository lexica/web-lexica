import { useContext } from 'react'
import Button from '../components/Button'
import Radio from '../components/Radio'
import { Translations } from '../translations'
import { useAndroidInteropSettings, androidDetectBehaviors } from '../util/android-interop'


const AndroidDetectSettings = (): JSX.Element => {
  const { androidDetectBehavior, setAndroidDetectBehavior } = useAndroidInteropSettings()


}

const AndroidIntegration = (): JSX.Element => {
  const { } = useAndroidInteropSettings()
  const { translationsFn } = useContext(Translations)
  const autoOpenApp = translationsFn('pages.androidIntegration.autoRedirectPrompt')
  
  return (
    <div className="Page android-integration android-integration-button-list">
      <Button prompt={}/>
      <Radio
        
      />
    </div>
  )
}

export default AndroidIntegration
