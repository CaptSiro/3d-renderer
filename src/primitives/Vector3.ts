import { Vec3 } from "../types.ts";



export default class Vector3 {
    public static FORWARD: Vec3 = glm.vec3(0, 0, 1);
    public static RIGHT: Vec3 = glm.vec3(1, 0, 0);
    public static UP: Vec3 = glm.vec3(0, 1, 0);

    public static X: Vec3 = glm.vec3(1, 0, 0);
    public static Y: Vec3 = glm.vec3(0, 1, 0);
    public static Z: Vec3 = glm.vec3(0, 0, 1);



    public static equal(a: Vec3, b: Vec3): boolean {
        return a.x === b.x
            && a.y === b.y
            && a.z === b.z;
    }
}
