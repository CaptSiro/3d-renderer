import GameObject from "../object/GameObject.ts";
import Transform from "./Transform.ts";



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
        return (this._gameObject as GameObject).transform;
    }

    public awake(): void {}

    public update(): void {}
}