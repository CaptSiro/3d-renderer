import Transform from "../component/Transform.ts";
import Component from "../component/Component.ts";
import MeshRenderer from "../component/MeshRenderer.ts";
import Scene from "./Scene.ts";
import { Opt } from "../../lib/types";
import { is } from "../../lib/jsml/jsml.ts";



export default class GameObject {
    private isActive: boolean;
    private readonly components: Map<string, Component>;
    private readonly _transform: Transform;
    private renderer: Opt<MeshRenderer>;



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

    public addComponent<C extends Component, Constructor extends new () => C>(componentClass: Constructor): C {
        const component = new componentClass();
        if (component instanceof MeshRenderer) {
            this.renderer = component;
        }

        component.bind(this);
        this.components.set(componentClass.name, component);

        component.awake();
        return component;
    }

    public getComponent<C extends Component, Constructor extends new () => C>(componentClass: Constructor): Opt<C> {
        return this.components.get(componentClass.name) as Opt<C>;
    }
}