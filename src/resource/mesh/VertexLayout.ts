import { int } from "../../types.ts";



export default class VertexLayout {
    private readonly total: int;

    constructor(
        private readonly vertexFloats: int,
        private readonly normalFloats: int,
        private readonly textureCoordFloats: int,
        private readonly materialIndexFloats: int,
    ) {
        this.total = this.vertexFloats
            + this.normalFloats
            + this.textureCoordFloats
            + this.materialIndexFloats;
    }

    public getMaterialIndexFloats(): int {
        return this.materialIndexFloats;
    }

    public getVertexFloats(): int {
        return this.vertexFloats;
    }

    public getNormalFloats(): int {
        return this.normalFloats;
    }

    public getTextureCoordFloats(): int {
        return this.textureCoordFloats;
    }

    public getTotalFloats(): int {
        return this.total;
    }
}