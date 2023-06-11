/**
 * Builds the `public/available-locales.json`
 * 
 * Is called with `yarn build`
 */

const fs = require('fs')

/** @type {(rawCode: string) => string} */
const toCode = rawCode => rawCode.replace(/_/g, '-')

const main = () => {
    /** @type {string[]} */
    const rawCodes = fs.readdirSync('./public/locales', { encoding: 'utf-8' })

    availableLanguages = rawCodes.reduce((acc, rawCode) => {
        const langCode = toCode(rawCode)
        return {
            ...acc,
            [rawCode]: (new Intl.DisplayNames(langCode, { type: 'language' })).of(langCode.toLocaleUpperCase(langCode))
        }
    }, {})

    fs.writeFileSync('./public/available-locales.json', JSON.stringify(availableLanguages))
}



if (require.main == module) {
    main()
}
