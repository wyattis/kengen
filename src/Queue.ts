export class Queue<T> {
  private cursor: number = 0
  constructor (private items: T[] = []) {}

  next (): T {
    const i = this.cursor
    this.cursor++
    return i < this.items.length ? this.items[i] : null
  }

  previous (): T {
    const i = this.cursor
    this.cursor--
    return i >= 0 ? this.items[i] : null
  }
}
