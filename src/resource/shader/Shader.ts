import ShaderSource from "./ShaderSource.ts";
import { gl } from "../../main.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import { Opt } from "../../../lib/types";
import { Mat4, Vec3 } from "../../types";
import Material from "../material/Material.ts";
import ResourceCache from "../ResourceCache.ts";
import Texture from "../Texture.ts";



export type ShaderCallback = (shader: Shader) => void;

export default class Shader {
    private static currentlyBound: Opt<Shader>;
    private static shaders: ResourceCache<ShaderSource, Shader> = new ResourceCache(
        source => source.getName(),
        Shader.create
    );

    private static create(source: ShaderSource): Shader {
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

    public static load(source: ShaderSource): Shader {
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

    private constructor(
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

    /**
     * @returns {boolean} Information whether the binding shader replaced another shader that was in use. Or in other
     * words, has been just bound
     */
    public bind(): boolean {
        if (this === Shader.currentlyBound) {
            return false;
        }

        if (is(Shader.currentlyBound)) {
            Shader.currentlyBound.unbindCallback(Shader.currentlyBound);
        }

        Shader.currentlyBound = this;
        gl.useProgram(this.program);

        this.bindCallback(this);
        return true;
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

    public setInt(uniform: string, int: GLint) {
        gl.uniform1i(this.getUniformLocation(uniform), int);
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

    private currentMaterial: Opt<string>;
    public setMaterial(uniform: string, material: Material) {
        if (this.currentMaterial === material.name) {
            return;
        }

        this.setVec3(uniform + ".ambient", material.ambient);
        this.setVec3(uniform + ".diffuse", material.diffuse);
        this.setVec3(uniform + ".specular", material.specular);
        this.setFloat(uniform + ".shininess", material.shininess);

        this.setInt(uniform + ".maps", material.maps);

        Texture.bind(material.map_ambient, this, uniform + "_ambient", 0);
        Texture.bind(material.map_diffuse, this, uniform + "_diffuse", 1);
        Texture.bind(material.map_specular, this, uniform + "_specular", 2);
        Texture.bind(material.map_shininess, this, uniform + "_shininess", 3);
        Texture.bind(material.map_bump, this, uniform + "_bump", 4);

        this.currentMaterial = material.name;
    }
}