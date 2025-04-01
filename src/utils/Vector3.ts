import { float, Vec3 } from "../types.ts";



export default class Vector3 {
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

    public static log(v: Vec3): void {
        console.log({
            x: v.x,
            y: v.y,
            z: v.z
        });
    }
}
