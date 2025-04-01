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



    public set(key: keyof T, value: T[keyof T]): void {
        this.currentUpdated = true;
        this.current[key] = value;
    }

    public save(): void {
        if (!this.currentUpdated) {
            return;
        }

        this.collection.push(this.current);
        this.current = this.factory();
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