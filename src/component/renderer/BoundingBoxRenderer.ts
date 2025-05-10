import Component from "../Component.ts";
import { gl } from "../../main.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import { Opt } from "../../../lib/types.ts";
import { deleteBuffer, deleteVertexArray, lineVertexLayout } from "../../webgl.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import Shader from "../../resource/shader/Shader.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import Color from "../../primitives/Color.ts";
import { editor } from "../../editor/Editor.ts";
import ColorEditor from "../../editor/ColorEditor.ts";
import RenderingContext from "../../primitives/RenderingContext.ts";



const boundingBoxColor: Color = Color.vec3(0.5, 1, 0.5);

export default class BoundingBoxRenderer extends Component {
    private _vao: Opt<WebGLVertexArrayObject>;
    private _vbo: Opt<WebGLBuffer>;
    private _ebo: Opt<WebGLBuffer>;
    private _shader: Opt<Shader>;

    @editor(ColorEditor)
    public color: Color = boundingBoxColor;

    private _boundingBox: Opt<BoundingBox>;



    public awake() {
        this._vao = gl.createVertexArray();
        gl.bindVertexArray(this._vao);

        this._vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);

        this._ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ebo);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,
            lineVertexLayout.getVertexFloats(),
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindVertexArray(null);

        ShaderSource.loadShader("ray").then(source => {
            if (!is(source)) {
                console.warn("Ray shader not found thus ray rendering is disabled");
                return;
            }

            this._shader = Shader.load(source);
        });
    }

    public delete() {
        deleteVertexArray(this._vao);
        deleteBuffer(this._vbo);
        deleteBuffer(this._ebo);
    }



    public draw(context: RenderingContext) {
        if (!is(this._vao) || !is(this._vbo) || !is(this._ebo) || !is(this._shader)) {
            return;
        }

        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        this._shader.bind();

        const model = context.parentMatrix ["*"] (this.transform.getMatrix());
        this._shader.setMat4("MVP", camera.vp ['*'] (model));
        this._shader.setVec3("Color", this.color.vec3);

        gl.bindVertexArray(this._vao);
        gl.drawElements(gl.LINES, BoundingBox.LINE_COUNT, BoundingBox.getIndexType(), 0);
        gl.bindVertexArray(null);
    }

    public init(boundingBox: BoundingBox) {
        if (!is(this._vao) || !is(this._vbo) || !is(this._ebo)) {
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, boundingBox.getVertexes(), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, boundingBox.getVertexIndexes(), gl.STATIC_DRAW);

        this._boundingBox = boundingBox;
    }

    public get boundingBox(): Opt<BoundingBox> {
        return this._boundingBox;
    }
}