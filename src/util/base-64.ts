// Adapted from https://developer.mozilla.org/en-US/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
export const utf8ToB64 = (utf8: string) => {
  return window.btoa(unescape(encodeURIComponent(utf8)))
}

export const b64ToUtf8 = (b64: string) => {
  return decodeURIComponent(escape(window.atob(b64)))
}