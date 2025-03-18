import Transform from "../component/Transform.ts";
import Component from "../component/Component.ts";
import MeshRenderer from "../component/MeshRenderer.ts";
import Scene from "./Scene.ts";
import { Opt } from "../../lib/types";
import { is } from "../../lib/jsml/jsml.ts";



export default class GameObject {
    private components: Map<string, Component>;
    private hasRenderer: boolean;
    private readonly _transform: Transform;

    constructor(
        private _name: string,
        private scene: Scene,
        transform: Opt<Transform> = undefined,
    ) {
        this.components = new Map<string, Component>();
        this.hasRenderer = false;

        this._transform = is(transform)
            ? transform
            : new Transform();

        this.scene.addGameObject(this);
    }



    public update(): void {
        for (const [_, component] of this.components) {
            component.update();
        }
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

    public isRenderAble(): boolean {
        return this.hasRenderer
    }

    public addComponent<C extends Component, Constructor extends new () => C>(componentClass: Constructor): C {
        const component = new componentClass();
        if (component instanceof MeshRenderer) {
            this.hasRenderer = true;
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