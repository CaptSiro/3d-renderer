import { is } from "../../lib/jsml/jsml.ts";
import SkyRenderer from "../../src/component/renderer/SkyRenderer.ts";
import DirectionalLight from "../../src/component/lights/DirectionalLight.ts";
import LightDescription from "../../src/component/lights/LightDescription.ts";
import Color from "../../src/primitives/Color.ts";



export default class Sun extends DirectionalLight {
    public awake() {
        super.awake();
        this.intensity = 5;
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

        this.color = Color.fromVec3(sky.getSunLight().diffuse);

        this.transform.setPosition(
            sky.getSunPosition()
        );
    }

    public getDescription(): LightDescription {
        const description = super.getDescription();
        description.direction = this.transform.getPosition();
        return description;
    }
}