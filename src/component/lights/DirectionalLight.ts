import Light from "./Light.ts";
import LightDescription from "./LightDescription.ts";



export const LIGHT_TYPE_DIRECTIONAL = 1;

export default class DirectionalLight extends Light {
    public getDescription(): LightDescription {
        const description =  super.getDescription();

        description.type = LIGHT_TYPE_DIRECTIONAL;
        description.direction = this.transform.getForward();

        return description;
    }
}