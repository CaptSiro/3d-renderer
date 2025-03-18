import MeshSource from "./MeshSource.ts";
import { gl } from "../../main.ts";
import { FLOAT_SIZE } from "../../webgl.ts";
import Material from "../material/Material.ts";



export default class Mesh {
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;
    private readonly vertexCount: number;
    private readonly material: Material;



    constructor(
        source: MeshSource
    ) {
        this.material = new Material(source.getMaterialSource());

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
            vertexLayout.getTotal() * FLOAT_SIZE,
            0
        );

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            vertexLayout.getNormalFloats(),
            gl.FLOAT,
            false,
            vertexLayout.getTotal() * FLOAT_SIZE,
            vertexLayout.getVertexFloats() * FLOAT_SIZE
        );

        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            vertexLayout.getTextureCoordFloats(),
            gl.FLOAT,
            false,
            vertexLayout.getTotal() * FLOAT_SIZE,
            (vertexLayout.getVertexFloats() + vertexLayout.getNormalFloats()) * FLOAT_SIZE
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

    public getMaterial(): Material {
        return this.material;
    }
}