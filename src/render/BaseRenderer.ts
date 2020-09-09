import { KenKen, Point, Line, Direction, SpaceQuad, MathOperators } from "../kenken.types";
import { GridGraph } from "../GridGraph";
import { KenKenGenerator } from "../KenKenGenerator";
import { Queue } from "../Queue";

export const OpStrings = {
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

export abstract class BaseRenderer {
  
  abstract render (kenken: KenKen): any

  protected getDirectionOrder (direction: Direction): Queue<Direction> {
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

  protected getGroupEdges (groupCells: number[], size: number): Point[] {
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
      let directionQueue = this.getDirectionOrder(direction)
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
          if ((edges.length && this.pointsAreSame(nextEdge.to, edges[0].from)) || 
            (cellEdges.length > 1 && this.pointsAreSame(cellEdges[0].from, nextEdge.to))) {
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

  protected pointsAreSame (pointA: Point, pointB: Point): boolean {
    return pointA.x === pointB.x && pointA.y === pointB.y
  }

  protected dirBetweenPoints (pointA: Point, pointB: Point): Direction {
    if (pointA.x > pointB.x) {
      return Direction.LEFT
    } else if (pointA.x < pointB.x) {
      return Direction.RIGHT
    } else if (pointA.y > pointB.y) {
      return Direction.UP
    } else {
      return Direction.DOWN
    }
  }

}