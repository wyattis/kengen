export enum MathOperators {
  ADDITION = 'A',
  SUBTRACTION = 'S',
  MULTIPLICATION = 'M',
  DIVISION = 'D'
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
}

export interface CanvasRenderOptions {
  cellSize?: number
  thickness?: number
  cellPadding?: number
  solutionFont?: string
  mathFont?: string
  withSolution?: boolean
  lineJoin?: CanvasLineJoin
}

export enum Direction {
  RIGHT,
  LEFT,
  DOWN,
  UP
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
