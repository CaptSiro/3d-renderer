import { float, float01, Vec3 } from "../types.ts";
import MathLib from "./MathLib.ts";



export default class Vector3 {
    public static clone(vec: Vec3): Vec3 {
        return glm.vec3(vec);
    }

    public static ZERO: Vec3 = glm.vec3(0, 0, 0);
    public static MIN: Vec3 = glm.vec3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    public static MAX: Vec3 = glm.vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);

    public static FORWARD: Vec3 = glm.vec3(0, 0, 1);
    public static LEFT: Vec3 = glm.vec3(1, 0, 0);
    public static UP: Vec3 = glm.vec3(0, 1, 0);

    public static X: Vec3 = glm.vec3(1, 0, 0);
    public static Y: Vec3 = glm.vec3(0, 1, 0);
    public static Z: Vec3 = glm.vec3(0, 0, 1);



    public static min(a: Vec3, b: Vec3): Vec3 {
        return glm.vec3(
            Math.min(a.x, b.x),
            Math.min(a.y, b.y),
            Math.min(a.z, b.z),
        );
    }

    public static max(a: Vec3, b: Vec3): Vec3 {
        return glm.vec3(
            Math.max(a.x, b.x),
            Math.max(a.y, b.y),
            Math.max(a.z, b.z),
        );
    }

    public static clamp(min: Vec3, max: Vec3, v: Vec3): Vec3 {
        return Vector3.min(Vector3.max(min, v), max);
    }

    public static exp(v: Vec3): Vec3 {
        return glm.vec3(
            Math.exp(v.x),
            Math.exp(v.y),
            Math.exp(v.z),
        );
    }

    public static equal(a: Vec3, b: Vec3): boolean {
        return a.x === b.x
            && a.y === b.y
            && a.z === b.z;
    }

    public static rgb(red: float, green: float, blue: float): Vec3 {
        return glm.vec3(
            red / 255,
            green / 255,
            blue / 255,
        );
    }

    public static print(v: Vec3): void {
        console.log({
            x: v.x,
            y: v.y,
            z: v.z
        });
    }

    public static lerp(a: Vec3, b: Vec3, t: float01): Vec3 {
        return glm.vec3(
            MathLib.lerp(a.x, b.x, t),
            MathLib.lerp(a.y, b.y, t),
            MathLib.lerp(a.z, b.z, t),
        );
    }
}
