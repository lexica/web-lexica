export const Direction = {
  North: 'north',
  East: 'east',
  South: 'south',
  West: 'west',
} as const

export const Directions = [
  Direction.North,
  Direction.East,
  Direction.South,
  Direction.West
] as const

export type DirectionT = typeof Direction[keyof typeof Direction]
