export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Rector implements IRect {
  public x: number = 0;
  public y: number = 0;
  public width: number = 0;
  public height: number = 0;

  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0
  ) {
    this.x = Math.ceil(x);
    this.y = Math.ceil(y);
    this.width = Math.ceil(width);
    this.height = Math.ceil(height);
  }

  public removeFromLeft(amount: number): Rector {
    amount = Math.floor(Math.max(0, Math.min(amount, this.width)));

    const removed = new Rector(this.x, this.y, amount, this.height);

    this.x += amount;
    this.width -= amount;

    return removed;
  }

  public removeFromTop(amount: number): Rector {
    amount = Math.floor(Math.max(0, Math.min(amount, this.height)));

    const removed = new Rector(this.x, this.y, this.width, amount);

    this.y += amount;
    this.height -= amount;

    return removed;
  }

  public removeFromBottom(amount: number): Rector {
    amount = Math.floor(Math.max(0, Math.min(amount, this.height)));

    const removed = new Rector(
      this.x,
      this.height - amount,
      this.width,
      amount
    );

    this.height -= amount;

    return removed;
  }
}
