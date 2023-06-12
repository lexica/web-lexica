const R = require('ramda')
const { logger } = require('@storybook/node-logger')
/** @typedef {(val: string) => string} TransformerFn */

/** @type {TransformerFn} */
const countTransformer = str => str.replace(/%(\d\$)?d/, '{{count}}')

class Reference { constructor(ref) { this.ref = ref } toString() { return `$t(${this.ref})` } }

const translationsFromWebToAndroid = {
  pages: {
    home: {
      headlineTitle: new Reference('general.lexica'),
      multiplayer: new Reference('general.multiplayer'),
      newGame: {
        tag: 'string',
        name: 'new_game'
      },
      preferences: new Reference('general.preferences')
    },
    preferences: {
      title: new Reference('general.preferences'),
      language: new Reference('general.language'),
      lexicon: new Reference('general.lexicon'),
      androidSettings: new Reference('pages.androidIntegration.title'),
    },
    languages: { title: new Reference('general.language') },
    newGameMode: {
      gameModeName: {
        hint: {
          tag: 'string',
          name: 'input_game_mode_name_hint'
        },
        description: {
          tag: 'string',
          name: 'input_game_mode_name_description'
        }
      },
      timeLimit: {
        title: {
          tag: 'string',
          name: 'pref_timeLimit'
        },
        description: {
          tag: 'string',
          name: 'input_game_mode_minutes_description'
        }
      },
      boardSize: {
        tag: 'string',
        name: 'pref_boardSize'
      },
      scoreType: {
        title: {
          tag: 'string',
          name: 'pref_scoreType'
        },
        wordLength: new Reference('scoreDetails.wordLength'),
        letterPoints: new Reference('scoreDetails.letterPoints')
      }
    },
    multiplayer: {
      startGameHint: {
        tag: 'string',
        name: 'multiplayer__start_when_ready'
      },
      startGame: {
        tag: 'string',
        name: 'multiplayer__start_game'
      },
      joinGameHint: {
        tag: 'string',
        name: 'multiplayer_lobby__join_when_ready'
      },
      joinGame: {
        tag: 'string',
        name: 'multiplayer_lobby__join_game'
      },
      wordCount_one: {
        tag: 'plurals',
        name: 'num_available_words_in_game',
        value: {
          tag: 'item',
          quantity: 'one',
          transformerFn: countTransformer
        }
      },
      wordCount_other: [{
        tag: 'plurals',
        name: 'num_available_words_in_game',
        value: {
          tag: 'item',
          quantity: 'other',
          transformerFn: countTransformer
        }
      }, {
        tag: 'plurals',
        name: 'num_available_words_in_game',
        value: {
          tag: 'item',
          quantity: 'many',
          transformerFn: countTransformer
        }
      }]
    },
    lexicons: {
      title: new Reference('general.lexicon'),
      isBeta: {
        tag: 'string',
        name: 'lexicon_is_in_beta'
      }
    }
  },
  gameModeDetails: {
    time_one: {
      tag: 'plurals',
      name: 'num_minutes',
      value: {
        tag: 'item',
        quantity: 'one',
        transformerFn: countTransformer
      }
    },
    time_other: {
      tag: 'plurals',
      name: 'num_minutes',
      value: {
        tag: 'item',
        quantity: 'other',
        transformerFn: countTransformer
      }
    }
  },
  lexicaGameScreens: {
    inGame: {
      foundWords: new Reference('general.foundWords')
    },
    results: {
      foundWords: new Reference('general.foundWords'),
      missedWords: {
        tag: 'string',
        name: 'missed_words'
      }
    }
  },
  scoreDetails: {
    time: {
      tag: 'string',
      name: 'time'
    },
    words: {
      tag: 'string',
      name: 'words'
    },
    score: {
      tag: 'string',
      name: 'score'
    },
    displayPercentage: {
      tag: 'string',
      name: 'value_max_percentage',
      /** @type {TransformerFn} */
      transformerFn: str => { return str
        .replace('%1$d', '{{found}}')
        .replace('%2$d', '{{total}}')
        .replace('%3$d', '{{percentage}}')
        .replace('%%', '%')
      }
    },
    wordLength: {
      tag: 'string',
      name: 'word_length'
    },
    letterPoints: {
      tag: 'string',
      name: 'letter_points'
    }
  },
  general: {
      multiplayer: {
        tag: 'string',
        name: 'multiplayer'
      },
      lexica: {
        tag: 'string',
        name: 'app_name'
      },
      lexicon: {
        tag: 'string',
        name: 'pref_dict'
      },
      back: {
        tag: 'string',
        name: 'back'
      },
      foundWords: {
        tag: 'string',
        name: 'found_words'
      },
      preferences: {
        tag: 'string',
        name: 'prefs'
      }
  }
}
const languageTitlesFromWebToAndroid = {
  ca: { tag: 'string', name: 'pref_dict_ca' },
  de_DE: { tag: 'string', name: 'pref_dict_de_DE' },
  de_DE_no_diacritics: { tag: 'string', name: 'pref_dict_de_DE_no_diacritics' },
  es: { tag: 'string', name: 'pref_dict_es' },
  es_solo_enne: { tag: 'string', name: 'pref_dict_es_solo_enne' },
  fa: { tag: 'string', name: 'pref_dict_fa' },
  fr_FR: { tag: 'string', name: 'pref_dict_fr_FR' },
  fr_FR_no_diacritics: { tag: 'string', name: 'pref_dict_fr_FR_no_diacritics' },
  hu: { tag: 'string', name: 'pref_dict_hu' },
  it: { tag: 'string', name: 'pref_dict_it' },
  ja: { tag: 'string', name: 'pref_dict_ja' },
  nl: { tag: 'string', name: 'pref_dict_nl' },
  pl: { tag: 'string', name: 'pref_dict_pl' },
  pt_BR: { tag: 'string', name: 'pref_dict_pt_BR' },
  pt_BR_no_diacritics: { tag: 'string', name: 'pref_dict_pt_BR_no_diacritics' },
  ru: { tag: 'string', name: 'pref_dict_ru' },
  ru_extended: { tag: 'string', name: 'pref_dict_ru_extended' },
  en_GB: { tag: 'string', name: 'pref_dict_en_GB' },
  uk: { tag: 'string', name: 'pref_dict_uk' },
  en_US: { tag: 'string', name: 'pref_dict_en_US' }
}

