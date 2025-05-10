import { gl } from "../main.ts";
import MathLib from "../utils/MathLib.ts";
import Shader from "./shader/Shader.ts";
import { int } from "../types.ts";
import ResourceCache from "./ResourceCache.ts";
import { Opt } from "../../lib/types.ts";
import { is } from "../../lib/jsml/jsml.ts";



const DEFAULT_TEXTURE = new Uint8Array([0, 0, 0, 0]);

export default class Texture {
    private static textures: ResourceCache<string, Texture> = new ResourceCache(
        x => x,
        Texture.create
    );

    public static create(url: string): Texture {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // load default texture so the gl texture is usable
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1, 1, 0, // width, height, border
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            DEFAULT_TEXTURE
        );

        const ret = new Texture(texture);
        const image = new Image();

        image.onerror = console.log;
        image.onload = () => {
            ret.markLoaded();

            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image,
            );

            if (MathLib.is2PowX(image.width) && MathLib.is2PowX(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
                return;
            }

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };

        image.src = url;
        return ret;
    }

    public static load(url: string): Texture {
        const texture = Texture.textures.get(url);
        texture.references++;
        return texture;
    }



    public static bind(texture: Opt<Texture>, shader: Shader, variable: string, textureUnit: int = 0): void {
        if (!is(texture) || !texture.loaded || texture.deleted) {
            gl.activeTexture(gl.TEXTURE0 + textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, null);
            shader.setInt(variable, 0);
            return;
        }

        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
        shader.setInt(variable, textureUnit);
    }



    private loaded: boolean;
    private deleted: boolean;
    private references: int = 0;

    private constructor(
        private readonly glTexture: WebGLTexture
    ) {
        this.loaded = false;
        this.deleted = false;
    }



    protected markLoaded(): void {
        this.loaded = true;
    }

    public delete(): void {
        this.references--;

        if (this.references > 0) {
            return;
        }

        if (this.deleted) {
            return;
        }

        gl.deleteTexture(this.glTexture);
        this.deleted = true;
    }
}