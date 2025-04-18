import Component from "../Component.ts";
import Renderer from "./Renderer.ts";
import Ray from "../../primitives/Ray.ts";
import { gl } from "../../main.ts";
import type { Vec3 } from "../../types.ts";
import Shader from "../../resource/shader/Shader.ts";
import { Opt } from "../../../lib/types.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import Color from "../../primitives/Color.ts";
import ColorEditor from "../../editor/ColorEditor.ts";
import { editor } from "../../editor/Editor.ts";
import RenderingContext from "../../primitives/RenderingContext.ts";
import { deleteBuffer, deleteVertexArray } from "../../webgl.ts";



export class RayRenderer extends Component implements Renderer {
    private ray: Ray = new Ray(
        glm.vec3(0, 0, 0),
        glm.vec3(0, 1, 0),
    );

    @editor(ColorEditor)
    private color: Color = Color.vec3(1, 1, 1);

    private _vao: Opt<WebGLVertexArrayObject>;
    private _vbo: Opt<WebGLBuffer>;
    private _shader: Opt<Shader>;



    // Component
    awake(): void {
        this._vao = gl.createVertexArray();
        gl.bindVertexArray(this._vao);

        this._vbo = gl.createBuffer();
        this.updateVbo();

        const layout = this.ray.getVertexLayout();

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,
            layout.getVertexFloats(),
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindVertexArray(null);

        ShaderSource.loadShader("ray").then(source => {
            if (!is(source)) {
                console.warn('Ray shader not found');
                return;
            }

            this._shader = Shader.load(source);
        });
    }

    private updateVbo(): void {
        if (!is(this._vbo)) {
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.ray.getData(), gl.DYNAMIC_DRAW);
    }

    public delete(): void {
        deleteBuffer(this._vbo);
        deleteVertexArray(this._vao);
    }

    // Renderer
    public draw(context: RenderingContext): void {
        if (!is(this._shader) || !is(this._vao)) {
            return;
        }

        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        this._shader.bind();

        const model = context.parentMatrix ["*"] (this.transform.getMatrix());
        this._shader.setMat4("MVP", camera.vp ["*"] (model));
        this._shader.setVec3("Color", this.color.vec3);

        gl.bindVertexArray(this._vao);
        gl.drawArrays(gl.LINES, 0, 2);
        gl.bindVertexArray(null);
    }

    getBoundingBox(): Opt<BoundingBox> {
        return undefined;
    }



    public setRay(start: Vec3, direction: Vec3): void {
        this.ray.setStart(start);
        this.ray.setDirection(direction);

        this.updateVbo();
    }

    public setColor(color: Color): void {
        this.color = color;
    }
}