import Component from "./Component.ts";
import type { float } from "../types.ts";
import { editor } from "../editor/Editor.ts";
import NumberEditor from "../editor/NumberEditor.ts";
import { is } from "../../lib/jsml/jsml.ts";
import MeshRenderer from "./renderer/MeshRenderer.ts";



export default class DebugLogger extends Component {
    @editor(NumberEditor)
    public timeout: float = 1000;
    private _id: any;



    public awake() {
        this._id = setTimeout(() => {
            this._id = undefined;
            console.log(this.gameObject);
            console.log(this.gameObject.getComponent(MeshRenderer))
        }, this.timeout);
    }

    public delete() {
        if (is(this._id)) {
            clearTimeout(this._id);
        }
    }
}