import { Vec3 } from "../types.ts";
import VertexLayout from "../resource/mesh/VertexLayout.ts";
import { LAYOUT_NONE, LAYOUT_VERTEX3 } from "../webgl.ts";



const rayVertexLayout = new VertexLayout(
    LAYOUT_VERTEX3,
    LAYOUT_NONE,
    LAYOUT_NONE,
    LAYOUT_NONE,
);

export default class Ray {
    constructor(
        private start: Vec3,
        private direction: Vec3,
    ) {
    }

    public getStart(): Vec3 {
        return this.start;
    }

    public getEnd(): Vec3 {
        return this.start ["+"] (this.direction);
    }

    public setStart(start: Vec3): void {
        this.start = start;
    }

    public getDirection(): Vec3 {
        return this.direction;
    }

    public setDirection(direction: Vec3): void {
        this.direction = direction;
    }

    public getVertexLayout(): VertexLayout {
        return rayVertexLayout;
    }

    public getData(): Float32Array {
        const array = new Float32Array(rayVertexLayout.getTotal() * 2);

        let i = 0;
        array[i++] = this.start.x;
        array[i++] = this.start.y;
        array[i++] = this.start.z;

        const end = this.getEnd();
        array[i++] = end.x;
        array[i++] = end.y;
        array[i++] = end.z;

        return array;
    }
}