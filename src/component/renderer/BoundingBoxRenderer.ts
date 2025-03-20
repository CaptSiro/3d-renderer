import Component from "../Component.ts";
import { gl, mainScene } from "../../main.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import { Opt } from "../../../lib/types.ts";
import { deleteBuffer, deleteVertexArray, lineVertexLayout } from "../../webgl.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import Shader from "../../resource/shader/Shader.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import { Vec3 } from "../../types.ts";



const boundingBoxColor = glm.vec3(0.5, 1, 0.5);

export default class BoundingBoxRenderer extends Component {
    private _vao: Opt<WebGLVertexArrayObject>;
    private _vbo: Opt<WebGLBuffer>;
    private _ebo: Opt<WebGLBuffer>;
    private _shader: Opt<Shader>;

    public color: Vec3 = boundingBoxColor;



    // Component
    public delete() {
        deleteVertexArray(this._vao);
        deleteBuffer(this._vbo);
        deleteBuffer(this._ebo);
    }



    public draw() {
        if (!is(this._vao) || !is(this._vbo) || !is(this._ebo) || !is(this._shader)) {
            return;
        }

        const camera = mainScene.getMainCamera();
        if (!is(camera)) {
            return;
        }

        this._shader.bind();

        this._shader.setMat4("MVP", camera.createMvp(this.gameObject.transform.getMatrix()));
        this._shader.setVec3("Color", this.color);

        gl.bindVertexArray(this._vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ebo);

        gl.drawElements(gl.LINES, BoundingBox.LINE_COUNT, BoundingBox.getIndexType(), 0);

        gl.bindVertexArray(null);
    }

    public async init(boundingBox: BoundingBox) {
        this._vao = gl.createVertexArray();
        gl.bindVertexArray(this._vao);

        this._vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, boundingBox.getVertexes(), gl.STATIC_DRAW);

        this._ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, boundingBox.getVertexIndexes(), gl.STATIC_DRAW);

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

        const source = await ShaderSource.loadShader("ray");
        this._shader = await Shader.load(source);
    }
}