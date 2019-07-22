import { intersection, randomFrom, randomInt, range, setSeed, shuffle } from './M'
import { KenKen, KenKenOptions, MathGroup, MathOperators } from './kenken.types'
import { Queue } from './Queue'

// Shapes represented as a 2d binary grid
const shapes2: number[][][] = [[[1]], [[1, 1]]]
const shapes3 = shapes2.concat([[[1, 1, 1]], [[1, 1], [1, 0]], [[1, 1], [1, 1]]])
const shapes4 = shapes3.concat([[[1, 1, 1, 1]], [[1, 1, 1], [1, 0, 0]], [[1, 1, 1], [0, 0, 1]], [[1, 1, 1], [0, 1, 0]], [[1, 1, 1], [1, 0, 1]]])
const shapes5 = shapes4.concat([[[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]]])
const shapes6 = shapes5.concat([])

export class KenKenGenerator {

  static defaultOptions = {
    size: 4,
    operations: [MathOperators.ADDITION, MathOperators.SUBTRACTION],
    maxSingleCells: 2
  }

  static generate (opts: KenKenOptions = {}): KenKen {
    opts = Object.assign({}, KenKenGenerator.defaultOptions, opts)

    // Set the RNG seed
    const seed = opts.seed || randomInt(1, Math.pow(2, 32))
    setSeed(seed)

    // Fill the cells randomly while satisfying row and column constraints
    const cells = KenKenGenerator.randomizeCells(opts)
    console.log('cells', cells)

    // Make the math group spacial arrangement
    const math = KenKenGenerator.makeMath(cells, opts)
    console.log('math', math)

    return {
      size: opts.size,
      operations: opts.operations,
      seed,
      cells,
      math
    }
  }

  static randomizeCells (opts: KenKenOptions, maximumAttempts = 30, attempts = 0): number[] {
    if (attempts > maximumAttempts) throw Error('Not able to find cells that fit')
    const numCells = Math.pow(opts.size, 2)
    const rowQueue: number[][] = Array.from({ length: opts.size }, (_, i) => range(1, opts.size + 1))
    const colQueue: number[][] = Array.from({ length: opts.size }, (_, i) => range(1, opts.size + 1))
    const cells: number[] = []
    for (let i = 0; i < numCells; i++) {
      const { col, row } = KenKenGenerator.getCoords(i, opts.size)
      const candidates = intersection(rowQueue[row], colQueue[col])
      if (candidates.length === 0) {
        console.log('retrying', attempts)
        return KenKenGenerator.randomizeCells(opts, maximumAttempts, attempts + 1)
      }
      const candidate = randomFrom(candidates)
      const colIndex = colQueue[col].indexOf(candidate)
      const rowIndex = rowQueue[row].indexOf(candidate)
      // console.log(i, row, col, colIndex, rowIndex, 'candidate:', candidate, rowQueue[row], colQueue[col])
      rowQueue[row].splice(rowIndex, 1)
      colQueue[col].splice(colIndex, 1)
      cells.push(candidate)
    }
    return cells
  }

  static makeMath (cells: number[], opts: KenKenOptions): MathGroup[] {
    const groups: MathGroup[] = []
    const spacialGroups: number[][] = KenKenGenerator.makeSpacialGroups(cells, opts)
    console.log('spacial groups', spacialGroups)

    // Calculate the math operations
    for (const sGroup of spacialGroups) {
      const vals = sGroup.map(i => cells[i])
      vals.sort()
      const group: MathGroup = {
        operation: randomFrom(opts.operations),
        cells: sGroup,
        result: 0
      }
      switch (group.operation) {
        case MathOperators.ADDITION:
          group.result = vals.reduce((s, c) => s + c, 0)
          break
        case MathOperators.SUBTRACTION:
          group.result = vals.reduce((s, c) => s - c, 0)
          break
        case MathOperators.MULTIPLICATION:
          group.result = vals.reduce((s, c) => s * c, 1)
          break
        case MathOperators.DIVISION:
          group.result = vals.reduce((s, c) => s / c, 1)
          break
      }
      groups.push(group)
    }
    console.log('math groups', groups)
    return groups
  }

  static getCoords (index: number, size: number): { row: number, col: number } {
    return {
      col: index % size,
      row: Math.floor(index / size)
    }
  }

  static getShapeOptions (opts: KenKenOptions): number[][][] {
    let shapes
    switch (opts.size) {
      case 1:
        throw Error('KenKen must be at least 2x2')
      case 2:
        shapes = shapes2
        break
      case 3:
        shapes = shapes3
        break
      case 4:
        shapes = shapes4
        break
      case 5:
        shapes = shapes5
        break
      default:
        shapes = shapes6
    }
    // TODO: Transpose shapes for all possible rotations
    return shapes
  }

  static makeSpacialGroups (cells: number[], opts: KenKenOptions): number[][] {
    const availableShapes = KenKenGenerator.getShapeOptions(opts)

    function shapeFits (indices: number[], sieve: Set<number>, size: number): boolean {
      let positions: {col: number, row: number}[] = []
      for (const index of indices) {
        // If the position already belongs to another group or is invalid we return false
        if (sieve.has(index) || index >= Math.pow(size, 2)) return false
        const pos = KenKenGenerator.getCoords(index, size)
        if (!positions.length) {
          positions.push(pos)
        } else {
          if (!positions.find(p => p.col === pos.col || p.row === pos.row)) return false
        }
      }
      return true
    }

    function getShapeIndices (shape: number[][], size: number, startIndex: number): number[] {
      let indices = []
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (!shape[row][col]) continue
          const index = startIndex + row * size + col
          indices.push(index)
        }
      }
      return indices
    }

    const groups: number[][] = []
    const cellSieve: Set<number> = new Set()
    let numSingleCellGroups = 0
    for (let i = 0; i < cells.length; i++) {
      // Skip cells that have already been added to a group
      if (cellSieve.has(i)) continue

      shuffle(availableShapes)
      let shapesQueue
      // We filter out the single cell group once the maximum number has been exceeded
      if (numSingleCellGroups >= 2) {
        shapesQueue = new Queue(availableShapes.filter(s => !(s.length === 1 && s[0].length === 1)))
      } else {
        shapesQueue = new Queue(availableShapes)
      }
      let candidate
      let shapeIndices
      do {
        candidate = shapesQueue.next()
        shapeIndices = getShapeIndices(candidate, opts.size, i)
      } while (candidate && !shapeFits(shapeIndices, cellSieve, opts.size))

      if (!candidate || shapeIndices.length === 0) {
        console.log('candidate', candidate, shapeIndices)
        throw Error('Unable to find shape to fit this position')
      }

      // Add all cells in this shape to the sieve
      for (const index of shapeIndices) {
        cellSieve.add(index)
      }

      if (shapeIndices.length === 1) {
        numSingleCellGroups++
      }
      groups.push(shapeIndices)

    }

    return groups
  }

}
