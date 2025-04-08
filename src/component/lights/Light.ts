import Component from "../Component.ts";
import { editor } from "../../editor/Editor.ts";
import ColorEditor from "../../editor/ColorEditor.ts";
import Color from "../../primitives/Color.ts";
import type { float } from "../../types.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import LightDescription from "./LightDescription.ts";



export const LIGHT_TYPE_POINT = 0;

export default class Light extends Component {
    @editor(ColorEditor)
    public color: Color = Color.vec3(1, 1, 1);
    @editor(NumberEditor)
    public intensity: float = 1;



    public awake(): void {
        this.scene.addLight(this);
    }

    public destroy(): void {
        this.scene.deleteLight(this);
    }



    public getDescription(): LightDescription {
        return new LightDescription(
            LIGHT_TYPE_POINT,
            this.transform.getWorldPosition(),
            glm.vec3(0, 0, 0),
            this.color,
            this.intensity,
            0,
        );
    }
}