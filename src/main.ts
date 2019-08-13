import { KenKenGenerator } from './KenKenGenerator'
import { Renderer } from './Renderer'
import { CanvasRenderOptions, KenKen, KenKenOptions, MathOperators } from './kenken.types'
import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import { clearSeed, random, range, shuffle, swap } from './M'

for (const size of [4, 5, 6]) {
  const root = path.join(__dirname, '../data', `/${size}x${size}`)
  mkdirp.sync(root)
  for (const i of range(1, 151)) {
    const timeKey = `generate${size}-${i}`
    console.time(timeKey)
    const kenKen = KenKenGenerator.generate({ size, operations: [MathOperators.ADDITION, MathOperators.SUBTRACTION], seed: i, maxSingleCells: Math.floor(size / 2) })
    console.timeEnd(timeKey)
    const canvas = Renderer.makeCanvas(500, 500)
    const fileName = path.join(root, `${size}x${size}-kenken-${i}`)
    // Write kenken file
    fs.writeFileSync(fileName + '.json', JSON.stringify(kenKen, null, 2))
    // Render puzzle without solution
    renderCanvas(kenKen, canvas, fileName)
    // Render puzzle with solution included
    renderCanvas(kenKen, canvas, fileName + '-solution', { withSolution: true })

    // Generate errors by finding two columns or rows that have 2 values that can be transposed and swapping them
    // Swap values in 4 cells to introduce an error
    const { rows, cols } = KenKenGenerator.cellsToRowsCols(kenKen.cells, kenKen.size)

    // Randomly search for cells that can be swapped to introduce errors
    // clearSeed()
    let isSearchingRows = random() > 0.5
    const queue = isSearchingRows ? [rows, cols] : [cols, rows]
    let swapIndexes
    for (const group of queue) {
      swapIndexes = findSwappablePairs(group)
      if (swapIndexes.length) break
      isSearchingRows = !isSearchingRows
    }

    if (!swapIndexes.length) {
      console.log(`Unable to create error for ${kenKen.size}x${kenKen.size} with seed`,  kenKen.seed)
      continue
    }

    // First dimension indicates the row, second dimension is column
    // console.log(isSearchingRows ? 'rows' : 'cols', swapIndexes)
    for (const pair of swapIndexes) {
      const colA = isSearchingRows ? pair[0][1] : pair[0][0]
      const colB = isSearchingRows ? pair[1][1] : pair[1][0]
      const rowA = isSearchingRows ? pair[0][0] : pair[0][1]
      const rowB = isSearchingRows ? pair[1][0] : pair[1][1]
      const aIndex = KenKenGenerator.getIndexFromCoords({ col: colA, row: rowA }, kenKen.size)
      const bIndex = KenKenGenerator.getIndexFromCoords({ col: colB, row: rowB }, kenKen.size)
      swap(kenKen.cells, aIndex, bIndex)
    }

    renderCanvas(kenKen, canvas, fileName + '-error', { withSolution: true })
  }
}


function renderCanvas (kenKen: KenKen, canvas: HTMLCanvasElement, fileName: string, opts?: CanvasRenderOptions) {
  Renderer.renderCanvas(kenKen, canvas.getContext('2d'), opts)
  // @ts-ignore
  let canvasBuffer: Buffer = canvas.toBuffer()
  fs.writeFileSync(fileName + '.png', canvasBuffer)
}

function findSwappablePairs (arrSet: number[][]): [number, number][][] {
  const pairs: [number, number][][] = []
  for (const i of range(0, arrSet.length - 1)) {
    for (const j of range(i + 1, arrSet.length)) {
      // At this point i and j will point to the two arrays we are currently comparing
      // TODO: Search the arrays for matching values
      const arrA = arrSet[i]
      const arrB = arrSet[j]
      for (const a of range(0, arrA.length - 1)) {
        for (const b of range(a + 1, arrB.length)) {
          if (arrA[a] === arrB[b] && arrA[b] === arrB[a]) {
            pairs.push([[i, a], [j, a]])
            pairs.push([[i, b], [j, b]])
            return pairs
          }
        }
      }
    }
  }
  return pairs
}
