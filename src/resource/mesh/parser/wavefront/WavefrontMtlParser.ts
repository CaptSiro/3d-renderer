import Path from "../../../Path.ts";
import ParseContext from "./ParseContext.ts";
import { _, is } from "../../../../../lib/jsml/jsml.ts";
import Arrays from "../../../../utils/Arrays.ts";
import { Opt } from "../../../../../lib/types.ts";



export type Mtl = {
    name: string,
    path: string,
    [key: string]: number[] | string | number
};

export default class WavefrontMtlParser {
    public async parse(path: Path): Promise<Opt<Mtl[]>> {
        const content = await path.read();
        if (!is(content)) {
            return _;
        }
        
        const context = new ParseContext<Mtl>(() => ({
            name: '',
            path: path.getLiteral(),
        }));

        let index = 0;

        while (true) {
            const end = content.indexOf('\n', index + 1);
            let line = end === -1
                ? content.substring(index).trim()
                : content.substring(index, end).trim();

            if (!(line === '' || line[0] === '#')) {
                this.processLine(line, context);
            }

            if (end === -1) {
                break;
            }

            index = end;
        }

        context.save();
        return context.getCollection();
    }

    private processLine(line: string, context: ParseContext<Mtl>): void {
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

        if (command.startsWith("map_")) {
            context.set(command, segments[0]);
            return;
        }

        switch (command) {
            case 'Ka':
            case 'Kd':
            case 'Ks':
            case 'Ke':
            case 'Tf':
                context.set(command, Arrays.mutateMap(segments, parseFloat));
                break;
            case 'd':
            case 'Tr':
            case 'Ns':
            case 'Ni':
                context.set(command, parseFloat(segments[0] ?? 0));
                break;
            case 'newmtl':
                context.save();
                context.set("name", segments[0] ?? '')
                break;
            case 'illum':
                context.set("illum", Math.round(Number(segments[0] ?? 0)))
                break;
        }
    }
}