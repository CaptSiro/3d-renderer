import Component from "../Component.ts";
import { Opt } from "../../../lib/types.ts";
import Shader from "../../resource/shader/Shader.ts";
import Mesh from "../../resource/mesh/Mesh.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import { mainScene } from "../../main.ts";
import MeshSource from "../../resource/mesh/MeshSource.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import Renderer from "./Renderer.ts";



export default class MeshRenderer extends Component implements Renderer {
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
        this.shader.setMat4("MVP", camera.createMvp(model));

        for (const mesh of this.meshes) {
            mesh.bindMaterials(this.shader, "materials");

            mesh.bind();
            mesh.draw();
        }
    }

    public delete() {
        if (!is(this.meshes)) {
            return;
        }

        for (const mesh of this.meshes) {
            mesh.delete();
        }
    }

    public async init(meshSources: MeshSource[], shaderSource: ShaderSource): Promise<void> {
        const meshes = meshSources.map(x => new Mesh(x));
        const shader = await Shader.load(shaderSource);

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

        this.meshes = meshes;
        this.shader = shader;
    }
}