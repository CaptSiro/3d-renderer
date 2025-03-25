import { Vec3, Vec4 } from "../types.ts";



export default class Color {
    public static fromHex(hex: string): Color {
        if (hex.startsWith("#")) {
            hex = hex.substring(1);
        }

        if (hex.length === 6) {
            return new Color(
                parseInt(hex.substring(0, 2), 16),
                parseInt(hex.substring(2, 4), 16),
                parseInt(hex.substring(4, 6), 16),
            );
        }

        if (hex.length === 8) {
            // RGBA format: RRGGBBAA
            return new Color(
                parseInt(hex.substring(0, 2), 16),
                parseInt(hex.substring(2, 4), 16),
                parseInt(hex.substring(4, 6), 16),
                parseInt(hex.substring(6, 8), 16),
            );
        }

        throw new Error("Invalid hex format");
    }

    public static vec3(r: number, g: number, b: number): Color {
        return new Color(
            r * 255,
            g * 255,
            b * 255
        );
    }



    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number = 255
    ) {
    }

    public get red(): number {
        return this.r;
    }
    public set red(red: number) {
        this.r = red;
    }

    public get green(): number {
        return this.g;
    }
    public set green(green: number) {
        this.g = green;
    }

    public get blue(): number {
        return this.b;
    }
    public set blue(blue: number) {
        this.b = blue;
    }

    public get alpha(): number {
        return this.a;
    }
    public set alpha(alpha: number) {
        this.a = alpha;
    }

    public get vec3(): Vec3 {
        return glm.vec3(
            this.r / 255,
            this.g / 255,
            this.b / 255,
        );
    }

    public get vec4(): Vec4 {
        return glm.vec4(
            this.r / 255,
            this.g / 255,
            this.b / 255,
            this.a / 255,
        );
    }

    public asHex(includeAlpha: boolean = false): string {
        const r = Math.floor(this.r).toString(16).padStart(2, "0");
        const g = Math.floor(this.g).toString(16).padStart(2, "0");
        const b = Math.floor(this.b).toString(16).padStart(2, "0");
        const a = Math.floor(this.a).toString(16).padStart(2, "0");

        return "#" + r + g + b + (includeAlpha ? a : "");
    }

    public toString(): string {
        return this.asHex();
    }
}