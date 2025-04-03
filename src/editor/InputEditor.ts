import Editor from "./Editor.ts";
import jsml, { is } from "../../lib/jsml/jsml.ts";
import { guid } from "../../lib/guid.ts";
import { Opt } from "../../lib/types.ts";



export default abstract class InputEditor<T> extends Editor<T> {
    public static enableNumberScrolling(label: HTMLElement, input: HTMLInputElement, strength: number = 0.1): void {
        let isScrolling = false;

        label.addEventListener("pointerdown", async event => {
            isScrolling = true;
            label.setPointerCapture(event.pointerId);
        });

        label.addEventListener("pointerup", event => {
            isScrolling = false;
            label.releasePointerCapture(event.pointerId);
        });

        label.addEventListener("pointermove", event => {
            if (!isScrolling) {
                return;
            }

            input.value = String(Number(input.value) + event.movementX * strength);
            input.dispatchEvent(new Event("input"));
        });
    }



    protected getType(): string {
        return "text";
    }

    protected input: Opt<HTMLInputElement>;
    protected inputFocused: boolean = false;

    protected abstract parseValue(value: string): T;

    public update(): void {
        if (!is(this.input) || this.inputFocused) {
            return;
        }

        this.input.value = String(this.readValue());
    }

    public html(): HTMLElement {
        const id = guid(true);

        const input = jsml.input({
            type: this.getType(),
            id,
            value: String(this.value),
            onInput: () => this.saveValue(
                this.parseValue(input.value)
            ),
            onFocus: () => {
                this.inputFocused = true;
            },
            onBlur: () => {
                this.inputFocused = false;
            }
        });
        this.input = input;

        const label = jsml.label({ for: id }, this.getLabel());
        if (input.type === "number") {
            InputEditor.enableNumberScrolling(label, input);
        }

        const container = this.container([
            label,
            input
        ]);

        container.classList.add("type-" + this.getType());
        return container;
    }
}