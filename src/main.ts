import { KenKenGenerator } from './KenKenGenerator'
import { Renderer } from './Renderer'
import { CanvasRenderOptions, KenKen, KenKenOptions, MathOperators } from './kenken.types'
import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import { combinationsOf, random, range, shuffle, swap } from './M'

let errors = []
for (const size of [4]) {
  const root = path.join(__dirname, '../data', `/${size}x${size}`)
  mkdirp.sync(root)
  let count = 0
  let seed = 1
  while (count < 1 && seed < 3000) {
    const timeKey = `generate${size}x${size}-seed${seed}-count${count}`
    console.time(timeKey)
    const kenKen = KenKenGenerator.generate({ size, operations: [MathOperators.ADDITION, MathOperators.SUBTRACTION], seed, maxSingleCells: Math.floor(size / 2) })
    console.timeEnd(timeKey)
    const errorIndices = makeMathErrors(kenKen)
    if (Array.isArray(errorIndices)) {
      const canvas = Renderer.makeCanvas(500, 500)
      const fileName = path.join(root, `${size}x${size}-kenken-${count + 1}`)
      // Write kenken file
      fs.writeFileSync(fileName + '.json', JSON.stringify(kenKen, null, 2))
      // Render puzzle without solution
      renderCanvas(kenKen, canvas, fileName)
      // Render puzzle with solution included
      renderCanvas(kenKen, canvas, fileName + '-solution', { withSolution: true })
      for (const indices of errorIndices) {
        swap(kenKen.cells, indices[0], indices[1])
      }
      renderCanvas(kenKen, canvas, fileName + '-error', { withSolution: true })
      count++
    } else {
      console.log(`could not generate error for size: ${size} and seed: ${seed}`)
      errors.push({
        size,
        seed
      })
    }
    seed++
  }
}

fs.writeFileSync('errors.json', JSON.stringify(errors, null, 2), 'utf8')

function makeMathErrors (kenKen: KenKen): boolean | [number, number][] {
  // Generate errors by finding two columns or rows that have 2 values that can be transposed and swapping them
  // Swap values in 4 cells to introduce an error
  const { rows, cols } = KenKenGenerator.cellsToRowsCols(kenKen.cells, kenKen.size)
  const groupMap: Map<number, number> = new Map(kenKen.math.reduce((agg, g, i) => agg.concat(g.cells.map(v => [v, i])), []))
  // Randomly search for cells that can be swapped to introduce errors
  // clearSeed()
  let isSearchingRows = random() > 0.5
  const queue = isSearchingRows ? [rows, cols] : [cols, rows]
  let swapIndexes
  for (const group of queue) {
    swapIndexes = findSwappablePairs(group, groupMap, isSearchingRows)
    if (swapIndexes.length) break
    isSearchingRows = !isSearchingRows
  }

  if (!swapIndexes.length) {
    return false
  }

  // First dimension indicates the row, second dimension is column
  // console.log(isSearchingRows ? 'rows' : 'cols', swapIndexes)
  const swapForErrors: [number, number][] = []
  for (const pair of swapIndexes) {
    const colA = isSearchingRows ? pair[0][1] : pair[0][0]
    const colB = isSearchingRows ? pair[1][1] : pair[1][0]
    const rowA = isSearchingRows ? pair[0][0] : pair[0][1]
    const rowB = isSearchingRows ? pair[1][0] : pair[1][1]
    const aIndex = KenKenGenerator.getIndexFromCoords({ col: colA, row: rowA }, kenKen.size)
    const bIndex = KenKenGenerator.getIndexFromCoords({ col: colB, row: rowB }, kenKen.size)
    swapForErrors.push([aIndex, bIndex])
  }
  return swapForErrors
}

function renderCanvas (kenKen: KenKen, canvas: HTMLCanvasElement, fileName: string, opts?: CanvasRenderOptions) {
  Renderer.renderCanvas(kenKen, canvas.getContext('2d'), opts)
  // @ts-ignore
  let canvasBuffer: Buffer = canvas.toBuffer()
  fs.writeFileSync(fileName + '.png', canvasBuffer)
}

function findSwappablePairs (arrSet: number[][], groupMap: Map<number, number>, isRowWise: boolean): [number, number][][] {
  const pairs: [number, number][][] = []
  for (const i of range(0, arrSet.length - 1)) {
    for (const j of range(i + 1, arrSet.length)) {
      console.log(i, j)
      // At this point i and j will point to the two arrays we are currently comparing
      const arrI = arrSet[i]
      const arrJ = arrSet[j]
      for (const a of range(0, arrI.length - 1)) {
        for (const b of range(a + 1, arrJ.length)) {
          // All of this calculation is done just to find out the cell index based on the current column and row of the
          // cell. Then we're able to get the group from the hashmap created earlier. At least one pair of swapped cells
          // need to be in different groups so that we can guarantee the math gets messed up
          const IA = arrI[a]
          const IB = arrI[b]
          const JA = arrJ[a]
          const JB = arrJ[b]
          const cellIA = KenKenGenerator.getIndexFromCoords(isRowWise ? { row: i, col: a } : { row: a, col: i }, arrSet.length)
          const cellIB = KenKenGenerator.getIndexFromCoords(isRowWise ? { row: i, col: b } : { row: b, col: i }, arrSet.length)
          const cellJA = KenKenGenerator.getIndexFromCoords(isRowWise ? { row: j, col: a } : { row: a, col: j }, arrSet.length)
          const cellJB = KenKenGenerator.getIndexFromCoords(isRowWise ? { row: j, col: b } : { row: b, col: j }, arrSet.length)
          const groupIA = groupMap.get(cellIA)
          const groupIB = groupMap.get(cellIB)
          const groupJA = groupMap.get(cellJA)
          const groupJB = groupMap.get(cellJB)
          // We can't have pairs of cells be in the same group in both dimensions.
          const areSwappable = IA === JB && IB === JA &&
            (groupIA !== groupIB || groupJA !== groupJB) &&
            (groupIA !== groupJA || groupIB !== groupJB)
          // console.log('IA', IA, cellIA, groupIA, 'IB', IB, cellIB, groupIB, 'JA', JA, cellJA, groupJA, 'JB', JB, cellJB, groupJB, 'swap', areSwappable)
          if (areSwappable) {
            pairs.push([[i, a], [j, a]])
            pairs.push([[i, b], [j, b]])
            console.log('done')
            return pairs
          }
        }
      }
    }
  }
  return pairs
}
