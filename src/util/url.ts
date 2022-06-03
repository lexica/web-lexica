
export const parseURLSearch = <T = any>(search: string): T => {
  const keyValuePairs = search.replace('?', '').split('&')
  return keyValuePairs.reduce((acc: Partial<T>, keyValuePair: string) => {
    const [key, value] = keyValuePair.split('=')
    return {
      ...acc,
      [decodeURI(key) as keyof T]: decodeURI(value) as unknown as T[keyof T]
    }
  }, {} as Partial<T>) as T
}

export type Location = {
  hostname: string,
  port: string,
  protocol: string,
}

export const getBaseUrl = ({ hostname, port, protocol }: Location = window.location) => {
  const usePort = !(port === '443' || port === '80')
  return `${protocol}//${hostname}${usePort ? `:${port}` : ''}`
}
