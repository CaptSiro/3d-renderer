import { int } from "../types.ts";



export default class Counter {
    private n: int;

    constructor(start: int = 0) {
        this.n = start;
    }

    public increment(): int {
        return this.n++;
    }

    public peek(): int {
        return this.n;
    }
}