import MeshSource from "../MeshSource.ts";
import MeshFileParser from "./MeshFileParser.ts";
import { OBJFile } from "../../../../lib/OBJFile.ts";
import VertexLayout from "../VertexLayout.ts";
import MaterialSource from "../../material/MaterialSource.ts";



const VERTEX = 3;
const NORMAL = 3;
const TEXTURE_COORD = 2;
const vertexLayout = new VertexLayout(
    VERTEX,
    NORMAL,
    TEXTURE_COORD
);



export default class ObjParser implements MeshFileParser {
    async parse(content: string): Promise<MeshSource[]> {
        // @ts-ignore
        const file = new OBJFile(content, 'model');
        const description = file.parse();

        console.log(description);

        const material = await MaterialSource.load(MaterialSource.getDefaultMaterial());
        const models = [];

        for (const model of description.models) {
            const data = new Float32Array(3 * model.faces.length * vertexLayout.getTotal());
            let dataIndex = 0;

            for (const face of model.faces) {
                if (face.vertices.length !== 3) {
                    throw new Error("Object must have 3 vertexes per face. No more no less");
                }

                for (const vertex of face.vertices) {
                    const v = model.vertices[vertex.vertexIndex - 1];
                    data[dataIndex++] = v.x;
                    data[dataIndex++] = v.y;
                    data[dataIndex++] = v.z;

                    const n = model.vertexNormals[vertex.vertexNormalIndex - 1];
                    data[dataIndex++] = n.x;
                    data[dataIndex++] = n.y;
                    data[dataIndex++] = n.z;

                    const t = model.textureCoords[vertex.textureCoordsIndex - 1];
                    data[dataIndex++] = t.u;
                    data[dataIndex++] = t.v;
                }
            }

            models.push(new MeshSource(
                data,
                model.faces.length,
                vertexLayout,
                material
            ));
        }

        return models;
    }
}