import GameObject from "../object/GameObject.ts";
import Transform from "./Transform.ts";
import Scene from "../object/Scene.ts";



export default class Component {
    private _gameObject: GameObject | any;

    constructor() {
    }



    public bind(context: GameObject): void {
        this._gameObject = context;
    }

    get gameObject(): GameObject {
        return this._gameObject;
    }

    get transform(): Transform {
        return this.gameObject.transform;
    }

    get scene(): Scene {
        return this.gameObject.getScene();
    }




    public awake(): void {}

    public update(): void {}

    public delete(): void {}

    public onPropertyChange(property: string, oldValue: any, newValue: any): void {}
}