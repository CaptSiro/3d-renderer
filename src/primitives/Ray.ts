import { float, Vec3, Vec4 } from "../types.ts";
import VertexLayout from "../resource/mesh/VertexLayout.ts";
import { lineVertexLayout } from "../webgl.ts";
import Scene from "../object/Scene.ts";
import GameObject from "../object/GameObject.ts";
import { Opt } from "../../lib/types.ts";
import MeshRenderer from "../component/renderer/MeshRenderer.ts";
import { is } from "../../lib/jsml/jsml.ts";
import Vector4 from "./Vector4.ts";



export default class Ray {
    constructor(
        private start: Vec3,
        private direction: Vec3,
    ) {
    }

    public getStart(): Vec3 {
        return this.start;
    }

    public getEnd(): Vec4 {
        return this.start ["+"] (this.direction);
    }

    public setStart(start: Vec3): void {
        this.start = start;
    }

    public getDirection(): Vec3 {
        return this.direction;
    }

    public setDirection(direction: Vec3): void {
        this.direction = direction;
    }

    public getVertexLayout(): VertexLayout {
        return lineVertexLayout;
    }

    public getData(): Float32Array {
        const array = new Float32Array(lineVertexLayout.getTotalFloats() * 2);

        let i = 0;
        array[i++] = this.start.x;
        array[i++] = this.start.y;
        array[i++] = this.start.z;

        const end = this.getEnd();
        array[i++] = end.x;
        array[i++] = end.y;
        array[i++] = end.z;

        return array;
    }

    public cast(scene: Scene): Opt<GameObject> {
        let closest: Opt<GameObject>;
        let closestDistance: float = Number.POSITIVE_INFINITY;

        const start_w = Vector4.convertPoint3(this.start);
        const direction_w = Vector4.convertVector3(this.direction);

        for (const gameObject of scene.getGameObjects()) {
            const meshRenderer = gameObject.getComponent(MeshRenderer);
            if (!is(meshRenderer)) {
                continue;
            }

            const boundingBox = meshRenderer.getBoundingBox();
            if (!is(boundingBox)) {
                continue;
            }

            const low = boundingBox.getLow();
            const high = boundingBox.getHigh();

            const modelToWorld = gameObject.transform.getInverseMatrix();
            const o: Vec4 = modelToWorld ["*"] (start_w);
            const r: Vec4 = modelToWorld ["*"] (direction_w);

            const tLow = glm.vec3(
                (low.x - o.x) / r.x,
                (low.y - o.y) / r.y,
                (low.z - o.z) / r.z,
            );

            const tHigh = glm.vec3(
                (high.x - o.x) / r.x,
                (high.y - o.y) / r.y,
                (high.z - o.z) / r.z,
            );

            const close = Math.max(
                Math.min(tLow.x, tHigh.x),
                Math.min(tLow.y, tHigh.y),
                Math.min(tLow.z, tHigh.z),
            );

            const far = Math.min(
                Math.max(tLow.x, tHigh.x),
                Math.max(tLow.y, tHigh.y),
                Math.max(tLow.z, tHigh.z),
            );

            if (!(close <= far && close >= 0)) {
                continue;
            }

            if (closestDistance > close) {
                closest = gameObject;
                closestDistance = close;
            }
        }

        return closest;
    }

    public intersectSphere(S: Vec3, r: float) {
        const sphereToRayStart = this.start ["-"] (S);
        const b = 2.0 * glm.dot(sphereToRayStart, this.direction);
        const c = glm.dot(sphereToRayStart, sphereToRayStart) - r*r;
        const d = b*b - 4.0 * c;

        if (d < 0.0) {
            return {
                close: Number.MAX_VALUE,
                distance: 0
            };
        }

        const sqrtD = Math.sqrt(d);
        const close = Math.max(0.0, (-b - sqrtD) / 2.0);
        const far = (-b + sqrtD) / 2.0;

        if (far < 0.0) {
            return {
                close: Number.MAX_VALUE,
                distance: 0
            };
        }

        return {
            close,
            distance: far - close
        }
    }

    public intersectPlane(A: Vec3, n: Vec3) {
        const angle = glm.dot(this.direction, n);
        if (Math.abs(angle) < 0.0001) {
            return Number.MAX_VALUE;
        }

        const d = -glm.dot(A, n);
        return -(glm.dot(this.start, n) + d) / angle;
    }
}