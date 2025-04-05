import { is } from "../../lib/jsml/jsml.ts";



export default class ResourceCache<A, T> {
    private readonly cache: Map<string, T>;

    constructor(
        private toKey: (arg: A) => string,
        private builder: (arg: A) => T
    ) {
        this.cache = new Map();
    }

    public get(arg: A): T {
        const key = this.toKey(arg);
        const hit = this.cache.get(key);

        if (is(hit)) {
            return hit;
        }

        const result = this.builder(arg);
        this.cache.set(key, result);

        return result;
    }
}