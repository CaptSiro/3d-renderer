import InputEditor from "./InputEditor.ts";



export default class NumberEditor extends InputEditor<number> {
    protected getType(): string {
        return "number";
    }

    protected parseValue(value: string): number {
        return Number(value);
    }
}