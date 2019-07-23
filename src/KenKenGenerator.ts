import { intersection, random, randomFrom, randomInt, range, setSeed, shuffle } from './M'
import { Direction, KenKen, KenKenOptions, MathGroup, MathOperators, Point, SpaceQuad } from './kenken.types'
import { GridGraph } from './GridGraph'

// Shapes represented as a 2d binary grid

export class KenKenGenerator {

  static defaultSize = 4
  static defaultOptions = {
    size: KenKenGenerator.defaultSize,
    operations: [MathOperators.ADDITION, MathOperators.SUBTRACTION],
    maxSingleCells: 2,
    groupingRatio: 0.5,
    groupSizeConstraints: {}
  }

  static generate (opts: KenKenOptions = {}): KenKen {
    opts = Object.assign({}, KenKenGenerator.defaultOptions, opts)

    opts.groupSizeConstraints = Object.assign({}, {
      1: { min: 0, max: opts.size - 2 },
      2: { min: 1, max: opts.size * opts.size },
      3: { min: 1, max: opts.size - 2 },
      4: { min: 0, max: opts.size - 3 },
      5: { min: 0, max: 2 }
    })

    // Set the RNG seed
    const seed = opts.seed || randomInt(1, Math.pow(2, 32))
    setSeed(seed)

    // Fill the cells randomly while satisfying row and column constraints
    const cells = KenKenGenerator.randomizeCells(opts)

    // Make the math group spacial arrangement
    const math = KenKenGenerator.makeMath(cells, opts)

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
      rowQueue[row].splice(rowIndex, 1)
      colQueue[col].splice(colIndex, 1)
      cells.push(candidate)
    }
    return cells
  }

  static makeMath (cells: number[], opts: KenKenOptions): MathGroup[] {
    const groups: MathGroup[] = []
    const spacialGroups: number[][] = KenKenGenerator.makeSpacialGroups(cells, opts)

    // Calculate the math operations
    for (const sGroup of spacialGroups) {
      const vals = sGroup.map(i => cells[i])
      vals.sort()
      let validOperations: MathOperators[]
      if (vals.length < 3) {
        validOperations = intersection(opts.operations, Object.values(MathOperators))
      } else {
        validOperations = intersection(opts.operations, [MathOperators.ADDITION, MathOperators.MULTIPLICATION])
      }
      const group: MathGroup = {
        operation: randomFrom(validOperations),
        cells: sGroup,
        result: 0
      }
      switch (group.operation) {
        case MathOperators.ADDITION:
          group.result = vals.reduce((s, c) => s + c, 0)
          break
        case MathOperators.SUBTRACTION:
          group.result = vals.reduce((s, c) => Math.max(s, c) - Math.min(s, c), 0)
          break
        case MathOperators.MULTIPLICATION:
          group.result = vals.reduce((s, c) => s * c, 1)
          break
        case MathOperators.DIVISION:
          group.result = vals.reduce((s, c) => Math.max(s, c) / Math.min(s, c), 1)
          break
      }
      groups.push(group)
    }
    return groups
  }

  static getCoords (index: number, size: number): { row: number, col: number } {
    return {
      col: index % size,
      row: Math.floor(index / size)
    }
  }

  static groupSize (groupIds: number[], groupMap: Map<number, number>): number {
    let size = 0
    for (const id of groupIds) {
      for (const [key, value] of groupMap) {
        if (value === id) {
          size++
        }
      }
    }
    return size
  }

  static mergeGroups (nodeA: { data: number }, nodeB: { data: number }, groupMap: Map<number, number>) {
    const idA = groupMap.get(nodeA.data)
    const idB = groupMap.get(nodeB.data)
    for (const [key, value] of groupMap) {
      if (value === idB) {
        groupMap.set(key, idA)
      }
    }
  }

  static getGroup (map: Map<number, number>, key: number): number[] {
    const group = []
    const groupId = map.get(key)
    for (const [key, value] of map) {
      if (value === groupId) {
        group.push(key)
      }
    }
    return group
  }

  static isSameVal<T> (map: Map<T, any>, idA: T, idB: T): boolean {
    return map.get(idA) === map.get(idB)
  }

  static getSizeDistribution (map: Map<number, number>): {[key: number]: number} {
    const uniqueGroups = KenKenGenerator.getUniqueGroups(map)
    const sizeCount: {[key: number]: number} = {}
    for (const [key, group] of uniqueGroups) {
      if (!sizeCount[group.length]) sizeCount[group.length] = 0
      sizeCount[group.length]++
    }
    return sizeCount
  }

  static getUniqueGroups (map: Map<number, number>): Map<number, number[]> {
    const uniqueGroups: Map<number, number[]> = new Map()
    for (const [key, value] of map) {
      let group = uniqueGroups.get(value)
      if (!group) {
        group = []
        uniqueGroups.set(value, group)
      }
      group.push(key)
    }
    return uniqueGroups
  }

  static makeSpacialGroups (cells: number[], opts: KenKenOptions): number[][] {
    const maxGroupSize = opts.size > 5 ? 5 : 4
    const groupMap: Map<number, number> = new Map(range(0, cells.length).map((o, i) => [i, i]))

    // Make our spacial grid to simplify checking of boundaries and neighbors
    const grid: GridGraph<number> = new GridGraph({ width: opts.size, height: opts.size })
    const points: Point[] = []
    for (let i = 0; i < cells.length; i++) {
      const { col, row } = KenKenGenerator.getCoords(i, opts.size)
      grid.add(col, row, i)
      points.push({ x: col, y: row })
    }

    // Randomly create groups based on probability of joining cells
    shuffle(points)
    for (const p of points) {
      const cell = grid.get(p.x, p.y)
      const directions = shuffle([Direction.RIGHT, Direction.LEFT, Direction.UP, Direction.DOWN])

      for (const dir of directions) {
        const rVal = random()
        if (rVal > opts.groupingRatio) continue
        const neighbor = GridGraph.getCellInDirection(dir, cell)

        if (!neighbor) continue
        const groupSizeA = KenKenGenerator.groupSize([groupMap.get(cell.data)], groupMap)
        const groupSizeB = KenKenGenerator.groupSize([groupMap.get(neighbor.data)], groupMap)
        const joinedGroupSize = groupSizeA + groupSizeB

        if (joinedGroupSize > maxGroupSize) continue
        const groupCounts = KenKenGenerator.getSizeDistribution(groupMap)
        const groupAConstraints = opts.groupSizeConstraints[groupSizeA]
        const groupBConstraints = opts.groupSizeConstraints[groupSizeB]
        const joinedConstraints = opts.groupSizeConstraints[joinedGroupSize]
        const groupACount = groupCounts[groupSizeA]
        const groupBCount = groupCounts[groupSizeB]
        const joinedCount = groupCounts[joinedGroupSize]
        // Check if increasing the group size of groupA or B will lead to ruining our group size quotas
        if (groupACount > groupAConstraints.min &&
          groupBCount > groupBConstraints.min &&
          (!joinedCount || !joinedConstraints || joinedCount < joinedConstraints.max)) {
          KenKenGenerator.mergeGroups(cell, neighbor, groupMap)
        }
      }
    }

    // Convert the groupMap to an array of spacial groups
    const groupMergeMap = KenKenGenerator.getUniqueGroups(groupMap)
    return Array.from(groupMergeMap.values())
  }

}
