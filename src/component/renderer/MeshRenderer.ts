import Component from "../Component.ts";
import { Opt } from "../../../lib/types.ts";
import Shader from "../../resource/shader/Shader.ts";
import Mesh from "../../resource/mesh/Mesh.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import MeshSource from "../../resource/mesh/MeshSource.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import Renderer from "./Renderer.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import BoundingBoxRenderer from "./BoundingBoxRenderer.ts";
import SkyRenderer from "./SkyRenderer.ts";
import State from "../../object/State.ts";
import Path from "../../resource/Path.ts";
import RenderingContext from "../../primitives/RenderingContext.ts";
import { LIGHT_UBO_BINDING } from "../../webgl.ts";



export default class MeshRenderer extends Component implements Renderer {
    private _shader: Opt<Shader>;
    private _meshes: Opt<Mesh[]>;
    private _boundingBox: Opt<BoundingBox>;
    private _boundingBoxRenderer: Opt<BoundingBoxRenderer>;
    private _timestamp: number = 0;



    // Renderer
    public draw(context: RenderingContext): void {
        if (!is(this._shader) || !is(this._meshes)) {
            return;
        }

        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        const usePbr = this.scene.getSettings().defaultShader === "pbr";

        if (this._shader.bind() || this._timestamp !== this.scene.getTime().getSystemTimestamp()) {
            this.setSceneLight();
        }

        const model = context.parentMatrix ["*"] (this.transform.getMatrix());
        this._shader.setMat4("Model", model);
        this._shader.setMat4("MVP", camera.vp ['*'] (model));

        for (const mesh of this._meshes) {
            mesh.bind();
            if (usePbr) {
                this._shader.setMaterialPbr('material', mesh.getMaterial());
            } else {
                this._shader.setMaterialPhong('material', mesh.getMaterial());
            }
            mesh.draw();
        }

        if (!State.isBoundingBoxRenderingEnabled || !is(this._boundingBox) || !is(this._boundingBoxRenderer)) {
            return;
        }

        this._boundingBoxRenderer.draw(context);
    }

    public setSceneLight() {
        this._timestamp = this.scene.getTime().getSystemTimestamp();
        if (!is(this._shader)) {
            return;
        }

        this.scene.bindLights(this._shader, "Lights", LIGHT_UBO_BINDING);

        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        this._shader.setVec3("ViewPosition", camera.position);

        const sky = camera.gameObject.getComponent(SkyRenderer);
        if (!is(sky)) {
            this._shader.setVec3("light.position", glm.vec3(0, 2, 0));
            this._shader.setVec3("light.ambient", glm.vec3(0.3, 0.3, 0.35));
            this._shader.setVec3("light.diffuse", glm.vec3(1.0, 1.0, 0.9));
            this._shader.setVec3("light.specular", glm.vec3(1.0, 1.0, 1.0));
            return;
        }

        this._shader.setVec3("light.position", sky.getSunPosition());

        const light = sky.getSunLight();
        this._shader.setVec3("light.ambient", light.ambient);
        this._shader.setVec3("light.diffuse", light.diffuse);
        this._shader.setVec3("light.specular", light.specular);
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

        const shader = Shader.load(shaderSource);
        // shader.setUniformBlockBinding('Lights', 1);

        this._meshes = meshes;
        this._shader = shader;
        this._boundingBox = boundingBox;
        this._boundingBoxRenderer = this.gameObject.addComponent(BoundingBoxRenderer);
        await this._boundingBoxRenderer.init(this._boundingBox);
    }

    public async initFromModelFile(path: Path): Promise<void> {
        const meshSources = await MeshSource.load(path);
        if (!is(meshSources)) {
            console.error('Mesh file not found ' + path.getLiteral());
            return;
        }

        const shaderSource = await this.scene.getSettings().getDefaultShader();

        await this.init(meshSources, shaderSource);
    }
}