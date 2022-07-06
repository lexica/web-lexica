import { Translation } from "./types";

export const translationsFromWebToAndroid = {
  pages: {
    home: {
      headlineTitle: {
        tag: 'string',
        name: 'app_name'
      },
      newGame: {
        tag: 'string',
        name: 'new_game'
      },
      multiplayer: {
        tag: 'string',
        name: 'multiplayer'
      },
    },
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
        wordLength: {
          tag: 'string',
          name: 'word_length'
        },
        letterPoints: {
          tag: 'string',
          name: 'letter_points'
        }
      }
    },
    multiplayer: {
      title: {
        tag: 'string',
        name: 'multiplayer'
      },
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
      }
    },
    lexicons: {
      title: {
        tag: 'string',
        name: 'pref_dict'
      },
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
        quantity: 'one'
      }
    },
    time_other: {
      tag: 'plurals',
      name: 'num_minutes',
      value: {
        tag: 'item',
        quantity: 'other'
      }
    }
  },
  lexicaGameScreens: {
    inGame: {
      foundWords: {
        tag: 'string',
        name: 'found_words'
      }
    },
    results: {
      foundWords: {
        tag: 'string',
        name: 'found_words'
      },
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
      name: 'value_max_percentage'
    }
  }
}

export const languageTitlesFromWebToAndroid = {
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
