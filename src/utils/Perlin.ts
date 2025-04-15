import MathLib from "./MathLib.ts";
import Vector2 from "./Vector2.ts";
import Cache2 from "./Cache2.ts";
import { Vec2 } from "../types.ts";
import { is } from "../../lib/jsml/jsml.ts";



export default class Perlin {
    private static gradients = new Cache2<Vec2>();
    private static cache = new Cache2<number>();

    private static gridDotProductAt(x0: number, y0: number, x1: number, y1: number): number {
        let v0 = Perlin.gradients.get(x1, y1);
        if (!is(v0)) {
            Perlin.gradients.set(x1, y1, v0 = Vector2.random());
        }

        const v1 = glm.vec2(x0 - x1, y0 - y1);
        return glm.dot(v0, v1);
    }

    public static noise(x: number, y: number): number {
        const value = Perlin.cache.get(x, y);
        if (is(value)) {
            return value;
        }

        const x_ = Math.floor(x);
        const y_ = Math.floor(y);

        const top_left = this.gridDotProductAt(x, y, x_, y_);
        const top_right = this.gridDotProductAt(x, y, x_ + 1, y_);
        const bottom_left = this.gridDotProductAt(x, y, x_, y_ + 1);
        const bottom_right = this.gridDotProductAt(x, y, x_ + 1, y_ + 1);

        const a = MathLib.lerp(top_left, top_right, MathLib.smoothStep(x - x_));
        const b = MathLib.lerp(bottom_left, bottom_right, MathLib.smoothStep(x - x_));
        const v = MathLib.lerp(a, b, MathLib.smoothStep(y - y_));

        Perlin.cache.set(x, y, v);
        return v;
    }
}
