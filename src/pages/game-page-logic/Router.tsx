// How to switch between game things
// Different routes!
// So, shadow routes where the different routes were replaced by a game url
  // User navigates to /singleplayer, no searchstring
  // SinglePLayer sets sessionStorage to the following:
  // {
  //   gameInitialization: {
  //     url: '/singleplayer', (retrieved using getGamepath)
  //     gameType: 'singleplayer',
  //   }
  // }
  // Then navigates to /logic/router

import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Route, Routes } from "react-router"
import StartScreen from "../../components/StartScreen"
import { BoardContext, BoardRefresh } from "../../game/board"
import { Dictionary } from "../../game/dictionary"
import { Language } from "../../game/language"
import { Rules } from "../../game/rules"
import { savedGameExistsForUrl } from "../../game/save-game"
import { getSearchString } from "../../game/url"
import { logger } from "../../util/logger"
import { getGamePath } from "../../util/url"
import { NewGameProviders } from "../../components/GameProviders"

  // GameRouter sets url to /${gameType}?${search} (obviously with logic to omit the ?)
  // GameRouter uses search to see if a saved game is present for
  // GameRouter sets sessionStorage to the following: 
  // {
  //   gameInitialization: ...,
  //   startScreen: {
  //     autoStart: true,
  //     updateUrl: true,
  //   }
  // }
  // GameController then navigates to /logic/new-game/start-screen/autostart/update-url (this makes problems for the banner's back button, but let's think about that later)

  // StartScreen sets url to ${gameInitialization.url}
  // StartScreen see's updateUrl is true, and autoStart is true,
  // so it sets the screen as loading, waiting for providers to report that they are
  // ready to go
  // when providers are ready, StartScreen sets sessionStorage to the following:
  // {
  //   gameInitialization: {
  //     url: '/singleplayer?b=asdfasdfadsf&other-stuff',
  //     gameType: 'singleplayer'
  //   },
  //   startScreen: ...
  // }
  // It then immediately navigates to /game-controller/game

  // Game sets url to ${gameInitialization.url}
  // Game will be responsible for saving game state.
  // Game plays game
  // When game is finished, Game clears saved data, and navigates to /game-controller/results

  // Results sets url to ${gameInitialization.url}
  // Results shows game results
  // Eventually, the user hits the back button which should go back to the main screen.

  // User navigates to /singleplayer?searchstring
  // SinglePlayer sets sessionStorage to:
  // {
  //   gameInitialization: {
  //     url: '/singleplayer?searchstring', (retrieved using getGamepath)
  //     gameType: 'singleplayer',
  //     gameOriginType: 'new',
  //   }
  // }

  // GameController sets url to gameInitialization.url
  // GameController uses search to see if a saved game is present for gameInitialization.url
  // A saved game is found and correct providers are used.
  // GameController sets sessionStorage to the following: 
  // {
  //   gameInitialization: ...,
  //   startScreen: {
  //     autoStart: true,
  //     updateUrl: false,
  //   }
  // }
  // GameController then navigates to /game-controller/start-screen (this makes problems for the banner's back button, but let's think about that later)

  // StartScreen sets url to ${gameInitialization.url}
  // StartScreen see's updateUrl is false, and autoStart is true,
  // so it sets the screen as loading, waiting for providers to report that they are
  // ready to go
  // when providers are ready, StartScreen navigates to /game-controller/game
  // No changes to sessionStorage are made.

  // Game sets url to ${gameInitialization.url}
  // Game will be responsible for saving game state.
  // Game plays game
  // When game is finished, Game clears saved data, and navigates to /game-controller/results

  // Results sets url to ${gameInitialization.url}
  // Results shows game results
  // Eventually, the user hits the back button which should go back to the main screen.

const getStartScreenProps = () => {
  const { gameType, gameOrigin } = getGameInitializationArgs()

  return {
    updateUrl: gameOrigin === 'new',
    autostart: gameOrigin === 'shared' && gameType === 'singleplayer'
  }
}

export type GameInitializationArgs = {
  pathname: string,
  search: string,
  gameType: string,
  gameOrigin: string
}

