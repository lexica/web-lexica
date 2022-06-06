export {
  useResumedGame,
  useSaveGame,
  useSavedGames,
  useSavedGames as useSavedGameList
} from './hooks'

export type {
  SavedGame,
} from './types'

export {
  GameLocalStorage,
  LocalStorage,
  gameLocalStorage
} from './types'

export {
  clearSaveGameData,
  getSavedGameList,
  savedGameExistsForUrl,
} from './util'


