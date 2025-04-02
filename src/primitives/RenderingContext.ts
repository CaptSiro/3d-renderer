import { Mat4 } from "../types.ts";
import Camera from "../component/Camera.ts";



export default class RenderingContext {
    public constructor(
        public readonly parentMatrix: Mat4,
        public readonly camera: Camera,
    ) {
    }
}