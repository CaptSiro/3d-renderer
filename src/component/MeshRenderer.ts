import Mesh from "../resource/mesh/Mesh.ts";
import Shader from "../resource/shader/Shader.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";
import { mainScene } from "../main.ts";
import { Opt } from "../../lib/types";
import { is } from "../../lib/jsml/jsml.ts";
import Component from "./Component.ts";



export default class MeshRenderer extends Component {
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
            mesh.bindMaterials(this.shader, "materials");

            mesh.bind();
            mesh.draw();
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