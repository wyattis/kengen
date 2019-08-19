import { KenKenGenerator } from './KenKenGenerator'
import { Renderer } from './Renderer'
import { CanvasRenderOptions, KenKen, MathOperators } from './kenken.types'
import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import { combinationsOf, random, range, roundFloat, shuffle, swap } from './M'
import { createCanvas } from 'canvas'

for (const size of [4, 5, 6]) {
  const root = path.join(__dirname, '../data', `/${size}x${size}`)
  const errorRoot = path.join(root, '/failed-math')
  mkdirp.sync(root)
  mkdirp.sync(errorRoot)
  let count = 0
  let seed = 1
  const rowErrorDistribution = Array(size * size).fill(0)
  const mathErrorDistribution = Array(size * size).fill(0)
  const cellValueSums = Array(size * size).fill(0)
  const cellValueSumsExcluded = Array(size * size).fill(0)
  while (count < 500 && seed < 3000) {
    const timeKey = `generate${size}x${size}-seed${seed}-count${count} time`

    console.time(timeKey)
    const kenKen = KenKenGenerator.generate({ size, operations: [MathOperators.ADDITION, MathOperators.SUBTRACTION], seed, maxSingleCells: Math.floor(size / 2) })
    console.timeEnd(timeKey)

    const mathErrors = makeMathErrors(kenKen)
    const rowErrors = makeRowColError(kenKen)
    const hasAllErrors = Array.isArray(mathErrors) && Array.isArray(rowErrors)

    const fileName = hasAllErrors ? path.join(root, `${size}x${size}-kenken-${count + 1}`) : path.join(errorRoot, `${size}x${size}-kenken-seed${seed}`)
    const canvas = Renderer.makeCanvas(500, 500)

    // Write kenken file
    fs.writeFileSync(fileName + '.json', JSON.stringify(kenKen, null, 2))
    // Render puzzle without solution
    renderCanvas(kenKen, canvas, fileName)
    // Render puzzle with solution included
    renderCanvas(kenKen, canvas, fileName + '-solution', { withSolution: true })
    for (let i = 0; i < kenKen.cells.length; i++) {
      cellValueSumsExcluded[i] += kenKen.cells[i]
    }
    if (hasAllErrors && Array.isArray(mathErrors)) {
      for (let i = 0; i < kenKen.cells.length; i++) {
        cellValueSums[i] += kenKen.cells[i]
      }
      for (const indices of mathErrors) {
        for (const index of indices) {
          mathErrorDistribution[index]++
        }
      }
      for (const indices of rowErrors) {
        for (const index of indices) {
          rowErrorDistribution[index]++
        }
      }
    }

    if (Array.isArray(mathErrors)) {
      renderErrors(kenKen, mathErrors, canvas, fileName + '-math-error', fileName + '-math-error-visible')
      fs.writeFileSync(fileName + 'math-errors.json', JSON.stringify(mathErrors))
    }

    if (Array.isArray(rowErrors)) {
      renderErrors(kenKen, rowErrors, canvas, fileName + '-row-error', fileName + '-row-error-visible')
      fs.writeFileSync(fileName + 'row-errors.json', JSON.stringify(rowErrors))
    }

    // Render our file with errors
    if (hasAllErrors) {
      count++
    }
    seed++
  }
  const metaPath = path.join(root, 'meta')
  mkdirp.sync(metaPath)
  fs.writeFileSync(path.join(metaPath, 'math-error-distribution.json'), JSON.stringify(mathErrorDistribution.map(v => roundFloat(v / count, 3))))
  fs.writeFileSync(path.join(metaPath, 'row-error-distribution.json'), JSON.stringify(rowErrorDistribution.map(v => roundFloat(v / count, 3))))
  fs.writeFileSync(path.join(metaPath, 'cell-distribution.json'), JSON.stringify(cellValueSums.map(v => roundFloat(v / count, 3))))
  fs.writeFileSync(path.join(metaPath, 'cell-distribution-excluded.json'), JSON.stringify(cellValueSumsExcluded.map(v => roundFloat(v / seed, 3))))
}

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

function makeRowColError (kenKen: KenKen): [number, number][] {
  const groupMap: Map<number, number> = new Map(kenKen.math.reduce((agg, g, i) => agg.concat(g.cells.map(v => [v, i])), []))
  const cellPairs: number[][] = shuffle(Array.from(combinationsOf(Array.from(range(0, kenKen.cells.length)), 2)))
  for (const pair of cellPairs) {
    if (groupMap.get(pair[0]) === groupMap.get(pair[1])) {
      const vA = kenKen.cells[pair[0]]
      const vB = kenKen.cells[pair[1]]
      if (vA !== vB) {
        return [[pair[0], pair[1]]]
      }
    }
  }
}

