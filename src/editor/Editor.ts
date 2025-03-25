import jsml, { _, Content, is } from "../../lib/jsml/jsml.ts";
import "reflect-metadata"
import { Opt } from "../../lib/types.ts";
import {
    EVENT_WINDOW_CLOSED,
    EVENT_WINDOW_MAXIMIZED,
    EVENT_WINDOW_MINIMIZED,
    EVENT_WINDOW_OPENED,
} from "../../lib/window.ts";
import Component from "../component/Component.ts";



export const editorSymbol = Symbol("editor");

export function editor<T extends typeof Editor<any>>(editorClass: T) {
    return Reflect.metadata(editorSymbol, editorClass);
}

export function getEditor(editorWindow: HTMLElement, target: any, property: string): Opt<Editor<unknown>> {
    const editorClass = Reflect.getMetadata(editorSymbol, target, property);
    if (editorClass === undefined) {
        return undefined;
    }

    return new editorClass(editorWindow, target, property, target[property]);
}



const EDITOR_UPDATE_INTERVAL = 500;

export default abstract class Editor<T> {
    protected id: Opt<number>;

    constructor(
        protected editorWindow: HTMLElement,
        protected target: unknown,
        protected name: string,
        protected value: T
    ) {
        this.editorWindow.addEventListener(EVENT_WINDOW_OPENED, this.startUpdate.bind(this));
        this.editorWindow.addEventListener(EVENT_WINDOW_MAXIMIZED, this.startUpdate.bind(this));
        this.editorWindow.addEventListener(EVENT_WINDOW_CLOSED, this.stopUpdate.bind(this));
        this.editorWindow.addEventListener(EVENT_WINDOW_MINIMIZED, this.stopUpdate.bind(this));
    }



    private startUpdate(): void {
        if (is(this.id)) {
            return;
        }

        this.id = setInterval(this.update.bind(this), EDITOR_UPDATE_INTERVAL);
    }

    public update(): void {}

    private stopUpdate(): void {
        if (!is(this.id)) {
            return;
        }

        clearInterval(this.id);
    }



    protected readValue(): T {
        return (this.target as any)[this.name];
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