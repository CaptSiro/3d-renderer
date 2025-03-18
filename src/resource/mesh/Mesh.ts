import MeshSource from "./MeshSource.ts";
import { gl } from "../../main.ts";
import { sizeof } from "../../webgl.ts";



export default class Mesh {
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;
    private readonly vertexCount: number;



    constructor(
        source: MeshSource
    ) {
        const data = source.getData();

        const vertexLayout = source.getVertexLayout();
        this.vertexCount = Math.floor(data.length / vertexLayout.getTotal());

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0,
            vertexLayout.getVertexFloats(),
            gl.FLOAT,
            false,
            vertexLayout.getTotal() * sizeof(gl.FLOAT),
            0
        );

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            vertexLayout.getNormalFloats(),
            gl.FLOAT,
            false,
            vertexLayout.getTotal() * sizeof(gl.FLOAT),
            vertexLayout.getVertexFloats() * sizeof(gl.FLOAT)
        );

        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            vertexLayout.getTextureCoordFloats(),
            gl.FLOAT,
            false,
            vertexLayout.getTotal() * sizeof(gl.FLOAT),
            (vertexLayout.getVertexFloats() + vertexLayout.getNormalFloats()) * sizeof(gl.FLOAT)
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
}