function renderCanvas (kenKen: KenKen, canvas: HTMLCanvasElement, fileName: string, opts?: CanvasRenderOptions) {
  Renderer.renderCanvas(kenKen, canvas.getContext('2d'), opts)
  // @ts-ignore
  let canvasBuffer: Buffer = canvas.toBuffer()
  fs.writeFileSync(fileName + '.png', canvasBuffer)
}

function renderErrors (kenKen: KenKen, errors: number[][], canvas: HTMLCanvasElement, hiddenFileName: string, visibleFileName: string) {
  kenKen = JSON.parse(JSON.stringify(kenKen))
  for (const indices of errors) {
    swap(kenKen.cells, indices[0], indices[1])
  }
  renderCanvas(kenKen, canvas, hiddenFileName + '.png', { withSolution: true })

  const errorRenderOpts = Renderer.getRenderOpts({ withSolution: true, backgroundColor: 'rgba(0, 0, 0, 0)' })
  Renderer.renderCanvas(kenKen, canvas.getContext('2d'), errorRenderOpts)
  const backgroundCanvas = createCanvas(canvas.width, canvas.height)
  const backgroundCtx = backgroundCanvas.getContext('2d')
  backgroundCtx.fillStyle = 'white'
  backgroundCtx.fillRect(0, 0, canvas.width, canvas.height)
  backgroundCtx.fillStyle = 'salmon'
  for (const indices of errors) {
    for (const index of indices) {
      const { col, row } = KenKenGenerator.getCoords(index, kenKen.size)
      const { x, y } = Renderer.getCellCoords({ col, row }, errorRenderOpts)
      const { x: x2, y: y2 } = Renderer.getCellCoords({ col: col + 1, row: row + 1 }, errorRenderOpts)
      const w = x2 - x
      const h = y2 - y
      backgroundCtx.fillRect(x, y, w, h)
    }
  }
  backgroundCtx.drawImage(canvas, 0, 0)
  // @ts-ignore
  const canvasBuffer: Buffer = backgroundCanvas.toBuffer()
  fs.writeFileSync(visibleFileName + '.png', canvasBuffer)

}

function findSwappablePairs (arrSet: number[][], groupMap: Map<number, number>, isRowWise: boolean): [number, number][][] {
  const pairs: [number, number][][] = []
  const rowIndices = shuffle(Array.from(combinationsOf(Array.from(range(0, arrSet.length)), 2)))
  for (const [i, j] of rowIndices) {
    const arrI = arrSet[i]
    const arrJ = arrSet[j]
    // console.log('shuffled', i, j, shuffled)
    for (const [a, b] of shuffle(rowIndices)) {
      const IA = arrI[a]
      const IB = arrI[b]
      const JA = arrJ[a]
      const JB = arrJ[b]
      // Stop checking pairs if they're not a match
      const areInvertedPairs = IA === JB && IB === JA
      if (!areInvertedPairs) continue
      const coordIA = isRowWise ? { row: i, col: a } : { row: a, col: i }
      const coordIB = isRowWise ? { row: i, col: b } : { row: b, col: i }
      const coordJA = isRowWise ? { row: j, col: a } : { row: a, col: j }
      const coordJB = isRowWise ? { row: j, col: b } : { row: b, col: j }
      const cellIA = KenKenGenerator.getIndexFromCoords(coordIA, arrSet.length)
      const cellIB = KenKenGenerator.getIndexFromCoords(coordIB, arrSet.length)
      const cellJA = KenKenGenerator.getIndexFromCoords(coordJA, arrSet.length)
      const cellJB = KenKenGenerator.getIndexFromCoords(coordJB, arrSet.length)
      const groupIA = groupMap.get(cellIA)
      const groupIB = groupMap.get(cellIB)
      const groupJA = groupMap.get(cellJA)
      const groupJB = groupMap.get(cellJB)
      // We can't have pairs of cells be in the same group in both dimensions.
      const numSameGroups = +(groupIA === groupIB) + +(groupIB === groupJB) + +(groupJB === groupJA) + +(groupJA === groupIA)
      // console.log([[IA, coordIA], [IB, coordIB], [JA, coordJA], [JB, coordJB]].map((c: [number, {col: number, row: number}]) => `${c[0]} (${c[1].row},${c[1].col})`).join(' - '))
      if (numSameGroups === 1) {
        pairs.push([[i, a], [j, a]])
        pairs.push([[i, b], [j, b]])
        return pairs
      }
    }
  }
  return pairs
}
