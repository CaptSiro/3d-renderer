import { Vec2, Vec3 } from "../types.ts";
import { gl } from "../main.ts";
import { FLOAT_SIZE, quadVertexLayout } from "../webgl.ts";
import { Opt } from "../../lib/types.ts";



export const QUAD_TEXTURE_COORDS: Vec2[] = [
    glm.vec2(0, 0),
    glm.vec2(0, 1),
    glm.vec2(1, 0),
    glm.vec2(1, 1),
];

export default class Quad {
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;

    /**
     * @param vertexes Bottom-Left -> Top-Left -> Bottom-Right -> Top-Right
     * @param textureCoords
     */
    constructor(vertexes: Vec3[], textureCoords: Vec2[] = QUAD_TEXTURE_COORDS) {
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        const data = new Float32Array(4 * quadVertexLayout.getTotalFloats());
        let index = 0;

        for (let i = 0; i < vertexes.length; i++) {
            data[index++] = vertexes[i].x;
            data[index++] = vertexes[i].y;
            data[index++] = vertexes[i].z;

            data[index++] = textureCoords[i].x;
            data[index++] = textureCoords[i].y;
        }

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        let offset = 0;
        const total = quadVertexLayout.getTotalFloats() * FLOAT_SIZE;

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,
            quadVertexLayout.getVertexFloats(),
            gl.FLOAT,
            false,
            total,
            offset * FLOAT_SIZE
        );
        offset += quadVertexLayout.getVertexFloats();

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            quadVertexLayout.getTextureCoordFloats(),
            gl.FLOAT,
            false,
            total,
            offset * FLOAT_SIZE
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
}