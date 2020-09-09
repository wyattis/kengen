import { KenKenGenerator } from './src/KenKenGenerator'
import { CanvasRenderer, HTMLRenderer } from './src/main'
import * as path from 'path'
import * as fs from 'fs'

const cRenderer = new CanvasRenderer(CanvasRenderer.makeCanvas(100, 100))
const hRenderer = new HTMLRenderer()
for (const size of [4, 5, 6, 7, 8, 9, 10]) {
  console.time('generate' + size)
  const puz = KenKenGenerator.generate({ size })
  console.timeEnd('generate' + size)
  cRenderer.render(puz)
  let name = path.join(__dirname, `static/images/${size}x${size}-kenken-1`)
  // @ts-ignore
  let b = cRenderer.canvas.toBuffer()
  fs.writeFileSync(name + '.png', b)
  cRenderer.render(puz, { withSolution: true })
  // @ts-ignore
  b = cRenderer.canvas.toBuffer()
  fs.writeFileSync(name + '-solution.png', b)

  const hName = path.join(__dirname, `static/html/${size}x${size}-kenken-1`)
  let html = hRenderer.render(puz)
  html += '<link rel="stylesheet" href="../styles.css" />'
  fs.writeFileSync(hName + '.html', html, 'utf-8')
  html = hRenderer.render(puz, { withSolution: true })
  html += '<link rel="stylesheet" href="../styles.css" />'
  fs.writeFileSync(hName + '-solution.html', html, 'utf-8')
}