const getGameInitializationArgs = (): GameInitializationArgs => {
  return {
    pathname: '/singleplayer',
    search: '',
    gameType: 'singleplayer',
    gameOrigin: 'new-game',
    ...JSON.parse(window.sessionStorage.getItem('gameInitialization') || '{}')
  }
}

export const updateGameInitializationArgs = (updates: Partial<GameInitializationArgs>) => {
  const currentArgs = getGameInitializationArgs()
  window.sessionStorage.setItem('gameInitialization', JSON.stringify({
    ...currentArgs,
    ...updates
  }))
}

const useUpdatingSearch = (shouldUpdateSearch: boolean) => {
  const { pathname } = getGameInitializationArgs()
  const board = useContext(BoardContext)
  const language = useContext(Language)
  const rules = useContext(Rules)
  // const navigate = useNavigate()
  useEffect(() => {
    if (shouldUpdateSearch === true) {
      const search = getSearchString({ board, language: language.metadata.name, ...rules })

      updateGameInitializationArgs({ search })
    }
  }, [board, language, shouldUpdateSearch, rules, pathname /* , navigate */])
}

const StartScreenWrapper = () => {
  const navigate = useNavigate()
  const [{ updateUrl, autostart }] = useState(getStartScreenProps())
  const [loading, setLoading] = useState(true)
  const [triggered, setTriggered] = useState(false)
  const [error, setError] = useState(false)
  useUpdatingSearch(updateUrl)
  const boardRefresh = useContext(BoardRefresh)
  const language = useContext(Language)
  const dictionary = useContext(Dictionary)
  useEffect(() => {
    if (triggered) return
    setTriggered(true)
    logger.debug('running StartScreenWrapper update url once useEffect...')
    const gameInitialization = getGameInitializationArgs()
    window.location.pathname = gameInitialization.pathname
    window.location.search = gameInitialization.search
    navigate(getGamePath(gameInitialization), { replace: true })
  }, [navigate, triggered, setTriggered])
  useEffect(() => {
    const isLoading = language.loading || dictionary.loading
    const isError = language.error
    setLoading(isLoading)
    setError(isError)
  }, [language, dictionary])
  useEffect(() => {
    if (autostart && !loading) {
      logger.debug('StartScreenWrapper autostart useEffect running...')
      navigate('/game-screen')
    }
  }, [autostart, loading, navigate])

  const handleStart = useCallback(() => {
    navigate('/game-screen')
  }, [navigate])

  return <StartScreen 
    error={error}
    loading={loading}
    handleStart={handleStart}
    handleBoardRefresh={boardRefresh}
    pageTitle={'TESTING'}
  />
}

const GameScreenWrapper = () => <></>
const ResultsScreenWrapper = () => <></>

// const GameRoutes = () => {
//   return 
// }

const NewGame = () => {
  return <NewGameProviders>
<Routes >
    <Route path="start-screen" element={<StartScreenWrapper />}/>
    <Route path="game-screen" element={<GameScreenWrapper />} />
    <Route path="results-screen" element={<ResultsScreenWrapper />} />
  </Routes>
  </NewGameProviders>
}

const getGameOrigin = (args: GameInitializationArgs) => {
  const gamePath = getGamePath(args)
  if (savedGameExistsForUrl(gamePath)) return 'resume'
  if (gamePath.includes('multiplayer') && args?.search?.length) return 'shared'
  return 'new'
}

const getGameType = ({ pathname }: { pathname: string }) => {
  if (pathname.includes('multiplayer')) return 'multiplayer'
  if (pathname.includes('singleplayer')) return 'singleplayer'
  return 'unknown'
}

const GameInitializer = (): JSX.Element => {
  const navigate = useNavigate()
  useEffect(() => {
    const gameInitArgs = getGameInitializationArgs()
    const gameOrigin = getGameOrigin(gameInitArgs)
    const gameType = getGameType(gameInitArgs)
    updateGameInitializationArgs({ gameOrigin, gameType })
    if (gameOrigin === 'new') navigate('/logic/new-game/start-screen')
  }, [navigate])
  return <></>
}

const Router = () => <>
  <Routes >
    <Route path='/' element={<GameInitializer />} />
    <Route path='/new-game/*' element={<NewGame />}/>
  </Routes>
</>

export default Router
