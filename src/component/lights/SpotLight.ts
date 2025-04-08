import Light from "./Light.ts";
import { editor } from "../../editor/Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import type { float } from "../../types.ts";
import LightDescription from "./LightDescription.ts";



export const LIGHT_TYPE_SPOT = 2;

export default class SpotLight extends Light {
    @editor(NumberEditor)
    public angleDegrees: float = 15;



    public getDescription(): LightDescription {
        const description =  super.getDescription();

        description.type = LIGHT_TYPE_SPOT;
        description.direction = this.transform.getForward();
        description.cosAngle = Math.cos(glm.radians(this.angleDegrees));

        return description;
    }
}