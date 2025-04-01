export default class Arrays {
    public static mutateMap<T, R>(array: T[], map: (x: T) => R): R[] {
        const a = array as any[];

        for (let i = 0; i < array.length; i++) {
            a[i] = map(array[i]);
        }

        return a;
    }
}