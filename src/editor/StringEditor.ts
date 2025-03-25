import InputEditor from "./InputEditor.ts";



export default class StringEditor extends InputEditor<string> {
    protected parseValue(value: string): string {
        return value;
    }
}