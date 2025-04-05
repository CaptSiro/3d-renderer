import Path from "../Path.ts";
import { float, Rgb } from "../../types";
import { Opt } from "../../../lib/types.ts";
import { assert, is } from "../../../lib/jsml/jsml.ts";
import { Mtl } from "../mesh/parser/wavefront/WavefrontMtlParser.ts";
import AsyncResourceCache from "../AsyncResourceCache.ts";



export type MaterialShape = {
    name: string;

    ambient: float[],
    diffuse: float[],
    specular: float[],
    shininess: float,

    map_ambient?: string,
    map_diffuse?: string,
    map_specular?: string,
    map_shininess?: string,
    map_bump?: string,
}

export default class MaterialSource {
    private static cache: AsyncResourceCache<Path, MaterialSource> = new AsyncResourceCache(
        path => path.getLiteral(),
        MaterialSource.create
    );

    public static async create(path: Path): Promise<MaterialSource> {
        const content = await path.read();
        const data = JSON.parse(content);
        data.name = path.getLiteral();
        return new MaterialSource(data);
    }

    public static async load(path: Path): Promise<MaterialSource> {
        return this.cache.get(path);
    }

    public static getDefaultMaterial(): Path {
        return Path.from("/assets/materials/plastic-white.json");
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
            name: description.path + '/' + description.name,
            ambient,
            diffuse: MaterialSource.rgbToFloatArray(description.Kd),
            specular: MaterialSource.rgbToFloatArray(description.Ks),
            shininess: (description.Ns ?? 250) / 1000
        });
    }

    private static setMap(shape: MaterialShape, property: keyof MaterialShape, directory: string, value: any): void {
        if (!is(value)) {
            return;
        }

        // @ts-ignore
        shape[property] = assert(Path.join(directory, value)).getLiteral();
    }

    public static fromMtlV2(description: Mtl): MaterialSource {
        const ambient = description.Ka as number[];
        const diffuse = description.Kd as number[];

        if (is(description.Ke)) {
            const emission = description.Ke as number[];

            ambient[0] += emission[0];
            ambient[1] += emission[1];
            ambient[2] += emission[2];

            ambient[0] *= diffuse[0];
            ambient[1] *= diffuse[1];
            ambient[2] *= diffuse[2];
        }

        const source: MaterialShape = {
            name: description.path + '/' + description.name,
            ambient,
            diffuse,
            specular: description.Ks as number[],
            shininess: ((description.Ns as Opt<number>) ?? 250) / 1000,
        };

        const directory = Path.from(description.path).getDirectory() ?? '/assets';

        MaterialSource.setMap(source, "map_ambient", directory, description.map_Ka);
        MaterialSource.setMap(source, "map_diffuse", directory, description.map_Kd);
        MaterialSource.setMap(source, "map_specular", directory, description.map_Ks);
        MaterialSource.setMap(source, "map_shininess", directory, description.map_Ns);
        MaterialSource.setMap(source, "map_bump", directory, description.map_bump);

        return new MaterialSource(source);
    }



    constructor(
        private data: MaterialShape
    ) {
    }



    public getData(): MaterialShape {
        return this.data;
    }
}