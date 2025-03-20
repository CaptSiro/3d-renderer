import Transform from "../component/Transform.ts";
import Component from "../component/Component.ts";
import Scene from "./Scene.ts";
import { Opt } from "../../lib/types";
import { is } from "../../lib/jsml/jsml.ts";
import Renderer, { isRenderer } from "../component/renderer/Renderer.ts";



export default class GameObject {
    private isActive: boolean;
    private readonly components: Map<string, Component>;
    private readonly _transform: Transform;
    private renderer: Opt<Renderer>;



    constructor(
        private _name: string,
        private scene: Scene,
        transform: Opt<Transform> = undefined,
    ) {
        this.isActive = true;
        this.components = new Map<string, Component>();

        this._transform = is(transform)
            ? transform
            : new Transform();

        this.scene.addGameObject(this);
    }



    public update(): void {
        if (!this.isActive) {
            return;
        }

        for (const [_, component] of this.components) {
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

        for (const [_, component] of this.components) {
            component.delete();
        }

        this.scene.deleteGameObject(this);
    }



    public setActive(isActive: boolean): void {
        this.isActive = isActive;
    }

    public get transform(): Transform {
        return this._transform;
    }

    public getTransform(): Transform {
        return this._transform;
    }

    public get name(): string {
        return this._name;
    }

    public getName(): string {
        return this._name;
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
}