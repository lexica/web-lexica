export type UseEffectCleanup = () => void

export type GetWithDefault<D> = {
  key: string,
  parser: (val: string) => D,
  defaultValue: D
}

export const getWithDefault = <D>({ key, parser, defaultValue }: GetWithDefault<D>): D => {
  const item = localStorage.getItem(key)

  return item ? parser(item) : defaultValue
}

export const getUseEffectLocalStorageListener = (
  keyToListenFor: string,
  onKeyChange: (newValue: string | null, oldValue: string | null) => void
): UseEffectCleanup => {
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === keyToListenFor) onKeyChange(event.newValue, event.oldValue)
    }

    window.addEventListener('storage', handleStorageUpdate)

    return () => window.removeEventListener('storage', handleStorageUpdate)
}
