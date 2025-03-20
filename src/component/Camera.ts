import Component from "./Component.ts";
import { float, Mat4, Vec2, Vec3 } from "../types";
import { projectionMatrix, viewport } from "../main.ts";
import Ray from "../primitives/Ray.ts";



export default class Camera extends Component {
    public speed: float = 1;
    public sensitivity: float = 0.05;

    public view: Vec3 = undefined;



    public awake(): void {
        this.updateView();
    }

    public update(): void {
        this.updateView();
    }



    public get position(): Vec3 {
        return this.transform.getPosition();
    }

    public getPosition(): Vec3 {
        return this.transform.getPosition();
    }

    public createMvp(model: Mat4): Mat4 {
        return projectionMatrix ["*"] (this.view) ["*"] (model);
    }

    private updateView(): void {
        const transform = this.gameObject.transform;
        const forward = glm.normalize(transform.getForward());
        const up = glm.normalize(transform.getUp());

        this.view = glm.lookAt(
            transform.getPosition(),
            transform.getPosition() ["+"] (forward),
            up
        );
    }

    public screenPositionToWorldRay(position: Vec2): Ray {
        const clip = glm.vec4(
            (position.x / viewport.width) * 2 - 1,
            1 - (position.y / viewport.height) * 2,
            -1,
            1
        );

        const eye = glm.inverse(projectionMatrix) ["*"] (clip);
        eye.z = -1;
        eye.w = 0;

        const world = glm.normalize(glm.inverse(this.view) ["*"] (eye));
        return new Ray(
            glm.vec3(this.transform.getPosition()),
            glm.vec3(world)
        );
    }
}