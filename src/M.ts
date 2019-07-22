/**
 * Returns a random float between min and max.
 * @param min
 * @param max
 */
export function random (min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between the min and max values.
 * @param min
 * @param max
 */
export function randomInt (min: number, max: number): number {
  return Math.floor(random(min, max))
}

/**
 * Returns an array of integers between the min and max values.
 * @param min
 * @param max
 */
export function range (min: number, max: number): number[] {
  return Array.from({length: Math.round(max - min)}, (_, i) => min + i)
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
  return arr[randomInt(0, arr.length)]
}