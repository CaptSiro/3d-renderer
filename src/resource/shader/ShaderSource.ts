import Path from "../Path.ts";
import AsyncResourceCache from "../AsyncResourceCache.ts";
import { _, is } from "../../../lib/jsml/jsml.ts";
import { Opt } from "../../../lib/types.ts";



type ShaderSourceArg = {
    vertex: Path,
    fragment: Path
}

export default class ShaderSource {
    private static cache: AsyncResourceCache<ShaderSourceArg, Opt<ShaderSource>> = new AsyncResourceCache(
        ShaderSource.stringifyArg,
        ShaderSource.create
    );

    public static stringifyArg(arg: ShaderSourceArg): string {
        return arg.vertex.getLiteral() + arg.fragment.getLiteral();
    }

    public static async create(arg: ShaderSourceArg): Promise<Opt<ShaderSource>> {
        const vert = await arg.vertex.read();
        const frag = await arg.fragment.read();

        if (!is(vert) || !is(frag)) {
            return _;
        }

        return new ShaderSource(ShaderSource.stringifyArg(arg), vert, frag);
    }

    public static async load(vertex: Path, fragment: Path): Promise<Opt<ShaderSource>> {
        return this.cache.get({ vertex, fragment });
    }

    public static async loadShader(name: string): Promise<Opt<ShaderSource>> {
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