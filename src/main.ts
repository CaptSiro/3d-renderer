import { $, is } from "../lib/jsml/jsml.ts";

const viewport = $<HTMLCanvasElement>("#viewport");
if (!is(viewport)) {
    throw new Error("Could not locate main viewport");
}

const context = viewport?.getContext("webgl2");
if (!is(context)) {
    throw new Error("Could not load WebGL context");
}

