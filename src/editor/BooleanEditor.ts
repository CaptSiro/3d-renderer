import { guid } from "../../lib/guid.ts";
import jsml from "../../lib/jsml/jsml.ts";
import Editor from "./Editor.ts";



export default class BooleanEditor extends Editor<boolean> {
    public html(): HTMLElement {
        const id = guid(true);

        const input = jsml.input({
            type: "checkbox",
            id,
            checked: this.value,
        });

        input.addEventListener(
            "input",
            () => this.saveValue(Boolean(input.checked))
        );

        const container = this.container([
            jsml.label({ for: id }, this.getLabel()),
            input
        ]);

        container.classList.add("type-checkbox");
        return container;
    }
}