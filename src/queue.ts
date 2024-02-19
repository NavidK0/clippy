export default class Queue {
  private readonly onEmpty: Function;

  private queue: Function[];

  private isActive: boolean = false;

  constructor(onEmpty: Function) {
    this.queue = [];
    this.onEmpty = onEmpty;
  }

  public enqueue(func: Function) {
    this.queue.push(func);

    if (this.queue.length === 1 && !this.isActive) {
      this.pop();
    }
  }

  public clear() {
    this.queue = [];
  }

  public next() {
    this.isActive = false;
    this.pop();
  }

  private pop() {
    // Stop if nothing left in queue
    if (!this.queue.length) {
      this.onEmpty();
      return;
    }

    const func = this.queue.shift();
    this.isActive = true;

    // execute function
    const completeFunction = this.next.bind(this);
    if (func) func(completeFunction);
  }
}
