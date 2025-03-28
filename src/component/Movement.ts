import Component from "../component/Component.ts";
import Mathf from "../primitives/Mathf.ts";
import { Quaternion } from "../primitives/Quaternion.ts";
import { viewport } from "../main.ts";
import { editor } from "../editor/Editor.ts";
import NumberEditor from "../editor/NumberEditor.ts";
import type { float } from "../types.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import Keyboard from "../input/Keyboard.ts";



export default class Movement extends Component {
    @editor(NumberEditor)
    public speed: float = 5;

    @editor(NumberEditor)
    public sensitivity: float = 0.05;

    @editor(NumberEditor)
    public yaw: float = 0;

    @editor(NumberEditor)
    public pitch: float = 0;



    public awake() {
        this.transform.setRotation(
            Quaternion.eulerDegrees(this.pitch, this.yaw, 0)
        );

        viewport.addEventListener("pointermove", event => {
            if (!this.isEnabled() || document.pointerLockElement !== viewport) {
                return;
            }

            const offsetX = -event.movementX * this.sensitivity;
            const offsetY = event.movementY * this.sensitivity;

            this.yaw += offsetX;
            this.pitch += offsetY;

            this.pitch = Mathf.clamp(this.pitch, -89.5, 89.5);

            this.transform.setRotation(
                Quaternion.euler(glm.radians(this.pitch), glm.radians(this.yaw), 0)
            );
        });
    }

    public update() {
        const speed = this.speed * this.scene.getTime().getDeltaTime();
        const direction = Quaternion.eulerDegrees(0, this.yaw, 0) ["*"] (Keyboard.getMovementVector());
        this.transform.setPosition(
            this.transform.getPosition() ["+"] (direction ["*"] (speed))
        );
    }
}