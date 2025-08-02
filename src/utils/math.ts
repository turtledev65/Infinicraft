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

type CompareFn<T> = (a: T, b: T) => boolean;
export class GraphNode<T> {
  data: T;
  adjacent: GraphNode<T>[] = [];
  compare: CompareFn<T>;

  constructor(data: T, compare: CompareFn<T>) {
    this.data = data;
    this.compare = compare;
  }

  addAdjcacent(node: GraphNode<T>) {
    this.adjacent.push(node);
  }

  removeAdjacent(data: T) {
    const index = this.adjacent.findIndex(currNode =>
      this.compare(currNode.data, data),
    );

    if (index > -1) {
      return this.adjacent.splice(index, 1)[0];
    }
    return null;
  }
}

type MapKey = string | number;

/**
 * A simple graph implementation using adjacency lists
 */
export class Graph<T> {
  compare: CompareFn<T>;
  nodes: Map<MapKey, GraphNode<T>> = new Map();

  constructor(compare: CompareFn<T>) {
    this.compare = compare;
  }

  getNode(data: T) {
    if (typeof data === "number" || typeof data === "string") {
      return this.nodes.get(data);
    }

    const key = JSON.stringify(data);
    return this.nodes.get(key);
  }

  private setNode(key: T, value: GraphNode<T>) {
    if (typeof key === "number" || typeof key === "string") {
      this.nodes.set(key, value);
    }

    const validKey = JSON.stringify(key);
    this.nodes.set(validKey, value);
  }

  private deleteNode(key: T) {
    if (typeof key === "number" || typeof key === "string") {
      this.nodes.delete(key);
    }

    const validKey = JSON.stringify(key);
    this.nodes.delete(validKey);
  }

  addNode(data: T) {
    let node = this.getNode(data);
    if (node) return;

    node = new GraphNode(data, this.compare);
    this.setNode(data, node);
    return node;
  }

  removeNode(data: T) {
    const node = this.getNode(data);
    if (node === undefined) return null;

    this.nodes.forEach(n => {
      n.removeAdjacent(node.data);
    });
    this.deleteNode(data);

    return node;
  }

  addEdge(source: T, destination: T) {
    const sourceNode = this.addNode(source);
    const destinationNode = this.addNode(destination);
    if (!sourceNode || !destinationNode) return;

    sourceNode.addAdjcacent(destinationNode);
  }

  dfs(callback: (data: T) => void, startNode?: GraphNode<T>) {
    const visited = new Map<T, boolean>();
    const nodes = startNode?.adjacent ?? this.nodes;

    nodes.forEach(node => {
      if (!visited.has(node.data)) {
        this.dfsImpl(node, visited, callback);
      }
    });
  }

  private dfsImpl(
    node: GraphNode<T>,
    visited: Map<T, boolean>,
    callback: (data: T) => void,
  ) {
    if (!node) return;

    visited.set(node.data, true);
    callback(node.data);

    node.adjacent.forEach(item => {
      if (!visited.has(item.data)) {
        this.dfsImpl(item, visited, callback);
      }
    });
  }
}
