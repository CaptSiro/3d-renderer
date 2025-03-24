import Transform from "../component/Transform.ts";
import Component from "../component/Component.ts";
import Scene from "./Scene.ts";
import { Opt } from "../../lib/types";
import { is } from "../../lib/jsml/jsml.ts";
import Renderer, { isRenderer } from "../component/renderer/Renderer.ts";
import { mainScene } from "../main.ts";
import { int, Predicate } from "../types.ts";
import Counter from "../primitives/Counter.ts";



export default class GameObject {
    private static readonly counter: Counter = new Counter();

    private readonly _id: int;
    private isActive: boolean;
    private readonly components: Map<string, Component>;
    private readonly _transform: Transform;
    private renderer: Opt<Renderer>;
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

        this._scene = scene ?? mainScene;
        this._scene.addGameObject(this);
    }



    public update(): void {
        if (!this.isActive) {
            return;
        }

        for (const component of this.components.values()) {
            component.update();
        }
    }

    public render(): void {
        if (!this.isActive) {
            return;
        }

        this.renderer?.draw();
    }

    public delete(): void {
        this.setActive(false);

        for (const component of this.components.values()) {
            component.delete();
        }

        this._scene.deleteGameObject(
            x => x._id === this._id
        );
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

    public findComponent(predicate: Predicate<Component>): Opt<Component> {
        for (const component of this.components.values()) {
            if (predicate(component)) {
                return component;
            }
        }

        return null;
    }
}