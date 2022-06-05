import { normalize } from 'duration-fns'
import { useContext, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import GameModeDetails from '../components/GameModeDetails'
import { useConstants } from '../style/constants'
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/round/play_circle.svg'
import { ReactComponent as Delete } from '@material-design-icons/svg/round/delete.svg'
import { findRulesetId, SavedRulesets, useRulesets } from '../game/rules'
import { clearSaveGameData, getSavedGameList, SavedGame as SavedGameType, useResumedGame, useSavedGameList } from '../game/save-game'
import { utf8ToB64 } from '../util/base-64'

import './SavedGames.css'
import Svg from '../components/Svg'
import { useSafeNavigateBack } from '../util/url'
import { makeRenderableBadge, useRenderInBanner } from '../components/Banner'

const getTime = ({ timer }: SavedGameType) => {
  const { minutes, seconds } = normalize({ seconds: timer })
  const format = (num: number) => (num < 0 ? 0 : num).toString().padStart(2, '0')
  return `${format(minutes)}:${format(seconds)}`
}

type SavedGameProps = {
  url: string,
  isSelected: boolean,
  handleSelect: (url: string) => void,
  handleDelete: (url: string) => void,
  handleResume: (url: string) => void,
}

const SavedGame = ({
  url,
  isSelected,
  handleSelect,
  handleDelete,
  handleResume
}: SavedGameProps): JSX.Element => {
  const savedGame = useResumedGame(url)
  const { fontSizeSubscript } = useConstants()

  const savedRulesets = useContext(SavedRulesets)

  const rulesetId = findRulesetId(savedRulesets, savedGame.rules)

  const rulesetName = rulesetId ? savedRulesets[rulesetId].name : 'Custom Game'

  const onSelect = useCallback(() => handleSelect(url), [url, handleSelect])
  const onDelete = useCallback(() => handleDelete(url), [url, handleDelete])
  const onResume = useCallback(() => handleResume(url), [url, handleResume])

  return <>
    <div
      className={`saved-games-game-details ${isSelected ? 'saved-games-game-details-selected': ''}`}
      onClick={onSelect}
    >
      <div className='saved-games-game-details-ruleset-name'>{rulesetName}</div>
      <div className='saved-games-game-details-rules-wrapper' >
        <GameModeDetails ruleset={savedGame.rules} size={fontSizeSubscript} />
      </div>
      <div className='saved-games-game-details-remaining-time'>{getTime(savedGame)}</div>
    </div>
    {
      !isSelected ? '' : <div className='saved-games-game-details-action-menu'>
          <div
            className='saved-games-game-details-action-menu-button'
            onClick={onResume}
          >
            <Svg.Standard
              svg={PlayCircle}
              title='Resume'
            />
            Resume
          </div>
          <div
            className='saved-games-game-details-action-menu-button'
            onClick={onDelete}
          >
            <Svg.Standard
              svg={Delete}
              title='Delete'
            />
            Delete
          </div>
        </div>
    }
  </>
}

// const ClearAllSavedGames: Renderable = ({ maxHeight, maxWidth }) => {
//   const { fontSizeTitle, colorContentDark } = useConstants()
//   const height = Math.min(maxHeight*4/5, fontSizeTitle)
//   return <div
//     style={{
//       height: maxHeight,
//       maxWidth,
//       borderRadius: maxHeight/3,
//       lineHeight: height,
//       fontSize: height,
//       paddingInline: maxHeight/2
//     }}
//     className='saved-games-clear-saved-games'
//     onClick={handleClearAllSavedGames}
//   >
//     <Svg.Customizable
//       svg={Delete}
//       props={{
//         title: 'Clear all saved games',
//         fill: colorContentDark,
//         height,
//       }}
//     />
//     Clear All
//   </div>
// }

const SavedGames = (): JSX.Element => {
  const savedRulesets = useRulesets()
  const savedGames = useSavedGameList()
  const [selectedGame, setSelectedGame] = useState('')
  const navigate = useNavigate()
  const goBack = useSafeNavigateBack()

  const handleDelete = useCallback((url: string) => {
    clearSaveGameData(url)
    const remainingGames = getSavedGameList()
    if (remainingGames.length === 0) {
      goBack()
      return
    }
    setSelectedGame(current => current === url ? '' : current)
  }, [setSelectedGame, goBack])

  const handleResume = useCallback((url: string) => {
    navigate(url)
  }, [navigate])

  const handleSelect = useCallback((url: string) => {
    if (url === selectedGame) {
      navigate(url)
      return
    }
    setSelectedGame(url)
  }, [navigate, selectedGame, setSelectedGame])

  const handleClearAllSavedGames = useCallback(() => {
    const games = getSavedGameList()
    for (const game of games) {
      clearSaveGameData(game)
    }
    goBack()
  }, [goBack])

  const renderable = useMemo(() => makeRenderableBadge({
    svgTitle: 'Clear All Saved Games',
    svg: Delete,
    onClick: handleClearAllSavedGames,
    prompt: 'Clear All'
  }), [handleClearAllSavedGames])

  useRenderInBanner(renderable)

  return <div className='SavedGames Page'>
    <div className='saved-games-game-details-headers'>
      <div className='saved-games-game-details-header-1'>
        Rule Name
      </div>
      <div className='saved-games-game-details-header-3'>
        Rule Details
      </div>
      <div className='saved-games-game-details-header-1'>
        Remaining Time
      </div>
    </div>
    <SavedRulesets.Provider value={savedRulesets}>
      {savedGames.map((url) => <SavedGame
        handleDelete={handleDelete}
        handleResume={handleResume}
        handleSelect={handleSelect}
        isSelected={url===selectedGame}
        url={url}
        key={`saved-game-details-${utf8ToB64(url)}`}
      />)}
    </SavedRulesets.Provider>
  </div>
}


export default SavedGames
