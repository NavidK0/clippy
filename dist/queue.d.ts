export default class Queue {
    private readonly onEmpty;
    private queue;
    private isActive;
    constructor(onEmpty: Function);
    enqueue(func: Function): void;
    clear(): void;
    next(): void;
    private pop;
}
//# sourceMappingURL=queue.d.ts.map