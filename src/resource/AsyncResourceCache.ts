import { is } from "../../lib/jsml/jsml.ts";



export default class AsyncResourceCache<A, T> {
    private readonly cache: Map<string, T>;

    constructor(
        private toKey: (arg: A) => string,
        private builder: (arg: A) => Promise<T>
    ) {
        this.cache = new Map();
    }

    /**
     * If the argument exists in the cache return built result if not build it, store it, and return it
     * @param arg
     */
    public async get(arg: A): Promise<T> {
        const key = this.toKey(arg);
        const hit = this.cache.get(key);

        if (is(hit)) {
            return hit;
        }

        const result = this.builder(arg);
        this.cache.set(key, await result);

        return result;
    }
}