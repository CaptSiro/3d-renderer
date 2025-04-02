import { editor } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";



export default class SceneSettings {
    @editor(BooleanEditor)
    public doCameraSwitching: boolean = true;

    @editor(BooleanEditor)
    public doRenderSky: boolean = false;

    @editor(BooleanEditor)
    public doRenderGrid: boolean = true;
}