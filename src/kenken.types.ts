export enum MathOperators {
  ADDITION = 'A',
  SUBTRACTION = 'S',
  MULTIPLICATION = 'M',
  DIVISION = 'D',
  GREATEST_COMMON_DIVISOR = 'GCD',
  LOWEST_COMMON_MULTIPLE = 'LCM',
  MODULUS = 'MOD',
  MINIMUM = 'MIN',
  MAXIMUM = 'MAX'
}

export interface MathGroup {
  operation: MathOperators
  result: number
  cells: number[]
}

export interface KenKen {
  math: MathGroup[]
  cells: number[]
  operations: MathOperators[]
  size: number
  seed: number
}

export interface KenKenOptions {
  maxSingleCells?: number
  size?: number
  seed?: number
  groupingRatio?: number
  operations?: MathOperators[]
  maxLayoutAttempts?: number
  groupSizeConstraints?: {[key: number]: {min: number, max: number}}
}

export interface CanvasRenderOptions {
  cellSize?: number
  thickness?: number
  backgroundColor?: string
  solutionFontColor?: string
  clueFontColor?: string
  thinLineColor?: string
  groupLineColor?: string
  groupThickness?: number
  cellPadding?: number
  solutionFont?: string
  mathFont?: string
  withSolution?: boolean
  lineJoin?: CanvasLineJoin
}

export enum Direction {
  RIGHT = 'right',
  LEFT = 'left',
  DOWN = 'down',
  UP = 'up'
}

export interface SpaceQuad <T> {
  x: number
  y: number
  data: T
  left: SpaceQuad<T>
  right: SpaceQuad<T>
  bottom: SpaceQuad<T>
  top: SpaceQuad<T>
}

export interface Point {
  x: number
  y: number
}

export interface Line {
  from: Point
  to: Point
}
