import GameObject from "../object/GameObject.ts";
import Transform from "./Transform.ts";
import Scene from "../object/Scene.ts";
import { editor } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";



export default class Component {
    private _gameObject: GameObject | any;

    @editor(BooleanEditor)
    private enable: boolean = true;



    constructor() {
    }



    public setEnable(enable: boolean): void {
        this.enable = enable;
    }

    public isEnabled(): boolean {
        return this.enable;
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