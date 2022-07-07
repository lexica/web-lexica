import { TOptionsBase } from 'i18next'

export type TranslationsKeys = {
  'pages.home.title': string,
  'pages.home.headlineTitle': string,
  'pages.home.subtitle': string,
  'pages.home.newGame': string,
  'pages.home.multiplayer': string,
  'pages.home.tryLexicle': string,
  'pages.home.resumeGame': string,
  'pages.home.gameMode': {
    'gameMode': string | number,
  },
  'pages.home.highScore': {
    'score': string | number,
  },
  'pages.gameModes.title': string,
  'pages.gameModes.addGameMode': string,
  'pages.newGameMode.title': string,
  'pages.newGameMode.minimumWordLength': string,
  'pages.newGameMode.timeAttack.title': string,
  'pages.newGameMode.timeAttack.off': string,
  'pages.newGameMode.timeAttack.hint': {
    'multiplier': string | number,
  },
  'pages.newGameMode.gameModeName.hint': string,
  'pages.newGameMode.gameModeName.description': string,
  'pages.newGameMode.timeLimit.title': string,
  'pages.newGameMode.timeLimit.description': string,
  'pages.newGameMode.boardSize': string,
  'pages.newGameMode.scoreType.title': string,
  'pages.newGameMode.scoreType.wordLength': string,
  'pages.newGameMode.scoreType.letterPoints': string,
  'pages.newGameMode.saveGameMode': string,
  'pages.multiplayer.title': string,
  'pages.multiplayer.gameTitle': string,
  'pages.multiplayer.refreshBoard': string,
  'pages.multiplayer.startGameHint': string,
  'pages.multiplayer.startGame': string,
  'pages.multiplayer.joinGameHint': string,
  'pages.multiplayer.joinGame': string,
  'pages.savedGames.title': string,
  'pages.savedGames.gameModeName': string,
  'pages.savedGames.gameModeDetails': string,
  'pages.savedGames.remainingTime': string,
  'pages.savedGames.resume': string,
  'pages.savedGames.delete': string,
  'pages.savedGames.clearAll': string,
  'pages.lexicle.title': string,
  'pages.lexicle.headlineTitle': string,
  'pages.lexicle.wordOfTheDay': string,
  'pages.lexicle.random': string,
  'pages.lexicle.useWordleWordList': string,
  'pages.wordOfTheDay.title': string,
  'pages.random.title': string,
  'pages.lexicons.title': string,
  'pages.lexicons.isBeta': string,
  'gameModeDetails.time': {
    'count': string | number,
  },
  'lexicaGameScreens.inGame.guesses': string,
  'lexicaGameScreens.inGame.foundWords': string,
  'lexicaGameScreens.results.foundWords': string,
  'lexicaGameScreens.results.missedWords': string,
  'lexicleGameScreens.results.shareScore': string,
  'lexicleGameScreens.results.shareGame': string,
  'lexicleGameScreens.results.shareGameTextWordOfTheDay': {
    'date': string | number,
    'numericScore': string | number,
    'visualScore': string | number,
    'url': string | number,
  },
  'lexicleGameScreens.results.shareScoreTextWordOfTheDay': {
    'date': string | number,
    'numericScore': string | number,
    'visualScore': string | number,
  },
  'lexicleGameScreens.results.shareScoreText': {
    'numericScore': string | number,
    'visualScore': string | number,
  },
  'lexicleGameScreens.results.shareGameText': {
    'numericScore': string | number,
    'visualScore': string | number,
    'url': string | number,
  },
  'lexicleGameScreens.results.shareScoreConfirmationText': string,
  'lexicleGameScreens.results.shareGameConfirmationText': string,
  'scoreDetails.time': string,
  'scoreDetails.words': string,
  'scoreDetails.score': string,
  'scoreDetails.displayPercentage': {
    'found': string | number,
    'total': string | number,
    'percentage': string | number,
  },
}

type TranslationsFnSecondArg<K extends keyof TranslationsKeys> = {
  0: TOptionsBase,
  1: TOptionsBase & TranslationsKeys[K]
}[ TranslationsKeys[K] extends string ? 0 : 1 ]

export type TranslationsFn = {
  <I extends keyof TranslationsKeys>(key: I, options: TranslationsFnSecondArg<I>): string
  <I extends keyof TranslationsKeys>(key: TranslationsKeys[I] extends string ? I : never, options?: TOptionsBase): string
}


export type LanguageTitlesKeys = {
  'ca': string,
  'de_DE': string,
  'de_DE_no_diacritics': string,
  'es': string,
  'es_solo_enne': string,
  'fa': string,
  'fr_FR': string,
  'fr_FR_no_diacritics': string,
  'hu': string,
  'it': string,
  'ja': string,
  'nl': string,
  'pl': string,
  'pt_BR': string,
  'pt_BR_no_diacritics': string,
  'ru': string,
  'ru_extended': string,
  'en_GB': string,
  'uk': string,
  'en_US': string,
}

type LanguageTitlesFnSecondArg<K extends keyof LanguageTitlesKeys> = {
  0: TOptionsBase,
  1: TOptionsBase & LanguageTitlesKeys[K]
}[ LanguageTitlesKeys[K] extends string ? 0 : 1 ]

export type LanguageTitlesFn = {
  <I extends keyof LanguageTitlesKeys>(key: I, options: LanguageTitlesFnSecondArg<I>): string
  <I extends keyof LanguageTitlesKeys>(key: LanguageTitlesKeys[I] extends string ? I : never, options?: TOptionsBase): string
}
