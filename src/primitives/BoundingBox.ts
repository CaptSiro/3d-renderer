import { Vec3 } from "../types.ts";



export default class BoundingBox {
    public static min(a: Vec3, b: Vec3): Vec3 {
        return glm.vec3(
            Math.min(a.x, b.x),
            Math.min(a.y, b.y),
            Math.min(a.z, b.z),
        );
    }

    public static max(a: Vec3, b: Vec3): Vec3 {
        return glm.vec3(
            Math.max(a.x, b.x),
            Math.max(a.y, b.y),
            Math.max(a.z, b.z),
        );
    }



    constructor(
        private low: Vec3,
        private high: Vec3
    ) {
    }

    public getLow(): Vec3 {
        return this.low;
    }

    public getHigh(): Vec3 {
        return this.high;
    }
}