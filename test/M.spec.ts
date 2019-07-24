import { expect } from 'chai'
import 'mocha'
import { permutationsOf } from '../src/M'

describe('Math lib', () => {

  describe('Permutations', () => {
    it('should generate permutations from any array', () => {
      const vals = [0, 1, 2, 3]
      const perms = Array.from(permutationsOf(vals))
      console.log('perms', perms)
      const permSet = new Set(perms.map(p => p.join('')))
      expect(permSet.size).to.equal(24, 'There should be 24 unique permutations')
    })
  })

})
