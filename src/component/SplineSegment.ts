import { float01, Vec3 } from "../types.ts";



export interface SplineSegment {
    getPoint(t: float01): Vec3;
}