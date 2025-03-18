import { gl } from "./main.ts";



export function sizeof(type: GLenum): number {
    switch (type) {
        case gl.FLOAT:
            return 4;
        default:
            return 0;
    }
}