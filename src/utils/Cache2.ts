import { is } from "../../lib/jsml/jsml.ts";
import { Opt } from "../../lib/types.ts";



export default class Cache2<T> {
    private readonly cache: Map<number, Map<number, T>>;

    constructor() {
        this.cache = new Map();
    }

    public set(x: number, y: number, value: T): void {
        let row = this.cache.get(x);
        if (!is(row)) {
            this.cache.set(x, row = new Map<number, T>());
        }

        row.set(y, value);
    }

    public get(x: number, y: number, _default: Opt<T> = undefined): Opt<T> {
        const row = this.cache.get(x);
        if (!is(row)) {
            return _default;
        }

        const t = row.get(y);
        if (!is(t)) {
            return _default;
        }

        return t;
    }
}