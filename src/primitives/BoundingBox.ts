import { int, Vec3 } from "../types.ts";
import { LAYOUT_VERTEX3 } from "../webgl.ts";
import { gl } from "../main.ts";
import Vector3 from "../utils/Vector3.ts";



export default class BoundingBox {
    public static LINE_COUNT: int = 12 * 2;

    public static getIndexType(): GLenum {
        return gl.UNSIGNED_SHORT;
    }

    public static initial(): BoundingBox {
        return new BoundingBox(
            Vector3.clone(Vector3.MAX),
            Vector3.clone(Vector3.MIN)
        );
    }



    constructor(
        private low: Vec3,
        private high: Vec3
    ) {
    }



    public add(vertex: Vec3): void {
        this.addVertex(
            vertex.x,
            vertex.y,
            vertex.z
        );
    }

    public addVertex(x: number, y: number, z: number): void {
        if (this.low.x > x) {
            this.low.x = x;
        }

        if (this.low.y > y) {
            this.low.y = y;
        }

        if (this.low.z > z) {
            this.low.z = z;
        }

        if (this.high.x < x) {
            this.high.x = x;
        }

        if (this.high.y < y) {
            this.high.y = y;
        }

        if (this.high.z < z) {
            this.high.z = z;
        }
    }

    public getLow(): Vec3 {
        return this.low;
    }

    public getHigh(): Vec3 {
        return this.high;
    }

    public merge(other: BoundingBox): void {
        this.low = Vector3.min(this.low, other.low);
        this.high = Vector3.max(this.high, other.high);
    }

    public getVertexes(): Float32Array {
        const array = new Float32Array(8 * LAYOUT_VERTEX3);
        let i = 0;

        array[i++] = this.low.x;
        array[i++] = this.low.y;
        array[i++] = this.low.z;

        array[i++] = this.high.x;
        array[i++] = this.low.y;
        array[i++] = this.low.z;

        array[i++] = this.low.x;
        array[i++] = this.low.y;
        array[i++] = this.high.z;

        array[i++] = this.high.x;
        array[i++] = this.low.y;
        array[i++] = this.high.z;

        array[i++] = this.low.x;
        array[i++] = this.high.y;
        array[i++] = this.low.z;

        array[i++] = this.high.x;
        array[i++] = this.high.y;
        array[i++] = this.low.z;

        array[i++] = this.low.x;
        array[i++] = this.high.y;
        array[i++] = this.high.z;

        array[i++] = this.high.x;
        array[i++] = this.high.y;
        array[i++] = this.high.z;

        return array;
    }

    public getVertexIndexes(): Uint16Array {
        const array = new Uint16Array(BoundingBox.LINE_COUNT);
        let i = 0;

        array[i++] = 0;
        array[i++] = 1;

        array[i++] = 0;
        array[i++] = 2;

        array[i++] = 1;
        array[i++] = 3;

        array[i++] = 2;
        array[i++] = 3;

        array[i++] = 4;
        array[i++] = 5;

        array[i++] = 4;
        array[i++] = 6;

        array[i++] = 5;
        array[i++] = 7;

        array[i++] = 6;
        array[i++] = 7;

        array[i++] = 0;
        array[i++] = 4;

        array[i++] = 1;
        array[i++] = 5;

        array[i++] = 2;
        array[i++] = 6;

        array[i++] = 3;
        array[i++] = 7;

        return array;
    }
}