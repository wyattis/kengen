import { CanvasRenderOptions, KenKen, Point } from '../kenken.types'
import { KenKenGenerator } from '../KenKenGenerator'
import { BaseRenderer, OpStrings } from './BaseRenderer'

export class CanvasRenderer extends BaseRenderer {

  static defaultRenderOptions: CanvasRenderOptions = {
    cellSize: 100,
    cellPadding: 5,
    solutionFont: '30px Arial',
    mathFont: '20px Arial',
    backgroundColor: 'white',
    thinLineColor: 'grey',
    groupLineColor: 'black',
    clueFontColor: 'black',
    solutionFontColor: 'black',
    thickness: 1,
    groupThickness: 5,
    withSolution: false,
    lineJoin: 'round'
  }

  private ctx: CanvasRenderingContext2D

  constructor (public canvas: HTMLCanvasElement) {
    super()
    this.ctx = canvas.getContext('2d')
  }

  static makeCanvas (width: number, height: number): HTMLCanvasElement {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      return canvas
    } catch (err) {
      return require('canvas').createCanvas(width, height)
    }
  }

  public getCellCoords (o: {col: number, row: number}, renderOpts: CanvasRenderOptions): {x: number, y: number} {
    return {
      x: Math.ceil(o.col * renderOpts.cellSize + o.col * renderOpts.thickness + renderOpts.groupThickness / 2),
      y: Math.ceil(o.row * renderOpts.cellSize + o.row * renderOpts.thickness + renderOpts.groupThickness / 2)
    }
  }

  private drawPolygon (ctx: CanvasRenderingContext2D, poly: Point[]) {
    ctx.beginPath()
    ctx.moveTo(poly[0].x, poly[0].y)
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i].x, poly[i].y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  public getRenderOpts (opts: CanvasRenderOptions = {}) {
    return Object.assign({}, CanvasRenderer.defaultRenderOptions, opts)
  }

  /**
   * Renders a KenKen to the provided canvas context. This method WILL clear the canvas before rendering.
   * @param kenKen - The KenKen puzzle to render
   * @param ctx - The canvas to render to
   * @param renderOpts - The provided canvas render options
   * @param renderOpts.cellSize: 100
   * @param renderOpts.cellPadding: 5
   * @param renderOpts.solutionFont: '30px Arial'
   * @param renderOpts.mathFont: '20px Arial'
   * @param renderOpts.backgroundColor: 'white'
   * @param renderOpts.thinLineColor: 'grey'
   * @param renderOpts.groupLineColor: 'black'
   * @param renderOpts.clueFontColor: 'black'
   * @param renderOpts.solutionFontColor: 'black'
   * @param renderOpts.thickness: 1
   * @param renderOpts.groupThickness: 5
   * @param renderOpts.withSolution: false
   * @param renderOpts.lineJoin: 'round'
   */
  public render (kenKen: KenKen, renderOpts: CanvasRenderOptions = {}): void {
    renderOpts = this.getRenderOpts(renderOpts)
    const ctx = this.ctx
    const { x: width, y: height } = this.getCellCoords({ col: kenKen.size , row: kenKen.size }, renderOpts)
    ctx.canvas.width = Math.ceil(width + renderOpts.groupThickness / 2)
    ctx.canvas.height = Math.ceil(height + renderOpts.groupThickness / 2)
    ctx.fillStyle = renderOpts.backgroundColor
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'top'
    ctx.strokeStyle = renderOpts.thinLineColor
    ctx.lineWidth = renderOpts.thickness
    ctx.lineJoin = renderOpts.lineJoin

    // Draw the light borders on all of the cells
    for (let i = 0; i < kenKen.cells.length; i++) {
      const pos = KenKenGenerator.getCoords(i, kenKen.size)
      const { x, y } = this.getCellCoords(pos, renderOpts)
      const { x: x2, y: y2 } = this.getCellCoords({ col: pos.col + 1, row: pos.row + 1 }, renderOpts)
      ctx.strokeRect(x, y, x2 - x, y2 - y)
    }

    ctx.strokeStyle = renderOpts.groupLineColor
    ctx.lineWidth = renderOpts.groupThickness
    // Draw the outside border first
    ctx.strokeRect(0, 0, width, height)

    // Draw the each group
    ctx.font = renderOpts.mathFont
    ctx.fillStyle = renderOpts.clueFontColor
    for (const group of kenKen.math) {
      // Draw the operation text
      const operationCellIndex = Math.min(...group.cells)
      let { x, y } = this.getCellCoords(KenKenGenerator.getCoords(operationCellIndex, kenKen.size), renderOpts)
      const opString = group.cells.length > 1 ? OpStrings[group.operation] + group.result : '' + group.result
      ctx.fillText(opString, x + renderOpts.cellPadding, y + renderOpts.cellPadding)
      const edges: Point[] = this.getGroupEdges(group.cells, kenKen.size).map(p => this.getCellCoords({
        col: p.x,
        row: p.y
      }, renderOpts))
      this.drawPolygon(ctx, edges)
    }

    // Draw the solution
    ctx.font = renderOpts.solutionFont
    ctx.fillStyle = renderOpts.solutionFontColor
    if (renderOpts.withSolution) {
      for (let i = 0; i < kenKen.cells.length; i++) {
        const cell = kenKen.cells[i]
        const { x: cellWidth, y: cellHeight } = this.getCellCoords({ row: 1, col: 1 }, renderOpts)
        const { x, y } = this.getCellCoords(KenKenGenerator.getCoords(i, kenKen.size), renderOpts)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(cell.toString(), x + cellWidth / 2, y + cellHeight / 2)
      }
    }
  }

}
