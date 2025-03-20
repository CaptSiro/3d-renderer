import Path from "../Path.ts";
import ObjParser from "./parser/ObjParser.ts";
import MeshFileParser from "./parser/MeshFileParser.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import VertexLayout from "./VertexLayout.ts";
import ResourceCache from "../ResourceCache.ts";
import MaterialSource from "../material/MaterialSource.ts";
import { int } from "../../types.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";



const parsers: Record<string, MeshFileParser> = {
    "obj": new ObjParser()
};

export default class MeshSource {
    private static cache: ResourceCache<Path, MeshSource[]> = new ResourceCache(
        path => path.getLiteral(),
        MeshSource.create
    );

    public static async create(path: Path): Promise<MeshSource[]> {
        const extension = path.getExtension();

        if (!is(extension)) {
            throw new Error("Cannot infer type of file without extension");
        }

        if (!(extension in parsers)) {
            throw new Error("Extension is not supported");
        }

        return await parsers[extension].parse(path, await path.read());
    }

    public static async load(path: Path): Promise<MeshSource[]> {
        return MeshSource.cache.get(path);
    }



    constructor(
        private data: Float32Array,
        private faceCount: number,
        private vertexLayout: VertexLayout,
        private materialSources: Map<string, MaterialSource>,
        private materialIndexes: Map<string, int>,
        private boundingBox: BoundingBox
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

    public getMaterialSources(): Map<string, MaterialSource> {
        return this.materialSources;
    }

    public getMaterialIndexes(): Map<string, int> {
        return this.materialIndexes;
    }

    public getBoundingBox(): BoundingBox {
        return this.boundingBox;
    }
}