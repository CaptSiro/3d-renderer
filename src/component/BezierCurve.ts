import { float01, Vec3 } from "../types.ts";
import Vector3 from "../utils/Vector3.ts";
import { SplineSegment } from "./SplineSegment.ts";



export default class BezierCurve implements SplineSegment {
    constructor(
        public a: Vec3,
        public b: Vec3,
        public c: Vec3,
        public d: Vec3,
    ) {
    }

    public getPoint(t: float01): Vec3 {
        const e = Vector3.lerp(this.a, this.b, t);
        const f = Vector3.lerp(this.b, this.c, t);
        const g = Vector3.lerp(this.c, this.d, t);

        const h = Vector3.lerp(e, f, t);
        const j = Vector3.lerp(f, g, t);

        return Vector3.lerp(h, j, t);
    }
}