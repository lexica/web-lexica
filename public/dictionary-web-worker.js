/**
 * @template {any} T
 * @typedef {import('../src/game/board/types').Board} Board
 * @typedef {Board[number][number]} Letter
 * @typedef {import('../src/game/board/types').Coordinates} Coordinates
 * @typedef {import('../src/game/board/util').VisitNeighborsOptions<T>} VisitNeighborsOptions
 */


/**
 * @template {any} T
 * @param {T[][]} arrays
 * @returns {T[]}
 */
const flatten = (...arrays) => arrays.reduce((acc, arr) => [...acc, arr], []) 

/**
 * @template {any} T
 * @param {(item: T) => boolean} predicate
 * @param {T[]} array
 * @returns {T[]}
*/
const reject = (predicate, array) => array.filter(i => !predicate(i))

/**
 * @template {any} T
 * @param {T[]} array
 * @returns {T[]}
 */
const uniq = array => array.reduce((acc, i) => acc.includes(i) ? acc : [...acc, i], [])

/**
 * 
 * @param {Board} board
 * @returns {Board}
 */
const deepCopyBoard = (board) => {
  const { width } = board
  const copy = { width }
  for(let row = 0; row < width; row++) {
    copy[row] = { index: row }
    for(let column = 0; column < width; column++) {
      copy[row][column] = { ...board[row][column] }
    }
  }
  return copy
}

/**
 * @param {{ rows: number[], columns: number[] }} param0
 * @returns {Coordinates[]}
 */
const getAllPossibleCoordinates = ({ rows, columns }) => rows.reduce(
  (acc, row) => [
    ...acc,
    ...columns.map<number, Coordinates>(column => ({ row, column }))
  ],
  []
)

/**
 * @template {any} Acc
 * @param {Board} board
 * @param {(acc: Acc, letter: Letter, coordinates: Coordinates) => Acc} callback
 * @param {Acc} initialValue 
 * @returns {Acc}
 */
const boardReduce = (board, callback, initialValue) => {
  const { width } = board
  let acc = initialValue

  for(let row = 0; row < width; row++) {
    for(let column = 0; column < width; column++) {
      acc = callback(acc, board[row][column], { row, column })
    }
  }
  return acc
}


/**
 * 
 * @param {{ row: number, column: number, width: number }} param0 
 * @returns {Coordinates[]}
 */
const getPossibleTravelDirections = ({ row, column, width }) => {
  const unfilteredRows = [row - 1, row, row + 1]
  const rows = unfilteredRows.filter((potentialRow) => potentialRow >= 0 && potentialRow < width)
  const unfilteredColumns = [column - 1, column, column + 1]
  const columns = unfilteredColumns.filter((potentialColumn) => potentialColumn >= 0 && potentialColumn < width)

  const coordinates = getAllPossibleCoordinates({ rows, columns })

  return coordinates.filter(({ row: currentRow, column: currentColumn }) => !(row === currentRow && column === currentColumn))
}

class VisitedNeighbor {}

/**
 * @template {any} T
 * @param {VisitNeighborsOptions<T>} options
 * @param {Board} board
 * @param {Coordinates} coordinates
 * @returns {T[]}
 */
const visitNeighbors = ({ callback, onlyUnvisitedNeighbors }, board, coordinates) => {
  const neighbors = getPossibleTravelDirections({
    ...coordinates,
    width: board.width
  })


  const results = neighbors.map(({ row, column }) => {
    const invokeCallback = () => callback(board[row][column], { row, column })
    if (onlyUnvisitedNeighbors) return board[row][column].visited
      ? new VisitedNeighbor()
      : invokeCallback()
    return invokeCallback()
  })

  return results.filter(val => !(val instanceof VisitedNeighbor))
}


/**
 * @param {string[]} remainingWords
 * @param {string} lettersSoFar
 * @param {Board} board
 * @returns {(square: Letter, coords: Coordinates) => string[]}
 */
const visitNeighborsCallback = (remainingWords, lettersSoFar, board) => (square, coords) => {
  const letterChain = `${lettersSoFar}${square.letter}`
  const letterChainIsWord = remainingWords.includes(letterChain)
  const wordsToFilter = letterChainIsWord ? remainingWords.filter(w => w !== letterChain) : remainingWords

  const toReturn = letterChainIsWord ? [letterChain] : []

  const partialLetterChainMatches = wordsToFilter.filter(w => w.indexOf(letterChain) === 0)
  if (partialLetterChainMatches.length) {
    const { row, column } = coords
    const newBoard = deepCopyBoard(board)
    newBoard[row][column].visited = true

    const callback = visitNeighborsCallback(partialLetterChainMatches, letterChain, newBoard)

    const visitResults = flatten(visitNeighbors({ callback, onlyUnvisitedNeighbors: true}, newBoard, coords))
    return [...toReturn, ...visitResults]
  }

  return toReturn
}


/**
 * 
 * @param {Board} board
 * @param {string[]} dictionary
 * @param {number} minWordLength
 * @returns {string[]}
 */
const getWordsOnBoard = (board, dictionary, minWordLength) => {
  const wordsOfValidLength = dictionary.filter(w => w.length >= minWordLength)
  const { foundWords } = boardReduce(board, ({ remainingWords, foundWords }, square, coordinates) => {
    if (!remainingWords.length) return { remainingWords, foundWords }
    const { row, column } = coordinates

    // edge-case of min-length of words being 1...
    if (remainingWords.includes(square.letter)) {
      foundWords.push(square.letter)
      remainingWords.splice(remainingWords.indexOf(square.letter), 1)
    }

    const newBoard = deepCopyBoard(board)
    newBoard[row][column].visited = true

    const callback = visitNeighborsCallback(remainingWords, square.letter, newBoard)

    const newFoundWords = flatten(visitNeighbors({ callback, onlyUnvisitedNeighbors: true }, newBoard, coordinates))

    const unfoundWords = reject(w => newFoundWords.includes(w), remainingWords)

    return { remainingWords: unfoundWords, foundWords: [...foundWords, ...newFoundWords] }

  }, { remainingWords: wordsOfValidLength, foundWords: [] })

  return uniq(foundWords)
}

