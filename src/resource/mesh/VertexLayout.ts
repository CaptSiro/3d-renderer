export default class VertexLayout {
    private total: number;

    constructor(
        private readonly vertexFloats: number,
        private readonly normalFloats: number,
        private readonly textureCoordFloats: number,
    ) {
        this.total = this.vertexFloats + this.normalFloats + this.textureCoordFloats;
    }

    public getVertexFloats(): number {
        return this.vertexFloats;
    }

    public getNormalFloats(): number {
        return this.vertexFloats;
    }

    public getTextureCoordFloats(): number {
        return this.vertexFloats;
    }

    public getTotal(): number {
        return this.total;
    }
}