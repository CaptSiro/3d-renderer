import Path from "../../../Path.ts";
import MeshSource from "../../MeshSource.ts";
import MeshFileParser from "../MeshFileParser.ts";
import WavefrontObjParser from "./WavefrontObjParser.ts";
import MaterialSource from "../../../material/MaterialSource.ts";
import { meshVertexLayout } from "../../../../webgl.ts";
import BoundingBox from "../../../../primitives/BoundingBox.ts";
import { is } from "../../../../../lib/jsml/jsml.ts";



const zero = [0, 0, 0];

export default class ObjMesh implements MeshFileParser {
    async parse(path: Path, content: string): Promise<MeshSource[]> {
        const description = await new WavefrontObjParser().parse(path, content);
        const meshSources: MeshSource[] = [];

        const defaultMaterial = await MaterialSource.load(MaterialSource.getDefaultMaterial());
        if (!is(defaultMaterial)) {
            return [];
        }

        const materialSources = new Map<string, MaterialSource>();
        materialSources.set('', defaultMaterial);

        for (const material of description.materials) {
            materialSources.set(material.name, MaterialSource.fromMtl(material));
        }

        for (let m = 0; m < description.models.length; m++) {
            const model = description.models[m];

            for (const [materialName, part] of model.parts) {
                if (part.getIndexes().length === 0) {
                    continue;
                }

                const indexes = Uint32Array.from(part.getIndexes());
                const boundingBox = BoundingBox.initial();
                const vertexData = new Float32Array(part.getVertexToIndex().size * meshVertexLayout.getTotalFloats());

                for (const [vertex, index] of part.getVertexToIndex()) {
                    const components = vertex.split('/');

                    let i = index * meshVertexLayout.getTotalFloats();

                    // Vertex
                    const vertexIndex = Number(components[0]);
                    const v = vertexIndex > 0
                        ? description.vertexes[vertexIndex - 1]
                        : zero;

                    vertexData[i++] = v[0];
                    vertexData[i++] = v[1];
                    vertexData[i++] = v[2];

                    if (vertexIndex > 0) {
                        boundingBox.addVertex(v[0], v[1], v[2]);
                    }

                    // Normal
                    const normalIndex = Number(components[2]);
                    const n = normalIndex > 0
                        ? description.normals[normalIndex - 1]
                        : zero;

                    vertexData[i++] = n[0];
                    vertexData[i++] = n[1];
                    vertexData[i++] = n[2];

                    // Texture Coordinates
                    const textureCoordIndex = Number(components[1]);
                    const t = textureCoordIndex > 0
                        ? description.textureCoords[textureCoordIndex - 1]
                        : zero;

                    vertexData[i++] = t[0];
                    vertexData[i++] = t[1];
                }

                meshSources.push(
                    new MeshSource(
                        vertexData,
                        indexes.length / 3,
                        meshVertexLayout,
                        materialSources.get(materialName) ?? defaultMaterial,
                        boundingBox,
                        model.name
                    ).setIndexes(indexes)
                );
            }
        }

        return meshSources;
    }
}