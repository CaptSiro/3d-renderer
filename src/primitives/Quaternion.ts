import { float, Quat } from "../types.ts";



export class Quaternion {
    public static euler(pitch: float, yaw: float, roll: float): Quat {
        return glm.quat(glm.vec3(pitch, yaw, roll));
    }

    public static eulerDegrees(pitch: float, yaw: float, roll: float): Quat {
        return glm.quat(glm.vec3(glm.radians(pitch), glm.radians(yaw), glm.radians(roll)));
    }
}