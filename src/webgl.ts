import VertexLayout from "./resource/mesh/VertexLayout.ts";
import { Opt } from "../lib/types.ts";
import { is } from "../lib/jsml/jsml.ts";
import { gl } from "./main.ts";



export const FLOAT_SIZE = 4;
export const INT_SIZE = 4;

export const FOG_LINEAR_END_OFFSET = 4;

export const MAX_LIGHTS = 64;
export const LIGHT_SIZE = 16;
export const LIGHT_UBO_BINDING = 0;
export const LIGHT_UBO_LENGTH_OFFSET = LIGHT_SIZE * FLOAT_SIZE * MAX_LIGHTS;
export const LIGHT_UBO_SIZE = LIGHT_UBO_LENGTH_OFFSET + INT_SIZE;

export const LAYOUT_VERTEX3 = 3;
export const LAYOUT_NORMAL3 = 3;
export const LAYOUT_TEX_COORD2 = 2;
export const LAYOUT_INDEX = 1;
export const LAYOUT_NONE = 0;

export const lineVertexLayout = new VertexLayout(
    LAYOUT_VERTEX3,
    LAYOUT_NONE,
    LAYOUT_NONE,
    LAYOUT_NONE,
);

export const meshVertexLayout = new VertexLayout(
    LAYOUT_VERTEX3,
    LAYOUT_NORMAL3,
    LAYOUT_TEX_COORD2,
    LAYOUT_NONE,
);

export const quadVertexLayout = new VertexLayout(
    LAYOUT_VERTEX3,
    LAYOUT_NONE,
    LAYOUT_TEX_COORD2,
    LAYOUT_NONE
);

export function deleteBuffer(buffer: Opt<WebGLBuffer>): void {
    if (!is(buffer)) {
        return;
    }

    gl.deleteBuffer(buffer);
}

export function deleteVertexArray(vertexArrayObject: Opt<WebGLVertexArrayObject>): void {
    if (!is(vertexArrayObject)) {
        return;
    }

    gl.deleteVertexArray(vertexArrayObject);
}
