import Path from "../Path.ts";
import { float, Rgb } from "../../types";
import ResourceCache from "../ResourceCache.ts";
import { Opt } from "../../../lib/types.ts";
import { is } from "../../../lib/jsml/jsml.ts";



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

    public static getDefaultMaterial(): Path {
        return Path.from("/materials/plastic-white.json");
    }

    private static rgbToFloatArray(rgb: Opt<Rgb>): float[] {
        if (!is(rgb)) {
            return [0, 0, 0];
        }

        return [
            rgb.red,
            rgb.green,
            rgb.blue
        ];
    }

    public static fromMtl(description: any): MaterialSource {
        const ambient = MaterialSource.rgbToFloatArray(description.Ka);

        if (is(description.Ke)) {
            ambient[0] += description.Ke.red;
            ambient[1] += description.Ke.green;
            ambient[2] += description.Ke.blue;
        }

        return new MaterialSource({
            ambient,
            diffuse: MaterialSource.rgbToFloatArray(description.Kd),
            specular: MaterialSource.rgbToFloatArray(description.Ks),
            shininess: (description.Ns ?? 250) / 1000
        });
    }



    constructor(
        private data: MaterialShape
    ) {
    }



    public getData(): MaterialShape {
        return this.data;
    }
}