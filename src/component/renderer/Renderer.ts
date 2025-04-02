import BoundingBox from "../../primitives/BoundingBox.ts";
import { Opt } from "../../../lib/types.ts";
import RenderingContext from "../../primitives/RenderingContext.ts";



export function isRenderer(x: any): x is Renderer {
    return typeof x["draw"] === "function"
        && typeof x["getBoundingBox"] === "function";
}

export default interface Renderer {
    draw(context: RenderingContext): void;

    getBoundingBox(): Opt<BoundingBox>;
}