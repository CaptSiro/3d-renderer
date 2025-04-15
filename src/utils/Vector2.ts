import { Vec2 } from "../types.ts";



export default class Vector2 {
    public static random(): Vec2 {
        const theta = Math.random() * 2 * Math.PI;
        return glm.vec2(Math.cos(theta), Math.sin(theta));
    }
}