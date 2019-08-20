import { CanvasRenderOptions, Direction, KenKen, Line, MathOperators, Point, SpaceQuad } from './kenken.types'
import { KenKenGenerator } from './KenKenGenerator'
import { GridGraph } from './GridGraph'
import { Queue } from './Queue'

const OpStrings = {
  [MathOperators.ADDITION]: '+',
  [MathOperators.SUBTRACTION]: '-',
  [MathOperators.DIVISION]: '\u00F7',
  [MathOperators.MULTIPLICATION]: 'x',
  [MathOperators.MODULUS]: 'mod',
  [MathOperators.LOWEST_COMMON_MULTIPLE]: 'LCM',
  [MathOperators.GREATEST_COMMON_DIVISOR]: 'GCD',
  [MathOperators.MINIMUM]: 'min',
  [MathOperators.MAXIMUM]: 'max'
}

export class Renderer {

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

  static getCellCoords (o: {col: number, row: number}, renderOpts: CanvasRenderOptions): {x: number, y: number} {
    return {
      x: Math.ceil(o.col * renderOpts.cellSize + o.col * renderOpts.thickness + renderOpts.groupThickness / 2),
      y: Math.ceil(o.row * renderOpts.cellSize + o.row * renderOpts.thickness + renderOpts.groupThickness / 2)
    }
  }

  static drawPolygon (ctx: CanvasRenderingContext2D, poly: Point[]) {
    ctx.beginPath()
    ctx.moveTo(poly[0].x, poly[0].y)
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i].x, poly[i].y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  static getRenderOpts (opts: CanvasRenderOptions = {}) {
    return Object.assign({}, Renderer.defaultRenderOptions, opts)
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
  static renderCanvas (kenKen: KenKen, ctx: CanvasRenderingContext2D, renderOpts: CanvasRenderOptions = {}): void {
    renderOpts = Renderer.getRenderOpts(renderOpts)
    const { x: width, y: height } = Renderer.getCellCoords({ col: kenKen.size , row: kenKen.size }, renderOpts)
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
      const { x, y } = Renderer.getCellCoords(pos, renderOpts)
      const { x: x2, y: y2 } = Renderer.getCellCoords({ col: pos.col + 1, row: pos.row + 1 }, renderOpts)
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
      let { x, y } = Renderer.getCellCoords(KenKenGenerator.getCoords(operationCellIndex, kenKen.size), renderOpts)
      const opString = group.cells.length > 1 ? OpStrings[group.operation] + group.result : '' + group.result
      ctx.fillText(opString, x + renderOpts.cellPadding, y + renderOpts.cellPadding)
      const edges: Point[] = Renderer.getGroupEdges(group.cells, kenKen.size).map(p => Renderer.getCellCoords({
        col: p.x,
        row: p.y
      }, renderOpts))
      Renderer.drawPolygon(ctx, edges)
    }

    // Draw the solution
    ctx.font = renderOpts.solutionFont
    ctx.fillStyle = renderOpts.solutionFontColor
    if (renderOpts.withSolution) {
      for (let i = 0; i < kenKen.cells.length; i++) {
        const cell = kenKen.cells[i]
        const { x: cellWidth, y: cellHeight } = Renderer.getCellCoords({ row: 1, col: 1 }, renderOpts)
        const { x, y } = Renderer.getCellCoords(KenKenGenerator.getCoords(i, kenKen.size), renderOpts)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(cell.toString(), x + cellWidth / 2, y + cellHeight / 2)
      }
    }
  }

  static getDirectionOrder (direction: Direction): Queue<Direction> {
    switch (direction) {
      case Direction.RIGHT:
        return new Queue([Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT])
      case Direction.DOWN:
        return new Queue([Direction.RIGHT, Direction.DOWN, Direction.LEFT, Direction.UP])
      case Direction.LEFT:
        return new Queue([Direction.DOWN, Direction.LEFT, Direction.UP, Direction.RIGHT])
      default:
        return new Queue([Direction.LEFT, Direction.UP, Direction.RIGHT, Direction.DOWN])
    }
  }

  static getGroupEdges (groupCells: number[], size: number): Point[] {
    const grid: GridGraph<number> = new GridGraph({ width: size, height: size })

    for (const cell of groupCells) {
      const { row, col } = KenKenGenerator.getCoords(cell, size)
      grid.add(col, row, cell)
    }

    // Check if the last edge reaches the
    function isCompletePolygon (edges: Line[]): boolean {
      return edges.length !== 0 &&
        edges[0].from.x === edges[edges.length - 1].to.x &&
        edges[0].from.y === edges[edges.length - 1].to.y
    }

    function linesToPolygon (edges: Line[]): Point[] {
      if (edges.length === 0) {
        return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      } else {
        return [edges[0].from, edges[0].to].concat(edges.slice(1).map(e => e.to))
      }
    }

   // TODO: Check that we have not completed the polygon
    let { row, col } = KenKenGenerator.getCoords(groupCells[0], size)
    let edges: Line[] = []
    let direction: Direction = Direction.RIGHT
    let cell: SpaceQuad<number> = grid.get(col, row)
    let c = 0
    while (!isCompletePolygon(edges) && c < 10) {
      let directionQueue = Renderer.getDirectionOrder(direction)
      let cellEdges: Line[] = []
      let directionCandidate = directionQueue.next()
      let nextCell = GridGraph.getCellInDirection(directionCandidate, cell)
      while (!nextCell && directionCandidate !== null) {
        if (!nextCell) {
          let nextEdge: Line
          switch (directionCandidate) {
            case Direction.UP:
              nextEdge = { from: { x: cell.x, y: cell.y }, to: { x: cell.x + 1, y: cell.y } }
              break
            case Direction.RIGHT:
              nextEdge = { from: { x: cell.x + 1, y: cell.y }, to: { x: cell.x + 1, y: cell.y + 1 } }
              break
            case Direction.DOWN:
              nextEdge = { from: { x: cell.x + 1, y: cell.y + 1 }, to: { x: cell.x, y: cell.y + 1 } }
              break
            case Direction.LEFT:
              nextEdge = { from: { x: cell.x, y: cell.y + 1 }, to: { x: cell.x , y: cell.y } }
              break
          }
          cellEdges.push(nextEdge)
          // Break if we've reached the end
          if ((edges.length && Renderer.pointsAreSame(nextEdge.to, edges[0].from)) || (cellEdges.length > 1 && Renderer.pointsAreSame(cellEdges[0].from, nextEdge.to))) {
            return linesToPolygon(edges.concat(cellEdges))
          }
        }
        directionCandidate = directionQueue.next()
        nextCell = GridGraph.getCellInDirection(directionCandidate, cell)
      }

      // Bail if there aren't any additional candidates
      if (!nextCell && directionCandidate === null) {
        return linesToPolygon(edges)
      }
      c++
      cell = nextCell
      direction = directionCandidate
      edges = edges.concat(cellEdges)
    }
    return linesToPolygon(edges)
  }

  static pointsAreSame (pointA: Point, pointB: Point): boolean {
    return pointA.x === pointB.x && pointA.y === pointB.y
  }

}
