import Transform from "../component/Transform.ts";
import Component from "../component/Component.ts";
import Scene from "./Scene.ts";
import { Opt } from "../../lib/types";
import jsml, { $, _, is } from "../../lib/jsml/jsml.ts";
import Renderer, { isRenderer } from "../component/renderer/Renderer.ts";
import { mainScene } from "../main.ts";
import { int, Predicate } from "../types.ts";
import Counter from "../primitives/Counter.ts";
import { ModalWindow, window_create } from "../../lib/window.ts";
import TransformEditor from "../editor/TransformEditor.ts";
import Editor, { getEditor } from "../editor/Editor.ts";
import RenderingContext from "../primitives/RenderingContext.ts";



export default class GameObject {
    private static readonly counter: Counter = new Counter();

    private readonly _id: int;
    private isActive: boolean;
    private readonly components: Map<string, Component>;
    private readonly _transform: Transform;
    private renderer: Opt<Renderer & Component>;
    private readonly _scene: Scene;



    constructor(
        private _name: string,
        transform: Opt<Transform> = undefined,
        scene: Opt<Scene> = undefined
    ) {
        this._id = GameObject.counter.increment();
        this.isActive = true;
        this.components = new Map<string, Component>();

        this._transform = is(transform)
            ? transform
            : new Transform();

        this._transform.bind(this);

        this._scene = scene ?? mainScene;
        this._scene.addGameObject(this);
    }



    public update(): void {
        if (!this.isActive) {
            return;
        }

        for (const component of this.components.values()) {
            if (component.isEnabled()) {
                component.update();
            }
        }
    }

    public fixedUpdate(): void {
        if (!this.isActive) {
            return;
        }

        for (const component of this.components.values()) {
            if (component.isEnabled()) {
                component.fixedUpdate();
            }
        }
    }

    public render(context: RenderingContext): void {
        if (!this.isActive || this === context.camera.gameObject) {
            return;
        }

        if (this.renderer?.isEnabled() === true) {
            this.renderer?.draw(context);
        }

        const children = this.transform.getChildren();
        if (children.length === 0) {
            return;
        }

        const nextContext = new RenderingContext(
            context.parentMatrix ["*"] (this.transform.getMatrix()),
            context.camera
        );

        for (const child of children) {
            child.gameObject?.render(nextContext);
        }
    }

    /**
     * Propagates the delete event to the components, and then it removes itself from bound scene. Deleted GameObject
     * shall not be used again
     */
    public delete(): void {
        this.setActive(false);

        for (const component of this.components.values()) {
            component.delete();
        }

        this.removeFromScene();
    }

    /**
     * Only removes the GameObject from bound scene. Afterward, it may be assigned to another scene
     */
    public removeFromScene(): void {
        this._scene.deleteGameObject(
            x => x._id === this._id
        );
    }



    public getId(): string {
        return this._name + '-' + this._id;
    }

    public setActive(isActive: boolean): void {
        this.isActive = isActive;
    }

    public get transform(): Transform {
        return this._transform;
    }

    public get name(): string {
        return this._name;
    }

    public getScene(): Scene {
        return this._scene;
    }

    public addComponent<T extends new () => Component>(componentClass: T): InstanceType<T> {
        const component = new componentClass();
        if (isRenderer(component)) {
            this.renderer = component;
        }

        component.bind(this);
        this.components.set(componentClass.name, component);

        component.awake();
        return component as InstanceType<T>;
    }

    public getComponent<T extends new () => Component>(componentClass: T): Opt<InstanceType<T>> {
        return this.components.get(componentClass.name) as Opt<InstanceType<T>>;
    }

    public hasComponent<T extends new () => Component>(componentClass: T): boolean {
        return this.components.has(componentClass.name);
    }

    public getComponents(): Map<string, Component> {
        return this.components;
    }

    public findComponent(predicate: Predicate<Component>): Opt<Component> {
        for (const component of this.components.values()) {
            if (predicate(component)) {
                return component;
            }
        }

        return null;
    }



    public getEditorWindow(): ModalWindow {
        const id = this.getId();
        const window = $<HTMLDivElement>("#" + id);
        if (is(window)) {
            return window;
        }

        const content = jsml.div("editor-content");
        const w = window_create(
            this.name,
            content,
            {
                isDraggable: true,
                isMinimizable: true,
                isResizable: true,
                width: "400px"
            }
        );

        content.append(
            new TransformEditor(w, this, "transform", this.transform)
                .html()
        );

        for (const [name, component] of this.components) {
            const componentContent = jsml.div("component-content");

            for (const key of Object.keys(component)) {
                const editor = getEditor(w, component, key);
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

        return Editor.initWindow(w, id);
    }
}