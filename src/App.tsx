import { useState } from 'react';

import './App.css';

import Results from './components/Results';
import Game from './components/Game';
import StartScreen from './components/StartScreen';




function App() {
  const [started, updateStarted] = useState(false)
  const [results, updateResults] = useState({
    finished: false,
    foundWords: [] as string[],
    remainingWords: [] as string[]
  })

  const handleStart = () => updateStarted(true)
  const handleFinish = (foundWords: string[], remainingWords: string[]) => {
    console.log('handling finish...')
    updateResults({
      finished: true,
      foundWords,
      remainingWords
    })
  } 

  const {
    finished,
    foundWords,
    remainingWords
  } = results

  console.log({ finished })

  return (
      <div className="App">
        {
          finished
            ? <Results {...{ foundWords, remainingWords }}/>
            : started
              ? <Game {...{ handleFinish }}/>
              : <StartScreen {...{ handleStart }}/>
        }
      </div>
  );
}

export default App;
