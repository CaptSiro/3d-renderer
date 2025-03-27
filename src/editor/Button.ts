import Editor from "./Editor.ts";
import jsml, { _ } from "../../lib/jsml/jsml.ts";



export default class Button extends Editor<(event: MouseEvent) => void> {
    private readonly button: HTMLButtonElement;

    public constructor(
        editorWindow: HTMLElement,
        target: unknown,
        name: string,
        value: (event: MouseEvent) => void
    ) {
        super(editorWindow, target, name, value);
        this.button = jsml.button({
            class: "editor-button",
            onClick: value.bind(target),
        }, this.getLabel());
    }

    public html(): HTMLElement {
        return jsml.div(_, this.button);
    }
}