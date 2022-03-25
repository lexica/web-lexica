import Game from './Game'

const WordOfTheDay = (props: { useWordleWords?: boolean }): JSX.Element => {
  const { useWordleWords = false } = props
  return <Game wordOfTheDay useWordleWords={useWordleWords} />
}

export default WordOfTheDay
