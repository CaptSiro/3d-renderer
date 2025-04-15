import type { Vec3 } from "../types.ts";



export default class Arrays {
    public static mutateMap<T, R>(array: T[], map: (x: T) => R): R[] {
        const a = array as any[];

        for (let i = 0; i < array.length; i++) {
            a[i] = map(array[i]);
        }

        return a;
    }

    public static writeVec3(buffer: Float32Array, offset: number, vec: Vec3): number {
        buffer[offset++] = vec.x;
        buffer[offset++] = vec.y;
        buffer[offset++] = vec.z;
        return offset;
    }
}