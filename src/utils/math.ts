/**
 * Return a number in the range [min, max)
 */
export function randomRange(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

/**
 * Pick random element in array
 */
export function pickRandom<T>(arr: T[]) {
  return arr[randomRange(0, arr.length)];
}

/**
 * Simple class that represends a 2D Vector
 */
export class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static empty() {
    return new Vector2(0, 0);
  }

  static randomRange(min: Vector2, max: Vector2) {
    return new Vector2(randomRange(min.x, max.x), randomRange(min.y, max.y));
  }

  getLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  abs() {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
  }

  add(val: Vector2 | number) {
    if (val instanceof Vector2) {
      this.x += val.x;
      this.y += val.y;
    } else {
      this.x += val;
      this.y += val;
    }
  }

  added(val: Vector2 | number) {
    const out = new Vector2(this.x, this.y);
    out.add(val);
    return out;
  }

  diff(val: Vector2 | number) {
    if (val instanceof Vector2) {
      this.x -= val.x;
      this.y -= val.y;
    } else {
      this.x -= val;
      this.y -= val;
    }
  }

  diffed(val: Vector2 | number) {
    const out = new Vector2(this.x, this.y);
    out.diff(val);
    return out;
  }

  multiply(val: Vector2 | number) {
    if (val instanceof Vector2) {
      this.x *= val.x;
      this.y *= val.y;
    } else {
      this.x *= val;
      this.y *= val;
    }
  }

  multiplied(val: Vector2 | number) {
    const out = new Vector2(this.x, this.y);
    out.multiply(val);
    return out;
  }

  divide(val: Vector2 | number) {
    if (val instanceof Vector2) {
      this.x /= val.x;
      this.y /= val.y;
    } else {
      this.x /= val;
      this.y /= val;
    }
  }

  divided(val: Vector2 | number) {
    const out = new Vector2(this.x, this.y);
    out.divide(val);
    return out;
  }

  normalize() {
    const length = this.getLength();
    if (length === 0) return;
    this.x /= length;
    this.y /= length;
  }

  normalized() {
    const out = new Vector2(this.x, this.y);
    out.normalize();
    return out;
  }

  distanceTo(other: Vector2) {
    const out = this.diffed(other);
    out.abs();
    return out.getLength();
  }

  toString() {
    return `Vector2(${this.x}, ${this.y})`;
  }
}

/**
 * Function that checks the collision between 2 objects using the AABB algorithm
 */
export function checkAABB(
  pos1: Vector2,
  dimensions1: Vector2,
  pos2: Vector2,
  dimensions2: Vector2,
) {
  return (
    pos1.x < pos2.x + dimensions2.x &&
    pos1.x + dimensions1.x > pos2.x &&
    pos1.y < pos2.y + dimensions2.y &&
    pos1.y + dimensions1.y > pos2.y
  );
}

