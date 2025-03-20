import MeshSource from "../MeshSource.ts";
import MeshFileParser from "./MeshFileParser.ts";
import { OBJFile } from "../../../../lib/OBJFile.ts";
import VertexLayout from "../VertexLayout.ts";
import MaterialSource from "../../material/MaterialSource.ts";
import Path from "../../Path.ts";
import { is } from "../../../../lib/jsml/jsml.ts";
import { MTLFile } from "../../../../lib/MTLFile.ts";
import { int, Vec3 } from "../../../types.ts";
import { LAYOUT_INDEX, LAYOUT_NORMAL3, LAYOUT_TEX_COORD2, LAYOUT_VERTEX3, MAX_MATERIALS } from "../../../webgl.ts";
import BoundingBox from "../../../primitives/BoundingBox.ts";



const vertexLayout = new VertexLayout(
    LAYOUT_VERTEX3,
    LAYOUT_NORMAL3,
    LAYOUT_TEX_COORD2,
    LAYOUT_INDEX,
);



export default class ObjParser implements MeshFileParser {
    async parse(path: Path, content: string): Promise<MeshSource[]> {
        // @ts-ignore
        const file = new OBJFile(content, 'model');
        const description = file.parse();
        const directory = path.getDirectory() ?? "/models";

        const defaultMaterial = await MaterialSource.load(MaterialSource.getDefaultMaterial());
        const materialSources = new Map<string, MaterialSource>();
        const materialIndexes = new Map<string, int>;

        materialIndexes.set('', materialSources.size);
        materialSources.set('', defaultMaterial);

        for (const library of description.materialLibraries) {
            const mtl = await Path.join(directory, library)?.read();
            if (!is(mtl)) {
                continue;
            }

            for (const mat of new MTLFile(mtl).parse()) {
                if (materialSources.size >= MAX_MATERIALS) {
                    throw new Error("Object contains way to many materials");
                }

                materialIndexes.set(mat.name, materialSources.size);
                materialSources.set(mat.name, MaterialSource.fromMtl(mat));
            }
        }

        const models = [];

        for (const model of description.models) {
            const data = new Float32Array(3 * model.faces.length * vertexLayout.getTotal());
            let dataIndex = 0;

            const low: Vec3 = glm.vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            const high: Vec3 = glm.vec3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);

            for (const face of model.faces) {
                if (face.vertices.length !== 3) {
                    throw new Error("Object must have 3 vertexes per face. No more no less");
                }

                const materialIndex = materialIndexes.get(face.material) ?? 0;

                for (const vertex of face.vertices) {
                    const v = model.vertices[vertex.vertexIndex - 1];
                    data[dataIndex++] = v.x;
                    data[dataIndex++] = v.y;
                    data[dataIndex++] = v.z;

                    low.x = Math.min(low.x, v.x);
                    low.y = Math.min(low.y, v.y);
                    low.z = Math.min(low.z, v.z);

                    high.x = Math.max(high.x, v.x);
                    high.y = Math.max(high.y, v.y);
                    high.z = Math.max(high.z, v.z);

                    const n = model.vertexNormals[vertex.vertexNormalIndex - 1];
                    data[dataIndex++] = n.x;
                    data[dataIndex++] = n.y;
                    data[dataIndex++] = n.z;

                    const t = model.textureCoords[vertex.textureCoordsIndex - 1];
                    data[dataIndex++] = t.u;
                    data[dataIndex++] = t.v;

                    data[dataIndex++] = materialIndex;
                }
            }

            models.push(new MeshSource(
                data,
                model.faces.length,
                vertexLayout,
                materialSources,
                materialIndexes,
                new BoundingBox(low, high)
            ));
        }

        return models;
    }
}