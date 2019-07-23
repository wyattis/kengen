import { Direction, SpaceQuad } from './kenken.types'
import { Rectangle } from './Rectangle'

export class GridGraph<T> {

  private nodes: SpaceQuad<T>[] = []
  private bounds: Rectangle

  constructor (b: {width: number, height: number}) {
    this.bounds = new Rectangle(0, 0, b.width, b.height)
  }

  has (x: number, y: number): boolean {
    return this.get(x, y) !== null
  }

  get (x: number, y: number): SpaceQuad<T> {
    return this.nodes.find(n => n.x === x && n.y === y)
  }

  add (x: number, y: number, data: T): SpaceQuad<T> {
    const node: SpaceQuad<T> = {
      x, y, data,
      top: null,
      bottom: null,
      right: null,
      left: null
    }
    this.nodes.push(node)
    const leftNode = this.get(x - 1, y)
    const rightNode = this.get(x + 1, y)
    const topNode = this.get(x, y - 1)
    const bottomNode = this.get(x, y + 1)
    if (leftNode) {
      node.left = leftNode
      leftNode.right = node
    }
    if (rightNode) {
      node.right = rightNode
      rightNode.left = node
    }
    if (topNode) {
      node.top = topNode
      topNode.bottom = node
    }
    if (bottomNode) {
      node.bottom = bottomNode
      bottomNode.top = node
    }
    return node
  }

  toString (): string {
    let s = ''
    for (let y = 0; y < this.bounds.height; y++) {
      let row = ['', '', '']
      for (let x = 0; x < this.bounds.width; x++) {
        const node = this.get(x, y)
        if (!node) {
          row = row.map(r => r + '   ')
        } else {
          row[0] += ` ${node.top ? 'X' : ' '} `
          row[1] += `${node.left ? 'X' : ' '}X${node.right ? 'X' : ' '}`
          row[2] += ` ${node.bottom ? 'X' : ' '} `
        }
        row = row.map(r => r + ' ')
      }
      s += row.join('\n') + '\n'
    }
    return s
  }

  [Symbol.iterator] () {
    let i = 0
    const nodes = this.nodes
    return {
      next () {
        i++
        return {
          value: nodes[i - 1],
          done: i === nodes.length - 1
        }
      }
    }
  }

  static getCellInDirection<T> (direction: Direction, cell: SpaceQuad<T>): SpaceQuad<T> {
    switch (direction) {
      case Direction.DOWN:
        return cell.bottom
      case Direction.RIGHT:
        return cell.right
      case Direction.LEFT:
        return cell.left
      case Direction.UP:
        return cell.top
    }
  }

}
