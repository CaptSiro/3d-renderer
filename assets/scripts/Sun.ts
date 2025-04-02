import { is } from "../../lib/jsml/jsml.ts";
import Component from "../../src/component/Component.ts";
import SkyRenderer from "../../src/component/renderer/SkyRenderer.ts";



export default class Sun extends Component {
    public update() {
        const camera = this.scene.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        const sky = camera.gameObject.getComponent(SkyRenderer);
        if (!is(sky)) {
            return;
        }

        this.transform.setPosition(
            sky.getSunPosition()
        );
    }
}