const getCurrentPath = (path, key) =>  path ? `${path}.${key}` : key

const mergeNestedMappings = (map1, map2) => {
  return R.mergeDeepWithKey((key, item1, item2) => {
    if (key === '$references') return [...item1, ...item2]
    logger.warn(`had an unexpected key collision while merging nested translation mappings. key: ${key}`)
  }, map1, map2)
}

const handleFlip = ({ currentPath, obj, acc }) => {
  if (obj.value !== undefined) {
    const existingValue = acc[obj.name] || { tag: obj.tag, values: [] }
    return {
      ...acc,
      [obj.name]: {
        ...existingValue,
        values: [...existingValue.values, {
          ...obj.value,
          path: currentPath
        }]
      }
    }
  }

  const paths = acc[obj.name] ? acc[obj.name].paths : []

  return {
    ...acc,
    [obj.name]: {
      tag: obj.tag,
      ...(obj.value ? { value: obj.value } : {}),
      paths: [...paths, currentPath],
      ...(obj.transformerFn ? { transformerFn: obj.transformerFn } : {})
    }
  }
}

const getReduceFromAndroidToWeb = (path, subObject) => (acc, key) => {
  const value = subObject[key]
  const currentPath = getCurrentPath(path, key)

  if (value instanceof Reference) {
    const reference = {
      path: currentPath,
      referenceTo: value.toString()
    }
    return {
      ...acc,
      '$references': [...(acc['$references'] || []), reference]
    }
  }

  if (Array.isArray(value)) {
    return value.reduce((acc2, nestedValue) => {
      return handleFlip({ currentPath, obj: nestedValue, acc: acc2 })
    }, acc)
  }

  if (value.tag === undefined) {
    const reducer = getReduceFromAndroidToWeb(currentPath, value)
    const nested = Object.keys(value).reduce(reducer, {})
    return mergeNestedMappings(acc, nested)
  }

  return handleFlip({ currentPath, obj: value, acc })

}

const flipMap = obj => {
  const reducer = getReduceFromAndroidToWeb('', obj)
  return Object.keys(obj).reduce(reducer, {})
}

/** @typedef {{ tag: 'item', quantity: string, path: string, transformerFn?: (val: string) => string }} PluralValue */
/** @typedef {{ tag: 'string', paths: string[], transformerFn?: (val: string) => string } StringTag } */
/** @typedef {{ tag: 'plurals', values: PluralValue[] }} PluralTag */
/** @typedef {{ referenceTo: string, path: string }} ReferenceEntry */
/** @typedef {{ [key: string]: StringTag | PluralTag } & { '$references'?: ReferenceEntry[] }} AndroidToWebMap */

module.exports = {
  translationsFromWebToAndroid,
  languageTitlesFromWebToAndroid,
  /** @type {AndroidToWebMap} */
  translationsFromAndroidToWeb: flipMap(translationsFromWebToAndroid),
  /** @type {AndroidToWebMap} */
  languageTitlesFromAndroidToWeb: flipMap(languageTitlesFromWebToAndroid)
}
