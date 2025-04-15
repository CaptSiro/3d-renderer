import Light from "./Light.ts";
import { editor } from "../../editor/Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import type { float } from "../../types.ts";
import LightDescription from "./LightDescription.ts";
import Vector4 from "../../utils/Vector4.ts";
import Vector3 from "../../utils/Vector3.ts";



export const LIGHT_TYPE_SPOT = 2;

export default class SpotLight extends Light {
    @editor(NumberEditor)
    public angle: float = 15;



    public getDescription(): LightDescription {
        const description =  super.getDescription();

        description.type = LIGHT_TYPE_SPOT;
        description.direction = glm.vec3(this.transform.getMatrix() ['*'] (Vector4.convertVector3(Vector3.FORWARD)));
        description.cosAngle = Math.cos(glm.radians(this.angle));

        return description;
    }
}