import jsml, { _, assert, Content, is } from "../../lib/jsml/jsml.ts";
import "reflect-metadata"
import { Opt } from "../../lib/types.ts";
import {
    EVENT_WINDOW_CLOSED,
    EVENT_WINDOW_MAXIMIZED,
    EVENT_WINDOW_MINIMIZED,
    EVENT_WINDOW_OPENED, ModalWindow,
} from "../../lib/window.ts";



export const editorSymbol = Symbol("editor");

export function editor<T extends typeof Editor<any>>(editorClass: T) {
    return Reflect.metadata(editorSymbol, (...args: any[]) => new (editorClass as any)(...args));
}

export type EditorFactory<T> = (
    editorWindow: HTMLElement,
    target: unknown,
    name: string,
    value: T
) => Editor<any>;

export function editorFactory(factory: EditorFactory<any>) {
    return Reflect.metadata(editorSymbol, factory);
}

export function getEditor(editorWindow: HTMLElement, target: any, property: string): Opt<Editor<unknown>> {
    const factory = Reflect.getMetadata(editorSymbol, target, property);
    if (factory === undefined) {
        return undefined;
    }

    return factory(editorWindow, target, property, target[property]);
}



const EDITOR_UPDATE_INTERVAL = 500;

export default abstract class Editor<T> {
    public static initWindow(w: ModalWindow, id: string): ModalWindow {
        w.id = id;

        w.addEventListener("keydown", event => event.stopPropagation());
        w.addEventListener("keyup", event => event.stopPropagation());
        w.addEventListener("keypress", event => event.stopPropagation());

        w.addEventListener("pointerdown", () => {
            const windows = Array.from(assert(w.parentElement).children) as HTMLElement[];

            if (w.style.zIndex === String(windows.length + 1)) {
                return;
            }

            windows.sort((a, b) => {
                return Number(a.style.zIndex) - Number(b.style.zIndex);
            });

            for (let i = 0; i < windows.length; i++) {
                windows[i].style.zIndex = String(i + 1);
            }

            w.style.zIndex = String(windows.length + 1);
        });

        return w;
    }

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
        const target = this.target as any;

        const old = target[this.name];
        target[this.name] = value;

        if (typeof target["onPropertyChange"] === "function") {
            target.onPropertyChange(this.name, old, value);
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