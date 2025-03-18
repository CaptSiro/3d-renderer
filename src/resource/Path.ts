import { Opt } from "../../lib/types";
import { is } from "../../lib/jsml/jsml.ts";



export default class Path {
    public static from(path: string) {
        return new Path(path);
    }



    constructor(
        private literal: string,
        private readonly extension: Opt<string> = undefined
    ) {
        const parts = this.literal.split('.');
        if (parts.length >= 2 && !is(this.extension)) {
            this.extension = parts[parts.length - 1];
        }
    }



    public getExtension(): Opt<string> {
        return this.extension;
    }

    public getLiteral(): string {
        return this.literal;
    }

    public async read(): Promise<string> {
        return await (await fetch(this.literal)).text();
    }
}