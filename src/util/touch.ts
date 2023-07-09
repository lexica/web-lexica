const getMagnitued = (v1: Point2, v2: Point2) => {
  const x = Math.abs(v1.x - v2.x)
  const y = Math.abs(v1.y -v2.y)
  return Math.sqrt(x*x+y*y)
}

export type Point2 = { x: number, y: number }

export type GetPointOnGridInfoArguments = {
  gridOrigin: Point2,
  squareDimensions: Point2,
  point: Point2,
  useBoundingBox?: boolean
  boundingBox: { min: Point2, max: Point2 }
}

export type PointOnGridInfo = {
  residingSquare: Point2
  centerOfSquare: Point2
  pointDistanceFromCenterOfSquare: number
}

const getUnadjustedIndex = (dimension: number, point: number, offset: number) => {
  const isNegative = point < 0
  return Math.floor((point - offset) / dimension) * (isNegative ? -1 : 1)
}

export const getPointOnGridInfo = ({
  gridOrigin,
  squareDimensions,
  point,
  useBoundingBox,
  boundingBox
}: GetPointOnGridInfoArguments): PointOnGridInfo => {
  const { x: originX, y: originY } = gridOrigin
  const { x: width, y: height } = squareDimensions
  const { x, y } = point

  const getOffset = (dimension: number, origin: number) => origin % dimension
  const xOffset = getOffset(width, originX)
  const yOffset = getOffset(height, originY)

  const xIndexUnadjusted = getUnadjustedIndex(width, x, xOffset)
  const xBaseIndex = getUnadjustedIndex(width, originX, xOffset)

  const yIndexUnadjusted = getUnadjustedIndex(height, y, yOffset)
  const yBaseIndex = getUnadjustedIndex(height, originY, yOffset)

  const xIndex = xIndexUnadjusted - xBaseIndex
  const yIndex = yIndexUnadjusted - yBaseIndex
  const getBoundedIndex = (min: number, max: number, index: number) => useBoundingBox
    ? (index < min ? min : index > max ? max : index)
    : index

  const residingSquare = {
    x: getBoundedIndex(boundingBox.min.x, boundingBox.max.x, xIndex),
    y: getBoundedIndex(boundingBox.min.y, boundingBox.max.y, yIndex)
  }

  const getCenterOfIndex = (index: number, dimension: number, origin: number) => Math.round(index * dimension + dimension / 2 + origin)

  const centerOfSquare = {
    x: getCenterOfIndex(residingSquare.x, width, originX),
    y: getCenterOfIndex(residingSquare.y, height, originY)
  }
  const averageDimension = (width + height) / 2

  const pointDistanceFromCenterOfSquare = getMagnitued(point, centerOfSquare) / averageDimension

  return {
    residingSquare,
    centerOfSquare,
    pointDistanceFromCenterOfSquare
  }
}
