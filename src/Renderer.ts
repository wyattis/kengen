import { CanvasRenderOptions, Direction, KenKen, Line, MathOperators, Point, SpaceQuad } from './kenken.types'
import { KenKenGenerator } from './KenKenGenerator'
import { GridGraph } from './GridGraph'
import { Queue } from './Queue'

const OpStrings = {
  [MathOperators.ADDITION]: '+',
  [MathOperators.SUBTRACTION]: '-',
  [MathOperators.DIVISION]: '\u00F7',
  [MathOperators.MULTIPLICATION]: 'x'
}

export class Renderer {

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
      x: o.col * renderOpts.cellSize + (o.col + 1) * renderOpts.thickness,
      y: o.row * renderOpts.cellSize + (o.row + 1) * renderOpts.thickness
    }
  }

  static drawPolygon (ctx: CanvasRenderingContext2D, poly: Point[]) {
    ctx.moveTo(poly[0].x, poly[0].y)
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i].x, poly[i].y)
    }
    ctx.stroke()
  }

  static renderCanvas (kenKen: KenKen, ctx: CanvasRenderingContext2D, renderOpts: CanvasRenderOptions = { cellSize: 50, thickness: 2, withSolution: false }): void {
    ctx.fillStyle = 'black'
    ctx.textAlign = 'start'
    ctx.textBaseline = 'top'
    for (const group of kenKen.math) {
      // Draw the operation text
      const operationCellIndex = Math.min(...group.cells)
      let { x, y } = Renderer.getCellCoords(KenKenGenerator.getCoords(operationCellIndex, kenKen.size), renderOpts)
      const opString = group.cells.length > 1 ? OpStrings[group.operation] + group.result : '' + group.result
      console.log('opstring', opString)
      ctx.fillText(opString, x, y)
      const cellOffset = KenKenGenerator.getCoords(group.cells[0], kenKen.size)
      const edges: Point[] = Renderer.getGroupEdges(group.cells, kenKen.size).map(p => Renderer.getCellCoords({
        col: p.x + cellOffset.col,
        row: p.y + cellOffset.row
      }, renderOpts))
      Renderer.drawPolygon(ctx, edges)
    }
    if (renderOpts.withSolution) {
      for (let i = 0; i < kenKen.cells.length; i++) {
        const cell = kenKen.cells[i]
        console.log('cell', cell)
        const { x, y } = Renderer.getCellCoords(KenKenGenerator.getCoords(i, kenKen.size), renderOpts)
        ctx.fillText(kenKen.cells[i].toString(), x, y)
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
    console.log('group', groupCells)
    const grid: GridGraph<number> = new GridGraph()

    for (const cell of groupCells) {
      const { row, col } = KenKenGenerator.getCoords(cell, size)
      grid.add(row, col, cell)
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
    let cell: SpaceQuad<number> = grid.get(row, col)
    console.log('cell 1', KenKenGenerator.getCoords(cell.data, size))
    let c = 0
    while (!isCompletePolygon(edges) && c < 10) {
      let directionQueue = Renderer.getDirectionOrder(direction)
      let cellEdges: Line[] = []
      let directionCandidate = directionQueue.next()
      let nextCell = GridGraph.getCellInDirection(directionCandidate, cell)
      while (!nextCell && directionCandidate !== null) {
        console.log('nextCell', nextCell)
        if (!nextCell) {
          switch (directionCandidate) {
            case Direction.UP:
              cellEdges.push({ from: { x: cell.x, y: cell.y }, to: { x: cell.x + 1, y: cell.y } })
              break
            case Direction.RIGHT:
              cellEdges.push({ from: { x: cell.x + 1, y: cell.y }, to: { x: cell.x + 1, y: cell.y + 1 } })
              break
            case Direction.DOWN:
              cellEdges.push({ from: { x: cell.x + 1, y: cell.y + 1 }, to: { x: cell.x, y: cell.y + 1 } })
              break
            case Direction.LEFT:
              cellEdges.push({ from: { x: cell.x, y: cell.y + 1 }, to: { x: cell.x , y: cell.y } })
              break
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
      edges = edges.concat(cellEdges)
      console.log('next cell', c, cellEdges)
    }
    return linesToPolygon(edges)
  }

}
