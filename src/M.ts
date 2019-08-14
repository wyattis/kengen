// Simple seedable Psuedo random number generator
let seed = 1
let rng: () => number = Math.random
function prng (): number {
  seed = seed * 16807 % 2147483647
  return (seed - 1) / 2147483646
}

/**
 * Set the seed for our prng
 * @param seed
 */
export function setSeed (v: number) {
  seed = v
  rng = prng
}

/**
 * Remove any previously set seed on the random number generator
 */
export function clearSeed () {
  seed = 1
  rng = Math.random
}

/**
 * Returns a random float between min and max.
 * @param min
 * @param max
 */
export function random (min: number = 0, max: number = 1): number {
  return rng() * (max - min) + min
}

/**
 * Returns a random integer between the min and max values.
 * @param min
 * @param max
 */
export function randomInt (min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1))
}

/**
 * Returns an array of integers between the min and max values.
 * @param min
 * @param max
 */
export function range (min: number, max: number): number[] {
  return Array.from({ length: Math.round(max - min) }, (_, i) => min + i)
  // return Array(Math.round(Math.abs(max - min) / step)).fill(0).map(i => min + i * step)
}

/**
 * Returns an array of all shared elements between two arrays. Uses referential equality to determine if elements are
 * the same.
 * @param setA
 * @param setB
 */
export function intersection<T> (setA: T[], setB: T[]): T[] {
  const intersecting = []
  for (const val of setA) {
    if (setB.indexOf(val) > -1 && intersecting.indexOf(val) === -1) {
      intersecting.push(val)
    }
  }
  return intersecting
}

/**
 * Returns a tuple containing a random element from a collection and the index of that element in the collection.
 * @param arr
 */
export function randomFrom<T> (arr: T[]): T {
  if (!arr.length) return null
  return arr[randomInt(0, arr.length - 1)]
}

/**
 * Shuffle an array in place
 * @param arr
 */
export function shuffle<T> (arr: T[]): T[] {
  let m = arr.length
  let t
  let i

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(rng() * m--)

    // And swap it with the current element.
    t = arr[m]
    arr[m] = arr[i]
    arr[i] = t
  }

  return arr
}

export function* permutationsOf<T> (arr: T[]): IterableIterator<T[]> {
  const permutation = arr.slice(0)
  const c = Array(arr.length).fill(0)
  let i = 1
  let k
  let p

  yield permutation.slice()
  while (i < arr.length) {
    if (c[i] < i) {
      k = i % 2 && c[i]
      p = permutation[i]
      permutation[i] = permutation[k]
      permutation[k] = p
      ++c[i]
      i = 1
      yield permutation.slice()
    } else {
      c[i] = 0
      ++i
    }
  }
}

export function* combinationsOf<T> (arr: T[], n: number): IterableIterator<T[]> {
  for (let i = 0; i < arr.length; i++) {
    if (n === 1) {
      yield [arr[i]]
    } else {
      let remaining = combinationsOf(arr.slice(i + 1, arr.length), n - 1)
      for (let next of remaining) {
        yield [arr[i], ...next]
      }
    }
  }
}

export function swap<T> (arr: T[], indexA: number, indexB: number): T[] {
  const v = arr[indexA]
  arr[indexA] = arr[indexB]
  arr[indexB] = v
  return arr
}
