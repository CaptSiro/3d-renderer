import Component from "./Component.ts";
import { float, Mat4, Vec3 } from "../types";
import { projectionMatrix } from "../main.ts";



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

    public createMVP(model: Mat4): Mat4 {
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
}