import { float, Quat, Vec3 } from "../types.ts";
import MathLib from "./MathLib.ts";



export default class Quaternion {
    public static fromEuler(pitch: float, yaw: float, roll: float): Quat {
        return glm.quat(glm.vec3(pitch, yaw, roll));
    }

    public static toEuler(quat: Quat): Vec3 {
        const { x, y, z, w } = quat;

        const t0 = 2 * (w * x + y * z);
        const t1 = 1 - 2 * (x * x + y * y);
        const angleX = Math.atan2(t0, t1);

        let t2 = 2 * (w * y - z * x);
        if (t2 > 1) {
            t2 = 1;
        }

        if (t2 < -1) {
            t2 = -1;
        }

        const angleY = Math.asin(t2);

        const t3 = 2 * (w * z + x * y);
        const t4 = 1 - 2 * (y * y + z * z);
        const angleZ = Math.atan2(t3, t4);

        return glm.vec3(
            MathLib.round(angleX, 5),
            MathLib.round(angleY, 5),
            MathLib.round(angleZ, 5)
        );
    }

    public static toEulerDegrees(quat: Quat): Vec3 {
        const angles = Quaternion.toEuler(quat);
        angles ["*="] (180 / Math.PI);
        return angles;
    }

    public static fromEulerDegrees(pitch: float, yaw: float, roll: float): Quat {
        return glm.quat(glm.vec3(glm.radians(pitch), glm.radians(yaw), glm.radians(roll)));
    }
}