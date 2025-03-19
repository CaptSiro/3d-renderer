import MeshSource from "./MeshSource.ts";
import { gl } from "../../main.ts";
import { FLOAT_SIZE } from "../../webgl.ts";
import Material from "../material/Material.ts";
import { int } from "../../types.ts";
import Shader from "../shader/Shader.ts";



export default class Mesh {
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;
    private readonly vertexCount: number;

    private readonly materials: Map<string, Material>;
    private readonly matersialIndexes: Map<string, int>;



    constructor(
        source: MeshSource
    ) {
        this.materials = new Map<string, Material>();
        for (const [name, materialSource] of source.getMaterialSources()) {
            this.materials.set(name, new Material(materialSource));
        }

        this.matersialIndexes = source.getMaterialIndexes();

        const data = source.getData();

        const vertexLayout = source.getVertexLayout();
        this.vertexCount = Math.floor(data.length / vertexLayout.getTotal());

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        let offset = 0;
        const total = vertexLayout.getTotal() * FLOAT_SIZE;

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,
            vertexLayout.getVertexFloats(),
            gl.FLOAT,
            false,
            total,
            offset * FLOAT_SIZE
        );
        offset += vertexLayout.getVertexFloats();

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            vertexLayout.getNormalFloats(),
            gl.FLOAT,
            false,
            total,
            offset * FLOAT_SIZE
        );
        offset += vertexLayout.getNormalFloats();

        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            vertexLayout.getTextureCoordFloats(),
            gl.FLOAT,
            false,
            total,
            offset * FLOAT_SIZE
        );
        offset += vertexLayout.getTextureCoordFloats();

        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(
            3,
            vertexLayout.getMaterialIndexFloats(),
            gl.FLOAT,
            false,
            total,
            offset * FLOAT_SIZE
        );

        gl.bindVertexArray(null);
    }



    public bind(): void {
        gl.bindVertexArray(this.vao);
    }

    public draw(): void {
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
    }

    public delete(): void {
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.vbo);
    }

    public bindMaterials(shader: Shader, staticArray: string): void {
        for (const [name, material] of this.materials) {
            material.bind(shader, `${staticArray}[${this.matersialIndexes.get(name) ?? 0}]`);
        }
    }
}