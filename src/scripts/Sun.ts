import Component from "../component/Component.ts";
import { mainScene, time } from "../main.ts";
import { is } from "../../lib/jsml/jsml.ts";
import SkyRenderer from "../component/renderer/SkyRenderer.ts";



export default class Sun extends Component {
    public update() {
        const camera = mainScene.getMainCamera();
        if (!is(camera)) {
            return;
        }

        const sky = camera.gameObject.getComponent(SkyRenderer);
        if (!is(sky)) {
            return;
        }

        this.transform.setPosition(sky.getSunPosition());
    }
}