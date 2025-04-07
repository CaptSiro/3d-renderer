import { Opt } from "../../lib/types";
import { _, is } from "../../lib/jsml/jsml.ts";



export default class Path {
    public static from(path: string) {
        return new Path(path);
    }

    private static ltrim(string: string): string {
        for (let i = 0; i < string.length; i++) {
            if (string[i] === '/' || string[i] === '\\') {
                continue;
            }

            return string.substring(i);
        }

        return '';
    }

    private static rtrim(string: string): string {
        for (let i = string.length - 1; i >= 0; i++) {
            if (string[i] === '/' || string[i] === '\\') {
                continue;
            }

            return string.substring(0, i + 1);
        }

        return '';
    }

    public static join(...segments: string[]): Opt<Path> {
        segments = segments.filter(x => x !== '');
        if (segments.length === 0) {
            return null;
        }

        let length = segments.length;
        if (length === 1) {
            return Path.from(segments[0]);
        }

        const start = segments.shift() as string;
        const end = segments.pop() as string;
        length -= 2;

        if (length === 0) {
            return Path.from(Path.rtrim(start) + '/' + Path.ltrim(end));
        }

        for (let i = 0; i < length; i++) {
            segments[i] = Path.ltrim(Path.rtrim(segments[i]));
        }

        return Path.from(
            Path.rtrim(start)
                + '/' + segments.join('/')
                + '/' + Path.ltrim(end)
        );
    }



    private readonly directory: Opt<string>;

    constructor(
        private literal: string,
        private readonly extension: Opt<string> = undefined
    ) {
        const parts = this.literal.split('.');
        if (parts.length >= 2 && !is(this.extension)) {
            this.extension = parts[parts.length - 1];
        }

        const segments = this.literal.split('/');
        if (segments.length >= 2) {
            this.directory = segments
                .slice(0, segments.length - 1)
                .join('/');
        }
    }



    public getExtension(): Opt<string> {
        return this.extension;
    }

    public getDirectory(): Opt<string> {
        return this.directory;
    }

    public getLiteral(): string {
        return this.literal;
    }

    public async read(): Promise<Opt<string>> {
        const response = await fetch(this.literal);
        if (!is(response.headers.get('last-modified'))) {
            return _;
        }

        return await response.text();
    }
}