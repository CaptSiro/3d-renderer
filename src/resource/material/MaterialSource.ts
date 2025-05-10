import Path from "../Path.ts";
import { float } from "../../types";
import { Opt } from "../../../lib/types.ts";
import { _, assert, is } from "../../../lib/jsml/jsml.ts";
import { Mtl } from "../mesh/parser/wavefront/WavefrontMtlParser.ts";
import AsyncResourceCache from "../AsyncResourceCache.ts";



export type MaterialShape = {
    name: string;

    ambient: float[],
    diffuse: float[],
    specular: float[],
    shininess: float,
    metallic: float,

    map_ambient?: string,
    map_diffuse?: string,
    map_specular?: string,
    map_shininess?: string,
    map_bump?: string,

    textureWrap?: GLenum;
}

export default class MaterialSource {
    private static cache: AsyncResourceCache<Path, Opt<MaterialSource>> = new AsyncResourceCache(
        path => path.getLiteral(),
        MaterialSource.create
    );

    public static async create(path: Path): Promise<Opt<MaterialSource>> {
        const content = await path.read();
        if (!is(content)) {
            return _;
        }

        const data = JSON.parse(content);
        data.name = path.getLiteral();
        data.metallic = data.ambient.reduce((acc: number, x: number) => acc + x, 0) / data.ambient.length;

        return new MaterialSource(data);
    }

    public static async load(path: Path): Promise<Opt<MaterialSource>> {
        return MaterialSource.cache.get(path);
    }

    public static async loadImage(imageSource: string, base: Opt<MaterialSource> = undefined): Promise<Opt<MaterialSource>> {
        base ??= await MaterialSource.create(MaterialSource.getDefaultMaterial());
        if (!is(base)) {
            return;
        }

        base.data.name += imageSource;
        base.data.map_diffuse = imageSource;
        return base;
    }

    public static async loadImagePath(image: Path, base: Opt<MaterialSource> = undefined): Promise<Opt<MaterialSource>> {
        base ??= await MaterialSource.create(MaterialSource.getDefaultMaterial());
        if (!is(base)) {
            return;
        }

        base.data.map_diffuse = image.getLiteral();
        return base;
    }

    public static getDefaultMaterial(): Path {
        return Path.from("/assets/materials/plastic-white.json");
    }

    public static setMap(shape: MaterialShape, property: keyof MaterialShape, directory: string, value: any): void {
        if (!is(value)) {
            return;
        }

        // @ts-ignore
        shape[property] = assert(Path.join(directory, value)).getLiteral();
    }

    public static fromMtl(description: Mtl): MaterialSource {
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
            metallic: ambient[0],
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