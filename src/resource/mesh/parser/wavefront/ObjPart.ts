import { is } from "../../../../../lib/jsml/jsml.ts";



export default class ObjPart {
    private readonly vertexToIndex: Map<string, number>;
    private readonly indexes: number[];



    public constructor() {
        this.vertexToIndex = new Map();
        this.indexes = [];
    }



    public lookupVertex(vertex: string): number {
        const index = this.vertexToIndex.get(vertex);
        if (is(index)) {
            return index;
        }

        const size = this.vertexToIndex.size;
        this.vertexToIndex.set(vertex, size);

        return size;
    }

    public addVertexIndex(index: number): void {
        this.indexes.push(index);
    }

    public getIndexes(): number[] {
        return this.indexes;
    }

    public getVertexToIndex(): Map<string, number> {
        return this.vertexToIndex;
    }
}