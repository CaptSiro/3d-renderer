import { Opt } from "../../../lib/types.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import RenderingContext from "../../primitives/RenderingContext.ts";
import Component from "../Component.ts";
import Renderer from "./Renderer.ts";
import Spline from "../Spline.ts";
import { gl } from "../../main.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import Shader from "../../resource/shader/Shader.ts";
import { deleteBuffer, deleteVertexArray, lineVertexLayout } from "../../webgl.ts";
import { editor } from "../../editor/Editor.ts";
import ColorEditor from "../../editor/ColorEditor.ts";
import Color from "../../primitives/Color.ts";
import BoundingBoxRenderer from "./BoundingBoxRenderer.ts";
import State from "../../object/State.ts";



export default class SplineRenderer extends Component implements Renderer {
    @editor(ColorEditor)
    public color: Color = Color.vec3(1, 1, 1);

    private _spline: Opt<Spline>;
    private _splineLength = -1;
    private _splineLines = 0;

    private _boundingBox: Opt<BoundingBox>;
    private _boundingBoxRenderer: Opt<BoundingBoxRenderer>;

    private _vao: Opt<WebGLVertexArrayObject>;
    private _vbo: Opt<WebGLBuffer>;
    private _shader: Opt<Shader>;

    
    
    public awake() {
        this._spline = this.gameObject.getComponent(Spline);

        if (!is(this._spline)) {
            throw new Error('No spline found on game object. Before adding SplineRenderer you must add Spline component');
        }

        this._boundingBoxRenderer = this.gameObject.addComponent(BoundingBoxRenderer);

        this._vao = gl.createVertexArray();
        gl.bindVertexArray(this._vao);

        this._vbo = gl.createBuffer();
        this.updateBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, lineVertexLayout.getVertexFloats(), gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);

        ShaderSource.loadShader("ray").then(source => {
            if (!is(source)) {
                console.warn('Ray shader not found');
                return;
            }

            this._shader = Shader.load(source);
        });
    }



    public updateBuffer() {
        if (!is(this._spline) || !is(this._vbo) || this._splineLength === this._spline.length) {
            return;
        }

        this._boundingBox = BoundingBox.initial();
        const buffer = this._spline.getBuffer(this._boundingBox);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        this._splineLength = this._spline.length;
        this._splineLines = buffer.length / lineVertexLayout.getTotalFloats();

        if (is(this._boundingBoxRenderer)) {
            this._boundingBoxRenderer.init(this._boundingBox);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public draw(context: RenderingContext): void {
        if (!is(this._vao) || !is(this._vbo) || !is(this._shader)) {
            return;
        }

        this.updateBuffer();

        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        this._shader.bind();

        const model = context.parentMatrix ["*"] (this.transform.getMatrix());
        this._shader.setMat4("MVP", camera.vp ["*"] (model));
        this._shader.setVec3("Color", this.color.vec3);

        gl.bindVertexArray(this._vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);

        gl.drawArrays(gl.LINE_STRIP, 0, this._splineLines);

        gl.bindVertexArray(null);

        if (!State.isBoundingBoxRenderingEnabled || !is(this._boundingBox) || !is(this._boundingBoxRenderer)) {
            return;
        }

        this._boundingBoxRenderer.draw(context);
    }

    public getBoundingBox(): Opt<BoundingBox> {
        return this._boundingBox;
    }

    public delete() {
        deleteVertexArray(this._vao);
        deleteBuffer(this._vbo);
    }
}