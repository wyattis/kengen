export interface KenKenOptions {
  operations: MathOperators[]
  size: number
}

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

export interface KenKen extends KenKenOptions {
  math: MathGroup[]
  cells: number[]
}

export interface CanvasRenderOptions {
  cellSize: number
  thickness: number
  withSolution: boolean
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
