type AtomTypes = string | number | boolean | Date | null | undefined | []

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends AtomTypes ? T[P] : DeepPartial<T[P]>
}

export type FullTranslation = {
  Home: {
    newGame: string,
    multiplayer: string,
    tryLexicle: string,
    highScore: string,
    mode: string,
    title: string,
    subtitle: string
  },
  MultiplayerStartScreen: {
    hostStartGamePrompt: string,
    playerStartGamePrompt: string,
    hostStartGameButton: string,
    playerStartGameButton: string,
    refreshBoardButton: string,
    wordCount: {
      word: string,
      word_plural: string
    }
  },
  score: {
    time: string,
    words: string,
    score: string
  },
  gameMode: {

  }
}

export type Translation = DeepPartial<FullTranslation>
