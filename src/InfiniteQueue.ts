export class InfiniteQueue<T> {
  private cursor: number = 0
  constructor (private items: T[] = []) {}

  get size (): number {
    return this.items.length
  }

  get (index: number): T {
    const i = index % this.size
    return this.items[i]
  }

  add (item: T): this {
    this.items.push(item)
    return this
  }

  next (): T {
    this.cursor++
    return this.get(this.cursor - 1)
  }

  previous (): T {
    this.cursor--
    return this.get(this.cursor + 1)
  }
}
