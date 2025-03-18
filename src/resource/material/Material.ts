import { float, Vec3 } from "../../types";
import MaterialSource from "./MaterialSource.ts";
import Shader from "../shader/Shader.ts";



export default class Material {
    private readonly ambient: Vec3;
    private readonly diffuse: Vec3;
    private readonly specular: Vec3;
    private readonly shininess: float;



    constructor(
        source: MaterialSource
    ) {
        this.ambient = glm.vec3(...source.getData().ambient.slice(0, 3))
        this.diffuse = glm.vec3(...source.getData().diffuse.slice(0, 3))
        this.specular = glm.vec3(...source.getData().specular.slice(0, 3))
        this.shininess = source.getData().shininess;
    }



    public bind(shader: Shader, variable: string): void {
        shader.setVec3(variable + ".ambient", this.ambient);
        shader.setVec3(variable + ".diffuse", this.diffuse);
        shader.setVec3(variable + ".specular", this.specular);
        shader.setFloat(variable + ".shininess", this.shininess);
    }
}