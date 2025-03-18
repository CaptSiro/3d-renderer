import Path from "../Path.ts";



export default class ShaderSource {
    public static async load(vertex: Path, fragment: Path): Promise<ShaderSource> {
        const vert = await vertex.read();
        const frag = await fragment.read();

        return new ShaderSource(vert, frag);
    }

    constructor(
        private vertexCode: string,
        private fragmentCode: string
    ) {
    }

    public getVertexCode(): string {
        return this.vertexCode;
    }

    public getFragmentCode(): string {
        return this.fragmentCode;
    }
}