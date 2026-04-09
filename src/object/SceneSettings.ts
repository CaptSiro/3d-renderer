import { editor, editorFactory } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";
import { is } from "../../lib/jsml/jsml.ts";
import Select from "../editor/Select.ts";
import NumberEditor from "../editor/NumberEditor.ts";
import { setAudioVolume } from "../../lib/audio.ts";
import MathLib from "../utils/MathLib.ts";



export default class SceneSettings {
    @editorFactory(NumberEditor.custom({ step: 0.01, min: 0, max: 1 }))
    public audioVolume: number = 1;

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
        switch (property) {
            case "audioVolume": {
                setAudioVolume(MathLib.clamp(this.audioVolume, 0, 1));
                break;
            }

            case "defaultShader": {
                for (const shaderListener of this._shaderListeners) {
                    shaderListener();
                }

                break;
            }
        }
    }
}