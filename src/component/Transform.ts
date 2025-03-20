import { float, Mat4, Quat, Vec3 } from "../types";
import { is } from "../../lib/jsml/jsml.ts";
import { Opt } from "../../lib/types";
import Vector3 from "../primitives/Vector3.ts";



export default class Transform {
    private _matrix: Opt<Mat4>;
    private _inverseMatrix: Opt<Mat4>;



    constructor(
        private position: Vec3 = glm.vec3(0, 0, 0),
        private rotation: Quat = glm.quat(glm.vec3(0, 0, 0)),
        private scale: Vec3 = glm.vec3(1, 1, 1)
    ) {
        this._matrix = undefined;
    }



    private unsetMatrix(): void {
        this._matrix = undefined;
        this._inverseMatrix = undefined;
    }

    public getPosition(): Vec3 {
        return this.position;
    }

    public setPosition(position: Vec3): Transform {
        this.unsetMatrix();
        this.position = position;
        return this;
    }

    public getRotation(): Quat {
        return this.rotation;
    }

    public setRotation(rotation: Quat): Transform {
        this.unsetMatrix();
        this.rotation = rotation;
        return this;
    }

    public getScale(): Vec3 {
        return this.scale;
    }

    public setScale(scale: Vec3): Transform {
        this.unsetMatrix();
        this.scale = scale;
        return this;
    }

    public getMatrix(): Mat4 {
        if (is(this._matrix)) {
            return this._matrix;
        }

        this._matrix = glm.translate(this.position)
            ["*"] (glm.toMat4(this.rotation))
            ["*"] (glm.scale(this.scale));

        return this._matrix;
    }

    public getInverseMatrix(): Mat4 {
        if (is(this._inverseMatrix)) {
            return this._inverseMatrix;
        }

        this._inverseMatrix = glm.inverse(this._matrix);
        return this._inverseMatrix;
    }

    public getForward(): Vec3 {
        return this.rotation ["*"] (Vector3.FORWARD);
    }

    public getRight(): Vec3 {
        return this.rotation ["*"] (Vector3.RIGHT);
    }

    public getUp(): Vec3 {
        return this.rotation ["*"] (Vector3.UP);
    }

    public rotate(axis: Vec3, angleRadians: float): void {
        this.unsetMatrix();

        // https://stackoverflow.com/a/66054048
        const norm = glm.normalize(axis);

        const w = glm.cos(angleRadians / 2);
        const v = glm.sin(angleRadians / 2);

        this.rotation = glm.quat(w, norm ["*"] (v));
    }

    public rotateDegrees(axis: Vec3, angleDegrees: float): void {
        this.rotate(axis, glm.radians(angleDegrees));
    }
}