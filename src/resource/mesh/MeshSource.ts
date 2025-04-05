import Path from "../Path.ts";
import MeshFileParser from "./parser/MeshFileParser.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import VertexLayout from "./VertexLayout.ts";
import MaterialSource from "../material/MaterialSource.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import ObjMesh from "./parser/wavefront/ObjMesh.ts";
import AsyncResourceCache from "../AsyncResourceCache.ts";



const parsers: Record<string, MeshFileParser> = {
    "obj": new ObjMesh()
};

export default class MeshSource {
    public static isMeshFile(file: Path): boolean {
        const extension = file.getExtension();
        if (!is(extension)) {
            return false;
        }

        return extension in parsers;
    }

    private static cache: AsyncResourceCache<Path, MeshSource[]> = new AsyncResourceCache(
        path => path.getLiteral(),
        MeshSource.create
    );

    public static async create(path: Path): Promise<MeshSource[]> {
        const extension = path.getExtension();

        if (!is(extension)) {
            throw new Error("Cannot infer type of the file without extension");
        }

        if (!(extension in parsers)) {
            throw new Error(`The file extension ${extension} is not supported`);
        }

        return await parsers[extension].parse(path, await path.read());
    }

    public static async load(path: Path): Promise<MeshSource[]> {
        return await MeshSource.cache.get(path);
    }



    private indexes: Uint32Array | any;

    constructor(
        private data: Float32Array,
        private faceCount: number,
        private vertexLayout: VertexLayout,
        private materialSource: MaterialSource,
        private boundingBox: BoundingBox,
        private name: string = ''
    ) {}



    public hasIndexes(): boolean {
        return is(this.indexes);
    }

    public setIndexes(indexes: Uint32Array): MeshSource {
        this.indexes = indexes;
        return this;
    }

    public getIndexes(): Uint32Array {
        return this.indexes;
    }

    public getName(): string {
        return this.name;
    }

    public getData(): Float32Array {
        return this.data;
    }

    public getFaceCount(): number {
        return this.faceCount;
    }

    public getVertexLayout(): VertexLayout {
        return this.vertexLayout;
    }

    public getMaterialSource(): MaterialSource {
        return this.materialSource;
    }

    public getBoundingBox(): BoundingBox {
        return this.boundingBox;
    }
}