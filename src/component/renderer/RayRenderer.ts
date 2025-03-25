import Component from "../Component.ts";
import Renderer from "./Renderer.ts";
import Ray from "../../primitives/Ray.ts";
import { gl } from "../../main.ts";
import type { Vec3 } from "../../types.ts";
import Shader from "../../resource/shader/Shader.ts";
import { Opt } from "../../../lib/types.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import Path from "../../resource/Path.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import { editor } from "../../editor/Editor.ts";
import Vec3Editor from "../../editor/Vec3Editor.ts";



export class RayRenderer extends Component implements Renderer {
    private ray: Ray = new Ray(
        glm.vec3(0, 0, 0),
        glm.vec3(0, 1, 0),
    );

    @editor(Vec3Editor)
    private color: Vec3 = glm.vec3(1, 1, 1);

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

        ShaderSource.load(
            Path.from("/shaders/ray.vert"),
            Path.from("/shaders/ray.frag"),
        ).then(source => {
            Shader.load(source).then(shader => {
                this._shader = shader;
            });
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
        if (is(this._vbo)) {
            gl.deleteBuffer(this._vbo);
        }

        if (is(this._vao)) {
            gl.deleteVertexArray(this._vao);
        }
    }

    // Renderer
    public draw(): void {
        if (!is(this._shader) || !is(this._vao)) {
            return;
        }

        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        this._shader.bind();

        this._shader.setMat4("MVP", camera.createMvp(this.transform.getMatrix()));
        this._shader.setVec3("Color", this.color);

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

    public setColor(color: Vec3): void {
        this.color = color;
    }
}