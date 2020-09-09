import { KenKen, KenKenGenerator, } from "../main";
import { BaseRenderer, OpStrings } from "./BaseRenderer";
import { Direction } from "../kenken.types";

type Cell = {
  value: number
  operation: null | string
  row: number
  col: number
  class: Set<string>
}

export class HTMLRenderer extends BaseRenderer {

  render (kk: KenKen, opts?: { withSolution: boolean }): string {
    const grid: Cell[][] = []
    for (let r = 0; r < kk.size; r++) {
      const row = []
      for (let c = 0; c < kk.size; c++) {
        row.push({
          value: kk.cells[r * kk.size + c],
          operation: null,
          row: r,
          col: c,
          class: new Set(['cell']) 
        })
      }
      grid.push(row)
    }
    // TODO: Add thick borders
    for (const group of kk.math) {
      const operationCellIndex = Math.min(...group.cells)
      let { row, col } = KenKenGenerator.getCoords(operationCellIndex, kk.size)
      const opString = OpStrings[group.operation]
      grid[row][col].operation = group.cells.length > 1 ? (opString + group.result) : '' + group.result
      const points = this.getGroupEdges(group.cells, kk.size)
      for (let i = 1; i < points.length; i++) {
        const pA = points[i - 1]
        const pB = points[i]
        const dir = this.dirBetweenPoints(pA, pB)
        if (dir === Direction.RIGHT) {
          grid[pA.y][pA.x].class.add('bt')
        } else if (dir === Direction.LEFT) {
          grid[pA.y - 1][pB.x].class.add('bb')
        } else if (dir === Direction.DOWN) {
          grid[pA.y][pA.x - 1].class.add('br')
        } else {
          grid[pB.y][pB.x].class.add('bl')
        }
      }
    }

    // Generate the html string
    let html = '<div class="puzzle">'
    for (const row of grid) {
      html += '<div class="row">\n'
      for (const cell of row) {
        const cls = Array.from(cell.class)
        html += `<div class="${cls.join(' ')}">\n`
        if (cell.operation) {
          html += `<div class="operator"> ${cell.operation}</div>`
        }
        if (opts && opts.withSolution) {
          html += `<div class="clue">${cell.value}</div>`
        }
        html += '</div>\n'
      }
      html += '</div>\n'
    }
    html += '</div>'
    return html
  }

}