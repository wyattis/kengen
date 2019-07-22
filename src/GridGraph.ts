import { Direction, SpaceQuad } from './kenken.types'
import { Rectangle } from './Rectangle'

export class GridGraph<T> {

  private nodes: SpaceQuad<T>[] = []
  private bounds: Rectangle = new Rectangle(0, 0, 0, 0)

  has (x: number, y: number): boolean {
    return this.get(x, y) !== null
  }

  get (x: number, y: number): SpaceQuad<T> {
    return this.nodes.find(n => n.x === x && n.y === y)
  }

  add (x: number, y: number, data: T) {
    const node: SpaceQuad<T> = {
      x, y, data,
      top: null,
      bottom: null,
      right: null,
      left: null
    }
    this.bounds.extend(x, y)
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
