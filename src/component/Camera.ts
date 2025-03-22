import Component from "./Component.ts";
import { float, Mat4, Vec2, Vec3 } from "../types";
import { projectionMatrix, viewport } from "../main.ts";
import Ray from "../primitives/Ray.ts";
import { Opt } from "../../lib/types.ts";
import GridRenderer from "./renderer/GridRenderer.ts";
import { is } from "../../lib/jsml/jsml.ts";



export default class Camera extends Component {
    public speed: float = 2;
    public sensitivity: float = 0.05;

    public renderGrid: boolean = true;
    private _gridRenderer: Opt<GridRenderer>;

    private _view: Mat4 = undefined;
    private _vp: Mat4 = undefined



    public awake(): void {
        this.updateView();
    }

    public update(): void {
        this.updateView();
    }

    public preRender(): void {
        if (!this.renderGrid) {
            return;
        }

        if (!is(this._gridRenderer)) {
            this._gridRenderer = this.gameObject.addComponent(GridRenderer);
            this._gridRenderer.init(this.transform).then();
            return;
        }

        this._gridRenderer.render();
    }



    public get position(): Vec3 {
        return this.transform.getPosition();
    }

    public createMvp(model: Mat4): Mat4 {
        return this._vp ["*"] (model);
    }

    public get vp(): Mat4 {
        return this._vp;
    }

    private updateView(): void {
        const transform = this.gameObject.transform;
        const forward = glm.normalize(transform.getForward());
        const up = glm.normalize(transform.getUp());

        this._view = glm.lookAt(
            transform.getPosition(),
            transform.getPosition() ["+"] (forward),
            up
        );

        this._vp = projectionMatrix ["*"] (this._view);
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

        const world = glm.normalize(glm.inverse(this._view) ["*"] (eye));
        return new Ray(
            glm.vec3(this.transform.getPosition()),
            glm.vec3(world)
        );
    }
}