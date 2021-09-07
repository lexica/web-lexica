import { useState } from 'react';

import './App.css';

import Results, { ResultsOrientation } from './components/Results';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import { useDictionary } from './game';
import { useRulesFromQueryString, Rules } from './game/rules';
import { useOrientation, ScreenOrientation } from './util/hooks';

const getResultsOrientation = (orientation: ScreenOrientation) => {
    switch(orientation) {
    case ScreenOrientation.Landscape:
      return ResultsOrientation.Horizontal
    case ScreenOrientation.Portrait:
    default:
      return ResultsOrientation.Vertical
  }
}

function App() {
  const [started, updateStarted] = useState(false)
  const [results, updateResults] = useState({
    finished: false,
    foundWords: [] as string[],
    remainingWords: [] as string[]
  })
  const rules = useRulesFromQueryString()

  const { loading, error, dictionary } = useDictionary(rules)

  const handleStart = () => updateStarted(true)
  const handleFinish = (foundWords: string[], remainingWords: string[]) => {
    console.log('handling finish...')
    updateResults({
      finished: true,
      foundWords,
      remainingWords
    })
  }

  const orientation = useOrientation()

  const {
    finished,
    foundWords,
    remainingWords
  } = results

  const resultsOrientation = getResultsOrientation(orientation)

  return (
      <div className="App">
        <Rules.Provider value={rules}>
          {
            finished
              ? <Results
                  {...{
                    foundWords,
                    remainingWords,
                    orientation: resultsOrientation
                  }}
                />
              : started
                ? <Game {...{ handleFinish, dictionary }}/>
                : <StartScreen {...{ handleStart, loading, error, dictionary }}/>
          }
        </Rules.Provider>
      </div>
  );
}

export default App;
