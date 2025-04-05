import { Opt } from "../../../../../lib/types.ts";



export default class ParseContext<T> {
    private readonly collection: T[];
    private current: T;
    private currentUpdated: boolean;



    public constructor(
        public factory: () => T
    ) {
        this.collection = [];
        this.current = this.factory();
        this.currentUpdated = false;
    }



    public set(key: keyof T, value: T[keyof T], updated: boolean = true): void {
        this.currentUpdated = updated;
        this.current[key] = value;
    }

    public save(initial: Opt<T> = undefined): void {
        if (!this.currentUpdated) {
            return;
        }

        this.collection.push(this.current);
        this.current = initial ?? this.factory();
        this.currentUpdated = false;
    }

    public getCollection(): T[] {
        return this.collection;
    }

    public getCurrent(): T {
        return this.current;
    }

    public markAsUpdated(): void {
        this.currentUpdated = true;
    }
}