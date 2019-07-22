import { Renderer } from '../src/Renderer'
import { expect } from 'chai'
import 'mocha'

type Shape = {name: string, shape: number[], result: [number, number][]}

describe('Renderer specifications', () => {

  describe('getGroupEdges', () => {
    // [][][]
    // []
    const shapeL1: Shape = {
      name: `[][][]\n[]`,
      shape: [0, 1, 2, 4],
      result: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [1, 1], [1, 2], [0, 2], [0, 1], [0, 0]]
    }
    // [][][]
    //     []
    const shapeL2: Shape = {
      name: `[][][]\n    []`,
      shape: [0, 1, 2, 6],
      result: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [2, 2], [2, 1], [1, 1], [0, 1], [0, 0]]
    }
    // [][]
    // [][]
    const shapeBox: Shape = {
      name: `[][]\n[][]`,
      shape: [0, 1, 4, 5],
      result: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1], [0, 0]]
    }
    //   []
    // [][][]
    const shapeT1: Shape = {
      name: `  []  \n[][][]`,
      shape: [1, 4, 5, 6],
      result: [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [1, 2], [0, 2], [0, 1], [1, 1], [1, 0]]
    }
    // [][][]
    //   []
    const shapeT2: Shape = {
      name: `[][][]\n  []`,
      shape: [0, 1, 2, 5],
      result: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [1, 2], [1, 1], [0, 1], [0, 0]]
    }
    //   [][]
    // [][]
    const shapeTetris: Shape = {
      name: `  [][]\n[][]`,
      shape: [1, 2, 4, 5],
      result: [[1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1], [1, 1], [1, 0]]
    }
    //   []
    // [][][]
    //   []
    const shapePlus: Shape = {
      name: `  []  \n[][][]\n  []`,
      shape: [1, 4, 5, 6, 9],
      result: [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1], [1, 0]]
    }
    // [][]
    // []
    // [][]
    const shapeC1: Shape = {
      name: `[][]\n[]\n[][]`,
      shape: [0, 1, 4, 8, 9],
      result: [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [1, 2], [2, 2], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]]
    }
    // []
    const shapeCell: Shape = {
      name: `[]`,
      shape: [1],
      result: [[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]
    }
    const tests4x4: Shape[] = [shapeL1, shapeL2, shapeBox, shapeT1, shapeT2, shapeTetris, shapePlus, shapeC1, shapeCell]
    for (const test of tests4x4) {
      it(test.name.replace(/\n/g, '\n        ') + '\n', () => {
        const res = Renderer.getGroupEdges(test.shape, 4).map(o => [o.x, o.y])
        expect(res, 'The edges do not match for shape: ' + JSON.stringify(test.shape)).to.deep.equal(test.result)
      })
    }
  })

})
