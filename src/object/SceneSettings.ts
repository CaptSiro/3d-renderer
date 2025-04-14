import { editor, editorFactory } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";
import { is } from "../../lib/jsml/jsml.ts";
import Select from "../editor/Select.ts";



export default class SceneSettings {
    @editor(BooleanEditor)
    public doCameraSwitching: boolean = true;

    @editor(BooleanEditor)
    public doRenderSky: boolean = true;

    @editor(BooleanEditor)
    public doRenderGrid: boolean = true;

    @editorFactory(Select.enum(['phong', 'pbr']))
    public defaultShader: string = 'pbr';



    public async getDefaultShader(): Promise<ShaderSource> {
        const shader = await ShaderSource.loadShader(this.defaultShader);
        if (!is(shader)) {
            throw new Error("Default Shader not found");
        }

        return shader;
    }

    private _shaderListeners: (()=>void)[] = [];

    public addDefaultShaderListener(listener: ()=>void): void {
        this._shaderListeners.push(listener);
    }

    public onPropertyChange(property: string, oldValue: any, newValue: any): void {
        if (property !== "defaultShader") {
            return;
        }

        for (const shaderListener of this._shaderListeners) {
            shaderListener();
        }
    }
}