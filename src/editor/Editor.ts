import jsml, { $, _, Content, is } from "../../lib/jsml/jsml.ts";
import "reflect-metadata"
import GameObject from "../object/GameObject.ts";
import { Opt } from "../../lib/types.ts";
import { window_create } from "../../lib/window.ts";
import Component from "../component/Component.ts";



export const editorSymbol = Symbol("editor");

export function editor<T extends typeof Editor<any>>(editorClass: T) {
    return Reflect.metadata(editorSymbol, editorClass);
}

export function getEditor(target: any, property: string): Opt<Editor<unknown>> {
    const editorClass = Reflect.getMetadata(editorSymbol, target, property);
    if (editorClass === undefined) {
        return undefined;
    }

    return new editorClass(target, property, target[property]);
}



export default abstract class Editor<T> {
    public static createWindow(gameObject: GameObject): HTMLDivElement {
        const id = gameObject.getId();
        const window = $<HTMLDivElement>("#" + id);
        if (is(window)) {
            return window;
        }

        const title = gameObject.name;
        const content = jsml.div("editor-content");

        for (const [name, component] of gameObject.getComponents()) {
            const componentContent = jsml.div("component-content");

            for (const key of Object.keys(component)) {
                const editor = getEditor(component, key);
                if (!is(editor)) {
                    continue;
                }

                componentContent.append(editor.html());
            }

            content.append(
                jsml.div("component", [
                    jsml.h3(_, name),
                    componentContent
                ])
            );
        }

        const w = window_create(
            title,
            content,
            {
                isDraggable: true,
                isMinimizable: true,
                isResizable: true
            }
        );

        w.id = id;
        w.addEventListener("keydown", event => event.stopPropagation());
        w.addEventListener("keyup", event => event.stopPropagation());
        w.addEventListener("keypress", event => event.stopPropagation());

        return w;
    }



    constructor(
        protected target: unknown,
        protected name: string,
        protected value: T
    ) {
    }



    protected saveValue(value: T): void {
        const old = (this.target as any)[this.name];
        (this.target as any)[this.name] = value;
        if (this.target instanceof Component) {
            this.target.onPropertyChange(this.name, old, value);
        }
    }

    protected getLabel(): string {
        const label = this.name.startsWith("_")
            ? this.name.substring(1)
            : this.name

        return label[0].toUpperCase() + label.substring(1);
    }

    protected container(content: Content): HTMLElement {
        return jsml.div(
            "editor-container",
            content
        );
    }

    public abstract html(): HTMLElement;
}