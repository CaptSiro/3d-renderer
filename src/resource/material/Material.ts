import { float, glm, Vec3 } from "../../types";



export default class Material {
    private ambient: Vec3;
    private diffuse: Vec3;
    private specular: Vec3;
    private shininess: float;

    constructor(
        source: Material
    ) {
        this.ambient = glm.vec3(...source.ambient.slice(0, 3))
        this.diffuse = glm.vec3(...source.diffuse.slice(0, 3))
        this.specular = glm.vec3(...source.specular.slice(0, 3))
        this.shininess = source.shininess;
    }
}