import DirectionalLight from "./DirectionalLight.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import SkyRenderer from "../renderer/SkyRenderer.ts";
import Color from "../../primitives/Color.ts";
import LightDescription from "./LightDescription.ts";



export default class GlobalIllumination extends DirectionalLight {
    public awake() {
        super.awake();
        this.intensity = 0.5;
    }

    public update() {
        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        const sky = camera.gameObject.getComponent(SkyRenderer);
        if (!is(sky)) {
            return;
        }

        this.updateLight(sky);
    }

    public updateLight(sky: SkyRenderer): void {
        this.color = Color.fromVec3(sky.getSunLight().ambient);
    }

    public getDescription(): LightDescription {
        const description = super.getDescription();
        description.direction = this.transform.getPosition();
        return description;
    }
}