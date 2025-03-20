import { Vec3, Vec4 } from "../types.ts";



export default class Vector4 {
    public static convertPoint3(a: Vec3): Vec4 {
        return glm.vec4(
            a.x,
            a.y,
            a.z,
            1
        );
    }

    public static convertVector3(a: Vec3): Vec4 {
        return glm.vec4(
            a.x,
            a.y,
            a.z,
            0
        );
    }
}
