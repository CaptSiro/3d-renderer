import Component from "./Component.ts";
import { editor } from "../editor/Editor.ts";
import { lineVertexLayout } from "../webgl.ts";
import NumberEditor from "../editor/NumberEditor.ts";
import type { float01, int, Vec3 } from "../types.ts";
import Arrays from "../utils/Arrays.ts";
import BoundingBox from "../primitives/BoundingBox.ts";
import { SplineSegment } from "./SplineSegment.ts";



export default class Spline extends Component {
    @editor(NumberEditor)
    private _sections: int = 10;

    private readonly _segments: SplineSegment[] = [];



    public addSegment(segment: SplineSegment): void {
        this._segments.push(segment);
    }

    public get segments(): SplineSegment[] {
        return this._segments;
    }

    public get sections(): int {
        return Math.round(this._sections);
    }

    public get length(): int {
        return this._segments.length * (this.sections + 1);
    }

    public getBuffer(boundingBox: BoundingBox = BoundingBox.initial()): Float32Array {
        const sections = this.sections;
        const buffer = new Float32Array(lineVertexLayout.getTotalFloats() * this._segments.length * (sections + 1));

        let index = 0;
        for (const segment of this._segments) {
            for (let i = 0; i <= sections; i++) {
                const p = segment.getPoint(i / sections);
                index = Arrays.writeVec3(buffer, index, p);
                boundingBox.add(p);
            }
        }

        return buffer;
    }

    public getPoint(t: float01): Vec3 {
        const section = 1 / this._segments.length;
        const index = Math.floor(t / section);
        const t0 = (t % section) / section;
        return this._segments[index].getPoint(t0) ['+'] (this.transform.getWorldPosition());
    }
}