import Path from "../Path.ts";
import ResourceCache from "../ResourceCache.ts";



type ShaderSourceArg = {
    vertex: Path,
    fragment: Path
}

export default class ShaderSource {
    private static cache: ResourceCache<ShaderSourceArg, ShaderSource> = new ResourceCache(
        ShaderSource.stringifyArg,
        ShaderSource.create
    );

    public static stringifyArg(arg: ShaderSourceArg): string {
        return arg.vertex.getLiteral() + arg.fragment.getLiteral();
    }

    public static async create(arg: ShaderSourceArg): Promise<ShaderSource> {
        const vert = await arg.vertex.read();
        const frag = await arg.fragment.read();

        return new ShaderSource(ShaderSource.stringifyArg(arg), vert, frag);
    }

    public static async load(vertex: Path, fragment: Path): Promise<ShaderSource> {
        return this.cache.get({ vertex, fragment });
    }

    public static async loadShader(name: string): Promise<ShaderSource> {
        return ShaderSource.load(
            Path.from("/assets/shaders/" + name + ".vert"),
            Path.from("/assets/shaders/" + name + ".frag"),
        );
    }



    constructor(
        private name: string,
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

    public getName(): string {
        return this.name;
    }
}