import InputEditor from "./InputEditor.ts";
import { EditorFactory } from "./Editor.ts";
import MathLib from "../utils/MathLib.ts";
import { is } from "../../lib/jsml/jsml.ts";



export type NumberEditorProps = {
    min?: number,
    max?: number,
    step?: number,
};

export default class NumberEditor extends InputEditor<number> {
    public static custom(props: NumberEditorProps): EditorFactory<any> {
        return (...args) => {
            const editor = new NumberEditor(...args);

            if (is(props.step)) {
                editor.setStrength(props.step);
            }

            editor.min = props.min ?? Number.NEGATIVE_INFINITY;
            editor.max = props.max ?? Number.POSITIVE_INFINITY;
            return editor;
        }
    }

    protected min: number = Number.NEGATIVE_INFINITY;
    protected max: number = Number.POSITIVE_INFINITY;

    protected getType(): string {
        return "number";
    }

    protected parseValue(value: string): number {
        return MathLib.clamp(Number(value), this.min, this.max);
    }
}