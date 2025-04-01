import Path from "../../../Path.ts";
import MeshSource from "../../MeshSource.ts";
import MeshFileParser from "../MeshFileParser.ts";
import WavefrontObjParser from "./WavefrontObjParser.ts";
import MaterialSource from "../../../material/MaterialSource.ts";
import { meshVertexLayout } from "../../../../webgl.ts";
import Arrays from "../../../../utils/Arrays.ts";
import { int } from "../../../../types.ts";
import BoundingBox from "../../../../primitives/BoundingBox.ts";



const parser = new WavefrontObjParser();
const zero = [0, 0, 0];

export default class ObjMesh implements MeshFileParser {
    async parse(path: Path, content: string): Promise<MeshSource[]> {
        const description = await parser.parse(path, content);
        const meshSources: MeshSource[] = new Array(description.models.length);

        const defaultMaterial = await MaterialSource.load(MaterialSource.getDefaultMaterial());
        const materialSources = new Map<string, MaterialSource>();
        const materialIndexes = new Map<string, int>();

        materialIndexes.set('', materialSources.size);
        materialSources.set('', defaultMaterial);

        for (const material of description.materials) {
            materialIndexes.set(material.name, materialSources.size);
            materialSources.set(material.name, MaterialSource.fromMtlV2(material));
        }

        for (let m = 0; m < description.models.length; m++) {
            const model = description.models[m];
            const boundingBox = BoundingBox.initial();

            const indexes = Uint32Array.from(model.triangles);
            const vertexData = new Float32Array(model.vertexToIndex.size * meshVertexLayout.getTotalFloats());

            for (const [vertex, index] of model.vertexToIndex) {
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

                // Material Index
                vertexData[i++] = materialIndexes.get(components[3] ?? '') ?? 0;
            }

            meshSources[m] = new MeshSource(
                vertexData,
                indexes.length / 3,
                meshVertexLayout,
                materialSources,
                materialIndexes,
                boundingBox
            ).setIndexes(indexes);
        }

        return meshSources;
    }
}