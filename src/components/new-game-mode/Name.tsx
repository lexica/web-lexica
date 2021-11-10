import { useCallback, useState } from 'react'
import { OnChangeEvent } from './types'

const Name = ({ handleNameUpdate }: { handleNameUpdate: (name: string) => void}) => {
  const [rawName, setRawName] = useState('')
  const handleChange = useCallback((e: OnChangeEvent) => {
    setRawName(e?.target?.value)
    handleNameUpdate(e?.target?.value)
  }, [setRawName, handleNameUpdate])
  const prefix = 'new-game-mode'
  return <div className={`${prefix}-name-container`}>
    <input
      className={`${prefix}-text-input ${prefix}-name`}
      about="For choosing game mode"
      type="text"
      onChange={handleChange}
      placeholder="Name"
      value={rawName}
      required
      minLength={1}
    />
    <div className={`${prefix}-name-explanation`}>For choosing game mode</div>
  </div>
}

export default Name
