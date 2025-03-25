import Editor from "./Editor.ts";
import { Vec3 } from "../types.ts";
import jsml, { _ } from "../../lib/jsml/jsml.ts";
import { guid } from "../../lib/guid.ts";
import InputEditor from "./InputEditor.ts";



export default class Vec3Editor extends Editor<Vec3> {
    protected x: HTMLInputElement | any;
    protected y: HTMLInputElement | any;
    protected z: HTMLInputElement | any;

    protected createCombo(label: string, input: HTMLInputElement): HTMLElement {
        const id = guid(true);
        input.id = id;

        const labelElement = jsml.label({
            for: id
        }, label);

        InputEditor.enableNumberScrolling(labelElement, input);

        return jsml.div(_, [
            labelElement,
            input
        ]);
    }

    public saveVector(): void {
        this.saveValue(glm.vec3(
            Number(this.x.value),
            Number(this.y.value),
            Number(this.z.value),
        ));
    }



    public update() {
        const v = this.readValue();
        this.x.value = String(v.x);
        this.y.value = String(v.y);
        this.z.value = String(v.z);
    }

    public html(): HTMLElement {
        this.x = jsml.input({
            type: "number",
            value: this.value.x,
            onInput: () => this.saveVector()
        });

        this.y = jsml.input({
            type: "number",
            value: this.value.y,
            onInput: () => this.saveVector()
        });

        this.z = jsml.input({
            type: "number",
            value: this.value.z,
            onInput: () => this.saveVector()
        });

        return this.container([
            jsml.span(_, this.getLabel()),
            jsml.div("vec3", [
                this.createCombo("X", this.x),
                this.createCombo("Y", this.y),
                this.createCombo("Z", this.z),
            ])
        ]);
    }
}