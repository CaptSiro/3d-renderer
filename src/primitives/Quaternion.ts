import { float, Quat } from "../types.ts";



export class Quaternion {
    public static euler(pitch: float, yaw: float, roll: float): Quat {
        return glm.quat(glm.vec3(pitch, yaw, roll));
    }
}