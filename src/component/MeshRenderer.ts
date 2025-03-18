import Mesh from "../resource/mesh/Mesh.ts";
import Shader from "../resource/shader/Shader.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";
import { mainScene } from "../main.ts";
import { Opt } from "../../lib/types";
import { is } from "../../lib/jsml/jsml.ts";
import Component from "./Component.ts";



export default class MeshRenderer extends Component {
    public static from(meshSources: MeshSource[], shaderSource: ShaderSource) {
        const meshes = meshSources.map(x => new Mesh(x));
        const shader = new Shader(shaderSource);

        shader.onBind(() => {
            const camera = mainScene.getMainCamera();
            if (!is(camera)) {
                return;
            }

            shader.setVec3("ViewPosition", camera.position);

            shader.setVec3("light.position", glm.vec3(0, 3, 0));
            shader.setVec3("light.ambient", glm.vec3(0.2, 0.2, 0.2));
            shader.setVec3("light.diffuse", glm.vec3(0.5, 0.5, 0.5));
            shader.setVec3("light.specular", glm.vec3(1.0, 1.0, 1.0));
        });

        const renderer = new MeshRenderer();
        renderer.meshes = meshes;
        renderer.shader = shader;

        return renderer;
    }

    private shader: Opt<Shader>;
    private meshes: Opt<Mesh[]>;

    public draw(): void {
        if (!is(this.shader) || !is(this.meshes)) {
            return;
        }

        const camera = mainScene.getMainCamera();
        if (!is(camera)) {
            return;
        }

        this.shader.bind();

        const model = this.gameObject.transform.getMatrix();
        this.shader.setMat4("Model", model);
        this.shader.setMat4("MVP", camera.createMVP(model));

        for (const mesh of this.meshes) {
            this.shader.setVec3("material.ambient", glm.vec3(0.0215, 0.1745, 0.0215));
            this.shader.setVec3("material.diffuse", glm.vec3(0.07568, 0.61424, 0.07568));
            this.shader.setVec3("material.specular", glm.vec3(0.633, 0.727811, 0.633));
            this.shader.setFloat("material.shininess", 0.6 * 128);

            mesh.bind();
            mesh.draw();
        }
    }
}