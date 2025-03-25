import InputEditor from "./InputEditor.ts";
import Color from "../primitives/Color.ts";



export default class ColorEditor extends InputEditor<Color> {
    protected getType(): string {
        return "color";
    }

    protected parseValue(value: string): Color {
        return Color.fromHex(value);
    }
}