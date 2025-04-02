import { Mat4, Vec4 } from "../types.ts";



export default class RayCastContext {
    public constructor(
        public readonly parentMatrix: Mat4,
        public readonly ray_w: { start: Vec4, direction: Vec4 }
    ) {
    }
}