import { useCallback, useContext, useState } from 'react'
import { Translations } from '../../translations'
import type { OnChangeEvent } from './types'

const Name = ({ handleNameUpdate }: { handleNameUpdate: (name: string) => void}) => {
  const [rawName, setRawName] = useState('')
  const { translationsFn } = useContext(Translations)

  const handleChange = useCallback((e: OnChangeEvent) => {
    setRawName(e?.target?.value)
    handleNameUpdate(e?.target?.value)
  }, [setRawName, handleNameUpdate])

  const prefix = 'new-game-mode'
  return <div className={`${prefix}-name-container`}>
    <input
      className={`${prefix}-text-input ${prefix}-name`}
      about={translationsFn('pages.newGameMode.gameModeName.description')}
      type="text"
      onChange={handleChange}
      placeholder={translationsFn('pages.newGameMode.gameModeName.hint')}
      value={rawName}
      required
      minLength={1}
    />
    <div className={`${prefix}-name-explanation`}>{translationsFn('pages.newGameMode.gameModeName.description')}</div>
  </div>
}

export default Name
