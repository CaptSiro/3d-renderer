import { float, int, Vec2, Vec3 } from "../../types";
import MaterialSource from "./MaterialSource.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import Texture from "../Texture.ts";
import { Opt } from "../../../lib/types.ts";



const MAP_AMBIENT_MASK = 1 << 0;
const MAP_DIFFUSE_MASK = 1 << 1;
const MAP_SPECULAR_MASK = 1 << 2;
const MAP_SHININESS_MASK = 1 << 3;
const MAP_BUMP_MASK = 1 << 4;

export default class Material {
    public readonly name: string;

    public ambient: Vec3;
    public diffuse: Vec3;
    public specular: Vec3;
    public textureOffset: Vec2;
    public shininess: float;
    public metallic: float;
    public readonly maps: int;

    public map_ambient: Opt<Texture>;
    public map_diffuse: Opt<Texture>;
    public map_specular: Opt<Texture>;
    public map_shininess: Opt<Texture>;
    public map_bump: Opt<Texture>;



    constructor(
        source: MaterialSource
    ) {
        const data = source.getData();
        this.name = data.name;

        this.ambient = glm.vec3(...data.ambient.slice(0, 3));
        this.diffuse = glm.vec3(...data.diffuse.slice(0, 3));
        this.specular = glm.vec3(...data.specular.slice(0, 3));
        this.textureOffset = glm.vec2(0, 0);
        this.shininess = data.shininess;
        this.metallic = data.metallic;

        this.maps = 0;

        if (is(data.map_ambient)) {
            this.maps |= MAP_AMBIENT_MASK;
            this.map_ambient = Texture.load(data.map_ambient);
        }

        if (is(data.map_diffuse)) {
            this.maps |= MAP_DIFFUSE_MASK;
            this.map_diffuse = Texture.load(data.map_diffuse);
        }

        if (is(data.map_specular)) {
            this.maps |= MAP_SPECULAR_MASK;
            this.map_specular = Texture.load(data.map_specular);
        }

        if (is(data.map_shininess)) {
            this.maps |= MAP_SHININESS_MASK;
            this.map_shininess = Texture.load(data.map_shininess);
        }

        if (is(data.map_bump)) {
            this.maps |= MAP_BUMP_MASK;
            this.map_bump = Texture.load(data.map_bump);
        }
    }



    public delete(): void {
        this.map_ambient?.delete();
        this.map_diffuse?.delete();
        this.map_specular?.delete();
        this.map_shininess?.delete();
        this.map_bump?.delete();
    }
}