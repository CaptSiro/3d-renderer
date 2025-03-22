import Component from "../component/Component.ts";
import Mathf from "../primitives/Mathf.ts";
import { Quaternion } from "../primitives/Quaternion.ts";
import { deltaTime, keyboard, viewport } from "../main.ts";
import { float, Vec3 } from "../types.ts";
import Vector3 from "../primitives/Vector3.ts";



export default class Movement extends Component {
    public speed: float = 2;
    public sensitivity: float = 0.05;

    public yaw: float = 0;
    public pitch: float = 15;



    public awake() {
        this.transform.setRotation(
            Quaternion.eulerDegrees(this.pitch, this.yaw, 0)
        );

        viewport.addEventListener("pointermove", event => {
            if (document.pointerLockElement !== viewport) {
                return;
            }

            const offsetX = -event.movementX * this.sensitivity;
            const offsetY = event.movementY * this.sensitivity;

            this.yaw += offsetX;
            this.pitch += offsetY;

            this.pitch = Mathf.clamp(this.pitch, -90, 90);

            this.transform.setRotation(
                Quaternion.euler(glm.radians(this.pitch), glm.radians(this.yaw), 0)
            );
        });
    }

    private getForward(): Vec3 {
        const forward = this.transform.getForward();
        if (forward.x <= 0.001 && forward.z <= 0.001) {
            const up = this.transform.getUp();
            return glm.normalize(glm.vec3(up.x, 0, up.z));
        }

        return glm.normalize(glm.vec3(forward.x, 0, forward.z));
    }

    public update() {
        const speed = this.speed * deltaTime;
        const forward = this.getForward();
        const up = Vector3.UP;

        if (keyboard["w"]?.held) {
            this.transform.setPosition(
                this.transform.getPosition() ["+"] (forward ["*"] (speed))
            );
        }

        if (keyboard["s"]?.held) {
            this.transform.setPosition(
                this.transform.getPosition() ["-"] (forward ["*"] (speed))
            );
        }

        if (keyboard["a"]?.held) {
            this.transform.setPosition(
                this.transform.getPosition() ["-"] (glm.normalize(glm.cross(forward, Vector3.UP)) ["*"] (speed))
            );
        }

        if (keyboard["d"]?.held) {
            this.transform.setPosition(
                this.transform.getPosition() ["+"] (glm.normalize(glm.cross(forward, Vector3.UP)) ["*"] (speed))
            );
        }

        if (keyboard[" "]?.held) {
            this.transform.setPosition(
                this.transform.getPosition() ["+"] (up ["*"] (speed))
            );
        }

        if (keyboard["shift"]?.held) {
            this.transform.setPosition(
                this.transform.getPosition() ["-"] (up ["*"] (speed))
            );
        }
    }
}