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



    /**
     * Executed when component is bound to game object
     */
    public awake(): void {}

    /**
     * Executed when scene is loaded
     */
    public start(): void {}

    /**
     * Executed every frame
     */
    public update(): void {}

    /**
     * Executed at fixed interval
     */
    public fixedUpdate(): void {}

    /**
     * Executed when game object is deleted from the scene
     */
    public delete(): void {}

    /**
     * Executed when property is changed via the editor window
     */
    public onPropertyChange(property: string, oldValue: any, newValue: any): void {}
}