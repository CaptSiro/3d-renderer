import Path from "../Path.ts";
import ResourceCache from "../ResourceCache.ts";



type ShaderSourceArg = {
    vertex: Path,
    fragment: Path
}

export default class ShaderSource {
    private static cache: ResourceCache<ShaderSourceArg, ShaderSource> = new ResourceCache(
        arg => arg.vertex.getLiteral() + arg.fragment.getLiteral(),
        ShaderSource.create
    );

    public static async create(arg: ShaderSourceArg): Promise<ShaderSource> {
        const vert = await arg.vertex.read();
        const frag = await arg.fragment.read();

        return new ShaderSource(vert, frag);
    }

    public static async load(vertex: Path, fragment: Path): Promise<ShaderSource> {
        return this.cache.get({ vertex, fragment });
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