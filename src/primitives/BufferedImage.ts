import Color from "./Color.ts";
import jsml from "../../lib/jsml/jsml.ts";



export default class BufferedImage {
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private readonly _data: ImageData;



    public constructor(
        public readonly width: number,
        public readonly height: number
    ) {
        this._canvas = jsml.canvas({ width, height });
        this._context = this._canvas.getContext('2d')!;
        this._data = this._context.createImageData(width, height);
    }


    
    public setPixel(x: number, y: number, color: Color) {
        const index = (y * this.width + x) * 4;
        this._data.data[index] = color.r;
        this._data.data[index + 1] = color.g;
        this._data.data[index + 2] = color.b;
        this._data.data[index + 3] = color.a;
    }

    public toDataUrl(): string {
        this._context.putImageData(this._data, 0, 0);
        return this._canvas.toDataURL();
    }
}
