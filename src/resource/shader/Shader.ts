import ShaderSource from "./ShaderSource.ts";
import { gl } from "../../main.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import { Opt } from "../../../lib/types";
import { Mat4, Vec3 } from "../../types";
import ResourceCache from "../ResourceCache.ts";



export type ShaderCallback = (shader: Shader) => void;

export default class Shader {
    private static currentlyBound: Opt<Shader>;
    private static shaders: ResourceCache<ShaderSource, Shader> = new ResourceCache(
        source => source.getName(),
        Shader.create
    );

    public static create(source: ShaderSource): Shader {
        const vertex = Shader.compile(gl.VERTEX_SHADER, source.getVertexCode());
        if (!is(vertex)) {
            throw new Error("Shader compilation error");
        }

        const fragment = Shader.compile(gl.FRAGMENT_SHADER, source.getFragmentCode());
        if (!is(fragment)) {
            throw new Error("Shader compilation error");
        }

        const program = Shader.link(vertex, fragment);

        gl.deleteShader(fragment);
        gl.deleteShader(vertex);

        if (!is(program)) {
            throw new Error("Shader program compilation error");
        }

        return new Shader(program);
    }

    public static async load(source: ShaderSource): Promise<Shader> {
        return Shader.shaders.get(source);
    }

    public static getShaderTypeName(type: GLenum): string {
        switch (type) {
            case gl.VERTEX_SHADER:
                return "Vertex";
            case gl.FRAGMENT_SHADER:
                return "Fragment";
            default:
                return "Unknown";
        }
    }

    private static getCompilationStatus(shader: WebGLShader): boolean {
        const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
        const info = gl.getShaderInfoLog(shader);

        if (!is(info) || info.length === 0) {
            return true;
        }

        const typeName = this.getShaderTypeName(type);
        if (status === true) {
            console.warn(typeName + " compilation warning: " + info);
            return true;
        }

        console.error(typeName + " compilation error: " + info);
        return false;
    }

    private static compile(type: GLenum, code: string): Opt<WebGLShader> {
        const shader = gl.createShader(type);
        if (!is(shader)) {
            throw new Error("Could not create new GL shader");
        }

        gl.shaderSource(shader, code);
        gl.compileShader(shader);

        if (!Shader.getCompilationStatus(shader)) {
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    private static getLinkStatus(program: WebGLProgram): boolean {
        gl.validateProgram(program);

        const status = gl.getProgramParameter(program, gl.VALIDATE_STATUS);
        if (status == true) {
            return true;
        }

        console.error("Shader linking error: {}", gl.getProgramInfoLog(program) ?? "");
        return false;
    }

    private static link(vertex: WebGLShader, fragment: WebGLShader): Opt<WebGLProgram> {
        const program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);

        if (!this.getLinkStatus(program)) {
            gl.deleteProgram(program);
            return null;
        }

        return program;
    }



    private bindCallback: ShaderCallback;
    private unbindCallback: ShaderCallback;
    private uniforms: Map<string, WebGLUniformLocation | null>;

    constructor(
        private program: WebGLProgram,
    ) {
        this.uniforms = new Map<string, WebGLUniformLocation>();
        this.bindCallback = () => {};
        this.unbindCallback = () => {};
    }



    public onBind(fn: ShaderCallback): Shader {
        this.bindCallback = fn;
        return this;
    }

    public onUnbind(fn: ShaderCallback): Shader {
        this.unbindCallback = fn;
        return this;
    }

    public bind(): void {
        if (this === Shader.currentlyBound) {
            return;
        }

        if (is(Shader.currentlyBound)) {
            Shader.currentlyBound.unbindCallback(Shader.currentlyBound);
        }

        Shader.currentlyBound = this;
        gl.useProgram(this.program);

        this.bindCallback(this);

        setTimeout(() => {
            console.log(this.uniforms);
        }, 1000);
    }

    public getProgram(): WebGLProgram {
        return this.program;
    }


    public getUniformLocation(uniform: string): WebGLUniformLocation | null {
        const cached = this.uniforms.get(uniform);
        if (is(cached)) {
            return cached;
        }

        if (cached === null) {
            return null;
        }

        const location = gl.getUniformLocation(this.program, uniform);
        this.uniforms.set(uniform, location);
        return location;
    }

    public setFloat(uniform: string, float: GLfloat) {
        gl.uniform1f(this.getUniformLocation(uniform), float);
    }

    public setVec3(uniform: string, vector: Vec3) {
        gl.uniform3f(this.getUniformLocation(uniform), vector.x, vector.y, vector.z);
    }

    public setMat4(uniform: string, matrix: Mat4, transpose: boolean = false) {
        gl.uniformMatrix4fv(
            this.getUniformLocation(uniform),
            transpose,
            matrix.elements
        );
    }
}