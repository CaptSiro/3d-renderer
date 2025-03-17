import { Vec3 } from "../src/webgl/vec";



type Opt<T> = T | undefined;

export type Pointer<T> = {
    deref?: T;
}

export type Theme = {
    css: {
        primary: string[],
        text: string[],
        backgrounds: string[],
    },
    pen: Vec3[],
    paper: Vec3[],
    size?: number,
}
