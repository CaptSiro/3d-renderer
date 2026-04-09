import Component from "../../src/component/Component";
import { is } from "../../lib/jsml/jsml.ts";



export default class FocusLocationHash extends Component {
    public start() {
        if (location.hash.length <= 1) {
            return;
        }

        const hash = location.hash.substring(1);
        if (hash === this.gameObject.getId()) {
            return;
        }

        const gameObject = this.scene.findGameObject(x => x.getId() === hash);
        // const gameObject = this.scene.findGameObject(x => {
        //     if (x.getId() === hash) {
        //         console.log('MATCH');
        //     }
        //
        //     return x.getId() === hash;
        // });
        console.log(gameObject?.transform);
        if (!is(gameObject)) {
            return;
        }

        this.transform.lookAtTransform(gameObject.transform);
    }
}