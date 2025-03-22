import { float, int } from "../types.ts";



export default class Mathf {
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
}