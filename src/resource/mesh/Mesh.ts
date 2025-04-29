import MeshSource from "./MeshSource.ts";
import { gl } from "../../main.ts";
import { FLOAT_SIZE } from "../../webgl.ts";
import Material from "../material/Material.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";



export default class Mesh {
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;
    private readonly ebo: WebGLBuffer | any;
    private readonly hasEbo: boolean;
    private readonly vertexCount: number;

    private material: Material;
    private readonly boundingBox: BoundingBox;
    private readonly name: string;



    constructor(
        source: MeshSource
    ) {
        this.name = source.getName();
        this.boundingBox = source.getBoundingBox();

        this.material = new Material(source.getMaterialSource());

        const data = source.getData();

        const vertexLayout = source.getVertexLayout();
        this.vertexCount = source.hasIndexes()
            ? source.getFaceCount() * 3
            : Math.floor(data.length / vertexLayout.getTotalFloats());

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.hasEbo = source.hasIndexes();
        if (source.hasIndexes()) {
            this.ebo = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, source.getIndexes(), gl.STATIC_DRAW);
        }

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        let offset = 0;
        const total = vertexLayout.getTotalFloats() * FLOAT_SIZE;

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

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }



    public bind(): void {
        gl.bindVertexArray(this.vao);
    }

    public draw(): void {
        if (this.hasEbo) {
            gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_INT, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
        }
    }

    public delete(): void {
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.vbo);

        this.material.delete();
    }

    public getMaterial(): Material {
        return this.material;
    }

    public getBoundingBox(): BoundingBox {
        return this.boundingBox;
    }

    public setMaterial(material: Material): void {
        this.material = material;
    }
}