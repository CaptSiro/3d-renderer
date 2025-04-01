import { float, Mat4, Quat, Vec3 } from "../types";
import { is } from "../../lib/jsml/jsml.ts";
import { Opt } from "../../lib/types";
import GameObject from "../object/GameObject.ts";
import Vector3 from "../utils/Vector3.ts";
import Matrix4 from "../utils/Matrix4.ts";



export default class Transform {
    private _matrix: Opt<Mat4>;
    private _inverseMatrix: Opt<Mat4>;
    
    private _parent: Opt<Transform>;
    private _children: Transform[];



    constructor(
        private position: Vec3 = glm.vec3(0, 0, 0),
        private rotation: Quat = glm.quat(glm.vec3(0, 0, 0)),
        private scale: Vec3 = glm.vec3(1, 1, 1)
    ) {
        this._matrix = undefined;
        this._children = [];
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
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
        return this;
    }

    public getRotation(): Quat {
        return this.rotation;
    }

    public setRotation(rotation: Quat): Transform {
        this.unsetMatrix();
        this.rotation.x = rotation.x;
        this.rotation.y = rotation.y;
        this.rotation.z = rotation.z;
        this.rotation.w = rotation.w;
        return this;
    }

    public getScale(): Vec3 {
        return this.scale;
    }

    public setScale(scale: Vec3): Transform {
        this.unsetMatrix();
        this.scale.x = scale.x;
        this.scale.y = scale.y;
        this.scale.z = scale.z;
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

        this._inverseMatrix = glm.inverse(this.getMatrix());
        return this._inverseMatrix;
    }

    public getForward(): Vec3 {
        return this.rotation ["*"] (Vector3.FORWARD);
    }

    public getLeft(): Vec3 {
        return this.rotation ["*"] (Vector3.LEFT);
    }

    public getUp(): Vec3 {
        return this.rotation ["*"] (Vector3.UP);
    }

    public rotate(axis: Vec3, angleRadians: float): void {
        // https://stackoverflow.com/a/66054048
        const norm = glm.normalize(axis);

        const w = glm.cos(angleRadians / 2);
        const v = glm.sin(angleRadians / 2);

        this.setRotation(glm.quat(w, norm ["*"] (v)));
    }

    public rotateDegrees(axis: Vec3, angleDegrees: float): void {
        this.rotate(axis, glm.radians(angleDegrees));
    }

    public getParentMatrix(): Mat4 {
        if (!is(this._parent)) {
            return Matrix4.IDENTITY;
        }

        return this._parent.getParentMatrix() ["*"] (this.getMatrix());
    }

    public getParent(): Opt<Transform> {
        return this._parent;
    }

    public addChildTransform(transform: Transform): void {
        this._children.push(transform);
        transform._parent = this;
    }

    public addChild(gameObject: GameObject): void {
        this.addChildTransform(gameObject.transform);
    }
}