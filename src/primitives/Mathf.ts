import { float } from "../types.ts";



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
}