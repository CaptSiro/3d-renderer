import { float, int, Vec3 } from "../types.ts";



export default class MathLib {
    public static clamp(x: float, min: float, max: float): float {
        if (x >= max) {
            return max;
        }

        if (x <= min) {
            return min;
        }

        return x;
    }

    public static round(x: float, precision: int): float {
        if (precision < 1) {
            return Math.round(x);
        }

        const m = Math.pow(10, precision);
        return Math.round(x * m) / m;
    }

    public static normalize(a: float, b: float, x: float): float {
        return (x - a) / (b - a);
    }

    public static lerp(a: float, b: float, t: float): float {
        return a + (b - a) * t;
    }

    public static lerpColor(a: Vec3, b: Vec3, t: float): Vec3 {
        return glm.vec3(
            MathLib.lerp(a.x, b.x, t),
            MathLib.lerp(a.y, b.y, t),
            MathLib.lerp(a.z, b.z, t),
        );
    }

    public static is2PowX(x: number): boolean {
        return (x & (x - 1)) === 0;
    }
}