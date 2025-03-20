import BoundingBox from "../../primitives/BoundingBox.ts";
import { Opt } from "../../../lib/types.ts";



export function isRenderer(x: any): x is Renderer {
    return typeof x["draw"] === "function"
        && typeof x["getBoundingBox"] === "function";
}

export default interface Renderer {
    draw(): void;

    getBoundingBox(): Opt<BoundingBox>;
}