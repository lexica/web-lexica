import { useState } from 'react'

export const useInterval = <T extends any>(callback: (...args: any[]) => T, interval: number, initialValue?: T): [T, () => void] => {
  const [value, setValue] = useState<T | undefined>(initialValue)
  const [intervalValue] = useState(setInterval(() => setValue(callback), interval))

  const stopInterval = () => clearInterval(intervalValue)

  return [value as T, stopInterval]
}
