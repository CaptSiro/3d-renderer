import Editor from "./Editor.ts";
import jsml, { is } from "../../lib/jsml/jsml.ts";
import { guid } from "../../lib/guid.ts";
import { Opt } from "../../lib/types.ts";



export default abstract class InputEditor<T> extends Editor<T> {
    protected getType(): string {
        return "text";
    }

    protected input: Opt<HTMLInputElement>;

    protected abstract parseValue(value: string): T;

    public update(): void {
        if (!is(this.input)) {
            return;
        }

        this.input.value = String(this.readValue());
    }

    public html(): HTMLElement {
        const id = guid(true);

        const input = jsml.input({
            type: this.getType(),
            id,
            value: this.value,
            onInput: () => this.saveValue(
                this.parseValue(input.value)
            )
        });
        this.input = input;

        const container = this.container([
            jsml.label({ for: id }, this.getLabel()),
            input
        ]);

        container.classList.add("type-" + this.getType());
        return container;
    }
}