import Path from "../Path.ts";
import { float } from "../../types";
import ResourceCache from "../ResourceCache.ts";



export type MaterialShape = {
    ambient: float[],
    diffuse: float[],
    specular: float[],
    shininess: float
}

export default class MaterialSource {
    private static cache: ResourceCache<Path, MaterialSource> = new ResourceCache(
        path => path.getLiteral(),
        MaterialSource.create
    );

    public static async create(path: Path): Promise<MaterialSource> {
        const content = await path.read();
        return new MaterialSource(JSON.parse(content));
    }

    public static async load(path: Path): Promise<MaterialSource> {
        return this.cache.get(path);
    }

    constructor(
        private data: MaterialShape
    ) {
    }

    public getData(): MaterialShape {
        return this.data;
    }
}