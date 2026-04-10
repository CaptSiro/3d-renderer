import Component from "../../src/component/Component";
import { is } from "../../lib/jsml/jsml.ts";
import Vector3 from "../../src/utils/Vector3.ts";



export default class FocusLocationHash extends Component {
    public start() {
        window.addEventListener("hashchange", () => {
            if (!this.isEnabled() || !this.gameObject.isActive()) {
                return;
            }

            if (location.hash.length <= 1) {
                return;
            }

            const hash = location.hash.substring(1);
            if (hash === this.gameObject.getId()) {
                return;
            }

            const gameObject = this.scene.findGameObject(x => x.getId() === hash);
            if (!is(gameObject) || Vector3.equal(gameObject.transform.getWorldPosition(), Vector3.ZERO)) {
                return;
            }

            this.transform.lookAtGameObject(gameObject);
        });
    }
}