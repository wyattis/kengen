import { KenKenGenerator } from './KenKenGenerator'
import { Renderer } from './Renderer'
import { MathOperators } from './kenken.types'
import * as fs from 'fs'
import * as path from 'path'

const kenKen = KenKenGenerator.generate({ size: 4, operations: [MathOperators.ADDITION], seed: 20 })
console.log('kenken', kenKen)
const canvas = Renderer.makeCanvas(500, 500)

fs.writeFileSync(path.join(__dirname, '../kenken.json'), JSON.stringify(kenKen, null, 2))

Renderer.renderCanvas(kenKen, canvas.getContext('2d'))
// @ts-ignore
const stream = canvas.createPNGStream()
const imagePath = path.join(__dirname, '../test.png')
try {
  fs.unlinkSync(imagePath)
} catch (err) {}
const out = fs.createWriteStream(imagePath)
stream.pipe(out)
out.on('finish', () => console.log('done writing'))
console.log(canvas.toDataURL())
