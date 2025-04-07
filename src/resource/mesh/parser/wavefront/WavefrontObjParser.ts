import Path from "../../../Path.ts";
import ParseContext from "./ParseContext.ts";
import WavefrontMtlParser, { Mtl } from "./WavefrontMtlParser.ts";
import { is } from "../../../../../lib/jsml/jsml.ts";
import Arrays from "../../../../utils/Arrays.ts";
import ObjPart from "./ObjPart.ts";



export type Obj = {
    name: string,
    parts: Map<string, ObjPart>
};



export default class WavefrontObjParser {
    private static mtlParser = new WavefrontMtlParser();

    private vertexes: number[][] = [];
    private normals: number[][] = [];
    private textureCoords: number[][] = [];
    private materials: Mtl[] = [];

    private currentMaterial: string = '';



    public async parse(path: Path, content: string) {
        this.vertexes = [];
        this.normals = [];
        this.textureCoords = [];
        this.materials = [];

        let index = 0;
        const context = new ParseContext<Obj>(() => ({
            name: '',
            parts: new Map<string, ObjPart>()
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

        context.save();

        return {
            vertexes: this.vertexes,
            normals: this.normals,
            textureCoords: this.textureCoords,
            materials: this.materials,
            models: context.getCollection()
        }
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
                const part = model.parts.get(this.currentMaterial) ?? new ObjPart();
                const v0 = part.lookupVertex(segments[0]);

                for (let i = 0; i < segments.length - 2; i++) {
                    part.addVertexIndex(v0);
                    part.addVertexIndex(part.lookupVertex(segments[i + 1]));
                    part.addVertexIndex(part.lookupVertex(segments[i + 2]));
                }

                model.parts.set(this.currentMaterial, part);
                break;
            case 'usemtl':
                this.currentMaterial = segments[0] ?? '';
                break;
            case 'o':
                context.save();
                context.set("name", segments[0] ?? '', false);
                break;
            case 'mtllib':
                const mtl = Path.join(
                    path.getDirectory() ?? '/models',
                    segments[0] ?? ''
                );

                if (!is(mtl)) {
                    break;
                }

                const materials = await WavefrontObjParser.mtlParser.parse(mtl);
                if (!is(materials)) {
                    break;
                }

                this.materials = this.materials.concat(materials);
                break;
        }
    }
}