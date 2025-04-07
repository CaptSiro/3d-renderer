import { editor } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import StringEditor from "../editor/StringEditor.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";
import { Opt } from "../../lib/types.ts";
import { is } from "../../lib/jsml/jsml.ts";



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



    public async getDefaultShader(): Promise<ShaderSource> {
        const shader = await ShaderSource.loadShader(this.defaultShader);
        if (!is(shader)) {
            throw new Error("Default Shader not found");
        }

        return shader;
    }
}