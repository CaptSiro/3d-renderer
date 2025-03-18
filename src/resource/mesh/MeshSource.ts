import Path from "../Path.ts";
import ObjParser from "./parser/ObjParser.ts";
import MeshFileParser from "./parser/MeshFileParser.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import VertexLayout from "./VertexLayout.ts";



const parsers: Record<string, MeshFileParser> = {
    "obj": new ObjParser()
};

export default class MeshSource {
    public static async load(path: Path): Promise<MeshSource[]> {
        const extension = path.getExtension();

        if (!is(extension)) {
            throw new Error("Cannot infer type of file without extension");
        }

        if (!(extension in parsers)) {
            throw new Error("Extension is not supported");
        }

        return parsers[extension].parse(await path.read());
    }



    constructor(
        private data: Float32Array,
        private faceCount: number,
        private vertexLayout: VertexLayout
    ) {}



    public getData(): Float32Array {
        return this.data;
    }

    public getFaceCount(): number {
        return this.faceCount;
    }

    public getVertexLayout(): VertexLayout {
        return this.vertexLayout;
    }
}