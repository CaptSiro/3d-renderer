import Component from "../Component.ts";
import { Opt } from "../../../lib/types.ts";
import Shader from "../../resource/shader/Shader.ts";
import Mesh from "../../resource/mesh/Mesh.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import { keyboard } from "../../main.ts";
import MeshSource from "../../resource/mesh/MeshSource.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import Renderer from "./Renderer.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import BoundingBoxRenderer from "./BoundingBoxRenderer.ts";
import SkyRenderer from "./SkyRenderer.ts";



export default class MeshRenderer extends Component implements Renderer {
    private _shader: Opt<Shader>;
    private _meshes: Opt<Mesh[]>;
    private _boundingBox: Opt<BoundingBox>;
    private _boundingBoxRenderer: Opt<BoundingBoxRenderer>;



    // Renderer
    public draw(): void {
        if (!is(this._shader) || !is(this._meshes)) {
            return;
        }

        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        this._shader.bind();

        const model = this.gameObject.transform.getMatrix();
        this._shader.setMat4("Model", model);
        this._shader.setMat4("MVP", camera.createMvp(model));

        for (const mesh of this._meshes) {
            mesh.bindMaterials(this._shader, "materials");

            mesh.bind();
            mesh.draw();
        }

        if (!keyboard["f"]?.pressedToggle || !is(this._boundingBox) || !is(this._boundingBoxRenderer)) {
            return;
        }

        this._boundingBoxRenderer.draw();
    }

    public getBoundingBox(): Opt<BoundingBox> {
        return this._boundingBox;
    }

    // Component
    public delete() {
        if (!is(this._meshes)) {
            return;
        }

        for (const mesh of this._meshes) {
            mesh.delete();
        }
    }



    public async init(meshSources: MeshSource[], shaderSource: ShaderSource): Promise<void> {
        const meshes = meshSources.map(x => new Mesh(x));
        const boundingBox = BoundingBox.initial();

        for (const mesh of meshes) {
            boundingBox.merge(mesh.getBoundingBox());
        }

        const shader = await Shader.load(shaderSource);

        shader.onBind(() => {
            const camera = this.scene.getActiveCamera();
            if (!is(camera)) {
                return;
            }

            shader.setVec3("ViewPosition", camera.position);

            const sky = camera.gameObject.getComponent(SkyRenderer);
            if (!is(sky)) {
                shader.setVec3("light.position", glm.vec3(0, 2, 0));
                shader.setVec3("light.ambient", glm.vec3(0.3, 0.3, 0.35));
                shader.setVec3("light.diffuse", glm.vec3(1.0, 1.0, 0.9));
                shader.setVec3("light.specular", glm.vec3(1.0, 1.0, 1.0));
                return;
            }

            shader.setVec3("light.position", sky.getSunPosition());

            const light = sky.getSunLight();
            shader.setVec3("light.ambient", light.ambient);
            shader.setVec3("light.diffuse", light.diffuse);
            shader.setVec3("light.specular", light.specular);
        });

        this._meshes = meshes;
        this._shader = shader;
        this._boundingBox = boundingBox;
        this._boundingBoxRenderer = this.gameObject.addComponent(BoundingBoxRenderer);
        await this._boundingBoxRenderer.init(this._boundingBox);
    }
}