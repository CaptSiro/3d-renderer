import Component from "../Component.ts";
import { editor, editorFactory } from "../../editor/Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import type { float, int, Vec3 } from "../../types.ts";
import Select, { SelectOption } from "../../editor/Select.ts";
import Counter from "../../primitives/Counter.ts";
import SkyRenderer from "./SkyRenderer.ts";
import { FOG_LINEAR_END_OFFSET } from "../../webgl.ts";



const fogCounter = new Counter();

export const FOG_LINEAR = fogCounter.increment();
export const FOG_EXP = fogCounter.increment();
export const FOG_EXP2 = fogCounter.increment();

const fogFunctions: SelectOption<number>[] = [
    {
        label: 'Linear',
        value: FOG_LINEAR
    },
    {
        label: 'Exponential',
        value: FOG_EXP
    },
    {
        label: 'Exponential^2',
        value: FOG_EXP2
    }
];

export default class Fog extends Component {
    @editorFactory(Select.options(fogFunctions, x => Number(x)))
    private function: number = FOG_EXP2;

    @editor(NumberEditor)
    public density: float = 0.03;

    @editor(NumberEditor)
    private functionLinearEnd: int = 100;



    private _sky: SkyRenderer | any;

    public bindSkyRenderer(context: SkyRenderer): void {
        this._sky = context;
    }

    public getColor(factor: number = 0.75): Vec3 {
        const light = this._sky.getSunLight().diffuse;
        return light ['*'] (factor);
    }

    public getShaderFunction(): int {
        return (Math.round(this.functionLinearEnd) << FOG_LINEAR_END_OFFSET) | this.function;
    }

    public getFunction(): int {
        return this.function;
    }
}