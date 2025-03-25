import Editor from "./Editor.ts";
import jsml from "../../lib/jsml/jsml.ts";
import { guid } from "../../lib/guid.ts";



export default abstract class InputEditor<T> extends Editor<T> {
    protected getType(): string {
        return "text";
    }

    protected abstract parseValue(value: string): T;

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

        const container = this.container([
            jsml.label({ for: id }, this.getLabel()),
            input
        ]);

        container.classList.add("type-" + this.getType());
        return container;
    }
}