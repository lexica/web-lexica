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

    availableLanguages = rawCodes.reduce((acc, rawCode) => ({
        ...acc,
        [rawCode]: (new Intl.DisplayNames(toCode(rawCode), { type: 'language' })).of(toCode(rawCode))
    }), {})

    fs.writeFileSync('./public/available-locales.json', JSON.stringify(availableLanguages))
}



if (require.main == module) {
    main()
}
