import { editor } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import StringEditor from "../editor/StringEditor.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";



export default class SceneSettings {
    @editor(BooleanEditor)
    public doCameraSwitching: boolean = true;

    @editor(BooleanEditor)
    public doRenderSky: boolean = false;

    @editor(BooleanEditor)
    public doRenderGrid: boolean = true;

    @editor(StringEditor)
    // public defaultShader: string = 'base';
    public defaultShader: string = 'pbr';



    public getDefaultShader(): Promise<ShaderSource> {
        return ShaderSource.loadShader(this.defaultShader);
    }
}