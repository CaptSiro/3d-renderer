export function isRenderer(x: any): x is Renderer {
    return 'draw' in x
        && typeof x["draw"] === "function";
}

export default interface Renderer {
    draw(): void;
}