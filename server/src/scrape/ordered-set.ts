export class OrderedSet<T> {
  private set: Set<T>;
  private order: T[];

  constructor() {
    this.set = new Set();
    this.order = [];
  }

  add(value: T): void {
    if (!this.set.has(value)) {
      this.set.add(value);
      this.order.push(value);
    }
  }

  delete(value: T): boolean {
    if (this.set.has(value)) {
      this.set.delete(value);
      this.order = this.order.filter((item) => item !== value);
      return true;
    }
    return false;
  }

  has(value: T): boolean {
    return this.set.has(value);
  }

  get(index: number): T | undefined {
    return this.order[index];
  }

  values(): T[] {
    return [...this.order];
  }

  size(): number {
    return this.set.size;
  }

  fill(values: T[]): void {
    for (const value of values) {
      this.add(value);
    }
  }
}
