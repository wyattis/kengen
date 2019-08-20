import { KenKenGenerator } from './src/KenKenGenerator'
import { Renderer } from './src/Renderer'
import * as path from 'path'
import * as fs from 'fs'

const canvas = Renderer.makeCanvas(100, 100)
const ctx = canvas.getContext('2d')
for (const size of [4, 5, 6, 7, 8, 9, 10]) {
  console.time('generate' + size)
  const puz = KenKenGenerator.generate({ size })
  console.timeEnd('generate' + size)
  Renderer.renderCanvas(puz, ctx)
  const name = path.join(__dirname, `static/images/${size}x${size}-kenken-1`)
  // @ts-ignore
  let b = canvas.toBuffer()
  fs.writeFileSync(name + '.png', b)
  Renderer.renderCanvas(puz, ctx, { withSolution: true })
  // @ts-ignore
  b = canvas.toBuffer()
  fs.writeFileSync(name + '-solution.png', b)
}
