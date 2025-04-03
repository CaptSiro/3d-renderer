import { editor } from "../editor/Editor.ts";
import NumberEditor from "../editor/NumberEditor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import Component from "./Component.ts";
import type { Vec3 } from "../types.ts";
import Vector3 from "../utils/Vector3.ts";
import Vec3Editor from "../editor/Vec3Editor.ts";
import Button from "../editor/Button.ts";



export default class RigidBody extends Component {
    @editor(BooleanEditor)
    public effectedByGravity: boolean = false;

    @editor(NumberEditor)
    public mass: number = 1;

    @editor(NumberEditor)
    public drag: number = 0.05;
    @editor(NumberEditor)
    public dragAngular: number = 0.05;

    private _velocity: Vec3 = Vector3.ZERO;
    private _velocityAngular: Vec3 = Vector3.ZERO;



    @editor(Vec3Editor)
    private velocity: Vec3 = Vector3.ZERO;
    @editor(Vec3Editor)
    private velocityAngular: Vec3 = Vector3.ZERO;

    private applyVelocity(): void {
        this._velocity ['+='] (this.velocity);
        this._velocityAngular ['+='] (this.velocityAngular);
    }

    @editor(Button)
    private _addVelocity = this.applyVelocity;



    public fixedUpdate() {
        const deltaTime = this.scene.getTime().getFixedDeltaTime();
        const position = this.transform.getPosition();

        this.transform.setPosition(
            position ['+'] (this._velocity ['*'] (deltaTime))
        );

        this._velocity ['-='] (this._velocity ['*'] (this.drag));

        if (glm.dot(this._velocity, this._velocity) < 0.00001) {
            this._velocity = Vector3.ZERO;
        }

        const rotation = this.transform.getRotation();

        const quat = glm.quat(
            0,
            this._velocityAngular.x * deltaTime,
            this._velocityAngular.y * deltaTime,
            this._velocityAngular.z * deltaTime,
        );

        quat ['*='] (rotation);
        rotation.w += quat.w;
        rotation.x += quat.x;
        rotation.y += quat.y;
        rotation.z += quat.z;

        this.transform.setRotation(glm.normalize(rotation));
        this._velocityAngular ['-='] (this._velocityAngular ['*'] (this.dragAngular));

        if (glm.dot(this._velocityAngular, this._velocityAngular) < 0.00001) {
            this._velocityAngular = Vector3.ZERO;
        }
    }

    public addVelocity(velocity: Vec3): void {
        this._velocity ['+='] (velocity);
    }

    public addVelocityAngular(velocityAngular: Vec3): void {
        this._velocityAngular ['+='] (velocityAngular);
    }
}