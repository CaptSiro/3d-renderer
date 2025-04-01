import Path from "../../../Path.ts";
import ParseContext from "./ParseContext.ts";
import WavefrontMtlParser, { Mtl } from "./WavefrontMtlParser.ts";
import { is } from "../../../../../lib/jsml/jsml.ts";
import Arrays from "../../../../utils/Arrays.ts";



export type MaterialRange = {
    name: string,
    start: number,
    end: number,
};

export type Obj = {
    name: string,
    vertexToIndex: Map<string, number>,
    triangles: number[],
    materialRanges: ParseContext<MaterialRange>,
};

export default class WavefrontObjParser {
    private static mtlParser = new WavefrontMtlParser();

    private vertexes: number[][] = [];
    private normals: number[][] = [];
    private textureCoords: number[][] = [];
    private materials: Mtl[] = [];

    public async parse(path: Path, content: string) {
        this.vertexes = [];
        this.normals = [];
        this.textureCoords = [];
        this.materials = [];

        let index = 0;
        const context = new ParseContext<Obj>(() => ({
            name: '',
            vertexToIndex: new Map(),
            triangles: [],
            materialRanges: new ParseContext<MaterialRange>(() => ({
                name: '',
                start: 0,
                end: 0
            }))
        }));

        while (true) {
            const end = content.indexOf('\n', index + 1);
            const line = end === -1
                ? content.substring(index).trim()
                : content.substring(index, end).trim();

            if (!(line === '' || line[0] === '#')) {
                await this.processLine(line, context, path);
            }

            if (end === -1) {
                break;
            }

            index = end;
        }

        context.getCurrent().materialRanges.save();
        context.save();

        return {
            vertexes: this.vertexes,
            normals: this.normals,
            textureCoords: this.textureCoords,
            materials: this.materials,
            models: context.getCollection()
        }
    }

    private lookupVertex(model: Obj, vertex: string): number {
        const index = model.vertexToIndex.get(vertex);
        if (is(index)) {
            return index;
        }

        const size = model.vertexToIndex.size;
        model.vertexToIndex.set(vertex, size);

        return size;
    }

    private async processLine(line: string, context: ParseContext<Obj>, path: Path): Promise<void> {
        const hashtag = line.indexOf('#');
        if (hashtag !== -1) {
            line = line
                .substring(0, hashtag)
                .trim();
        }

        const segments = line.split(' ');
        const command = segments.shift();

        if (!is(command)) {
            return;
        }

        const model = context.getCurrent();
        switch (command) {
            case 'v':
                this.vertexes.push(Arrays.mutateMap(segments, parseFloat));
                break;
            case 'vn':
                this.normals.push(Arrays.mutateMap(segments, parseFloat));
                break;
            case 'vt':
                this.textureCoords.push(Arrays.mutateMap(segments, parseFloat));
                break;
            case 'f':
                context.markAsUpdated();
                const materialIndex = '/' + model.materialRanges.getCurrent().name;
                const v0 = this.lookupVertex(model, segments[0] + materialIndex);
                let end = model.materialRanges.getCurrent().end;

                for (let i = 0; i < segments.length - 2; i++) {
                    model.triangles.push(
                        v0,
                        this.lookupVertex(model, segments[i + 1] + materialIndex),
                        this.lookupVertex(model, segments[i + 2] + materialIndex)
                    );

                    end++;
                }

                model.materialRanges.set("end", end);
                break;
            case 'usemtl':
                const currentMaterial = model.materialRanges.getCurrent();
                if (currentMaterial.start !== currentMaterial.end) {
                    model.materialRanges.save();
                }

                model.materialRanges.set("name", segments[0] ?? '');
                model.materialRanges.set("start", currentMaterial.end);
                model.materialRanges.set("end", currentMaterial.end);
                break;
            case 'o':
                context.getCurrent().materialRanges.save();
                context.save();
                context.set("name", segments[0] ?? '');
                break;
            case 'mtllib':
                const mtl = Path.join(
                    path.getDirectory() ?? '/models',
                    segments[0] ?? ''
                );

                if (!is(mtl)) {
                    break;
                }

                this.materials = this.materials.concat(
                    await WavefrontObjParser.mtlParser.parse(mtl)
                );
                break;
        }
    }
}