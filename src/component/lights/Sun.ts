import SkyRenderer from "../renderer/SkyRenderer.ts";
import Color from "../../primitives/Color.ts";
import GlobalIllumination from "./GlobalIllumination.ts";
import LightDescription from "./LightDescription.ts";



export default class Sun extends GlobalIllumination {
    public awake() {
        super.awake();
        this.intensity = 5;
    }

    public updateLight(sky: SkyRenderer) {
        this.color = Color.fromVec3(sky.getSunLight().diffuse);
        this.transform.setPosition(
            sky.getSunPosition()
        );
    }

    public getDescription(): LightDescription {
        const description = super.getDescription();
        description.direction = glm.vec3(description.direction) ['*'] (-1);
        return description;
    }
}