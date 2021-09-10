export const logger = {
  error: console.error,
  info: console.info,
  debug: process.env.NODE_ENV === 'production' ? (..._: any[]) => {} : console.log
}
