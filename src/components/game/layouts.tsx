import './layout.css'

type VerticalContainerProps = {
  Board: JSX.Element,
  MostRecentGuess: JSX.Element,
  Guesses: JSX.Element,
  Score: JSX.Element
}

type HorizontalContainerProps = VerticalContainerProps & {
  FoundWords: JSX.Element
}

export const HorizontalContainer: React.FC<HorizontalContainerProps> = ({
  Board,
  MostRecentGuess,
  Guesses,
  Score,
  FoundWords
}) => {
  return <div className="game-horizontal-container">
    <div className="left-pane">
      <div className="board-holder">{Board}</div>
      <div className="most-recent-guess-holder">{MostRecentGuess}</div>
    </div>
    <div className="right-pane">
      <div className="score-holder">{Score}</div>
      <div className="list-titles-holder">
        <div className="title">Guesses</div>
        <div className="title">Found Words</div>
      </div>
      <div className="lists-holder">
        <div className="guesses-holder">{Guesses}</div>
        <div className="found-words-holder">{FoundWords}</div>
      </div>
    </div>
  </div>
}

export const VerticalContainer: React.FC<VerticalContainerProps> = ({
  Board,
  MostRecentGuess,
  Guesses,
  Score
}) => {
  return <div className="game-vertical-container">
    {Board}
    {MostRecentGuess}
    {Guesses}
    {Score}
  </div>
}
