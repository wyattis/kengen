export class Rectangle {
  constructor (public x: number, public y: number, public width: number, public height: number) {}

  public get top (): number {
    return this.y
  }

  public get left (): number {
    return this.x
  }

  public get right (): number {
    return this.x + this.width
  }

  public set right (val: number) {
    this.width = val - this.x
  }

  public get bottom (): number {
    return this.y + this.height
  }

  public set bottom (val: number) {
    this.height = val - this.y
  }

  public extend (x: number, y: number) {
    if (x > this.right) {
      this.right = x
    }
    if (y > this.bottom) {
      this.bottom = y
    }
  }

}
