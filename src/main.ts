import { KenKenGenerator } from './KenKenGenerator'
import { Renderer } from './Renderer'
import { MathOperators } from './kenken.types'
import * as fs from 'fs'
import * as path from 'path'

const kenKen = KenKenGenerator.generate({size: 4, operations: [MathOperators.ADDITION]})
const canvas = Renderer.makeCanvas(500, 500)
Renderer.renderCanvas(kenKen, canvas.getContext('2d'))
// @ts-ignore
const stream = canvas.createPNGStream()
const out = fs.createWriteStream(path.join(__dirname, '../test.png'))
stream.pipe(out)
out.on('finish', () => console.log('done writing'))
console.log(canvas.toDataURL())
