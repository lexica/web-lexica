import Game from './Game'

const Random = (props: { useWordleWords?: boolean }): JSX.Element => {
  const { useWordleWords = false } = props
  return <Game useWordleWords={useWordleWords} />
}

export default Random
