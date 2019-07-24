import { KenKenGenerator } from './KenKenGenerator'
import { Renderer } from './Renderer'
import { MathOperators } from './kenken.types'
import * as fs from 'fs'
import * as path from 'path'
import { range } from './M'

const outputDir = path.join(__dirname, '../data')

for (const size of range(3, 15)) {
  for (const i of range(1, 2)) {
    console.time(`generate${size}`)
    const kenKen = KenKenGenerator.generate({ size, operations: [MathOperators.ADDITION, MathOperators.SUBTRACTION], seed: i, maxSingleCells: Math.floor(size / 2) })
    console.timeEnd(`generate${size}`)
    const canvas = Renderer.makeCanvas(500, 500)
    const fileName = path.join(outputDir, `${size}x${size}-kenken-${i}`)
    fs.writeFileSync(fileName + '.json', JSON.stringify(kenKen, null, 2))
    Renderer.renderCanvas(kenKen, canvas.getContext('2d'))
    // @ts-ignore
    let canvasBuffer: Buffer = canvas.toBuffer()
    fs.writeFileSync(fileName + '.png', canvasBuffer)
    Renderer.renderCanvas(kenKen, canvas.getContext('2d'), { withSolution: true })
    // @ts-ignore
    canvasBuffer = canvas.toBuffer()
    fs.writeFileSync(fileName + '-solution.png', canvasBuffer)
  }
}
