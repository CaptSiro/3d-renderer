import Component from "../Component.ts";
import { Opt } from "../../../lib/types.ts";
import Shader from "../../resource/shader/Shader.ts";
import Transform from "../Transform.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import { gl } from "../../main.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import type { float } from "../../types.ts";
import { editor } from "../../editor/Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import Color from "../../primitives/Color.ts";
import ColorEditor from "../../editor/ColorEditor.ts";



export default class GridRenderer extends Component {
    private _target: Opt<Transform>;
    private _shader: Opt<Shader>;

    @editor(NumberEditor)
    public gridSize: float = 100;

    @editor(NumberEditor)
    public cellSize: float = 0.5;

    @editor(NumberEditor)
    public cellGap: float = 2;

    @editor(ColorEditor)
    public lineColorThick: Color = Color.vec3(0.5, 0.5, 0.5);

    @editor(ColorEditor)
    public lineColorThin: Color = Color.vec3(0.3, 0.3, 0.3);



    public render(): void {
        const camera = this.scene.getActiveCamera();
        if (!is(camera) || !is(this._shader) || !is(this._target)) {
            return;
        }

        gl.disable(gl.CULL_FACE);

        this._shader.bind();

        // Vertex
        this._shader.setMat4("VP", camera.vp);
        this._shader.setVec3("TargetPosition", this._target.getPosition());
        this._shader.setFloat("GridSize", this.gridSize);

        // Fragment
        this._shader.setFloat("CellSize", this.cellSize);
        this._shader.setFloat("CellGap", this.cellGap);
        this._shader.setVec3("LineColorThick", this.lineColorThick.vec3);
        this._shader.setVec3("LineColorThin", this.lineColorThin.vec3);
        this._shader.setVec3("CameraPosition", camera.position);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }

    public async init(target: Transform): Promise<void> {
        this._target = target;
        this._shader = await Shader.load(
            await ShaderSource.loadShader("grid")
        );
    }
}