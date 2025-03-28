import Component from "./Component.ts";
import { Mat4, Vec2, Vec3 } from "../types";
import { projectionMatrix, viewport } from "../main.ts";
import Ray from "../primitives/Ray.ts";
import { Opt } from "../../lib/types.ts";
import GridRenderer from "./renderer/GridRenderer.ts";
import { is } from "../../lib/jsml/jsml.ts";
import SkyRenderer from "./renderer/SkyRenderer.ts";
import Counter from "../primitives/Counter.ts";
import Keyboard from "../input/Keyboard.ts";
import State from "../object/State.ts";
import MeshRenderer from "./renderer/MeshRenderer.ts";
import Path from "../resource/Path.ts";



export default class Camera extends Component {
    private static keyCounter: Counter = new Counter(1);



    private _gridRenderer: Opt<GridRenderer>;
    private _skyRenderer: Opt<SkyRenderer>;

    private _view: Mat4 = undefined;
    private _vp: Mat4 = undefined



    public awake(): void {
        this.updateView();
        this.assignKey();

        this._skyRenderer = this.gameObject.addComponent(SkyRenderer);
        this._skyRenderer.init(this.transform).then();

        this._gridRenderer = this.gameObject.addComponent(GridRenderer);
        this._gridRenderer.init(this.transform).then();

        if (!this.gameObject.hasComponent(MeshRenderer)) {
            const meshRenderer = this.gameObject.addComponent(MeshRenderer);
            meshRenderer.initFromModelFile(Path.from("/models/camera.obj")).then();
        }
    }

    private assignKey(): void {
        if (Camera.keyCounter.peek() > 9) {
            return;
        }

        Keyboard.register({
            key: String(Camera.keyCounter.increment()),
            onPress: () => {
                if (State.doCameraSwitching) {
                    this.scene.setActiveCamera(this);
                }
            }
        });
    }

    public update(): void {
        this.updateView();
    }



    private preRenderSky(): void {
        if (!State.doRenderSky) {
            return;
        }

        if (!is(this._skyRenderer)) {
            return;
        }

        this._skyRenderer.render();
    }

    private preRenderGrid(): void {
        if (!State.doRenderGrid) {
            return;
        }

        if (!is(this._gridRenderer)) {
            return;
        }

        this._gridRenderer.render();
    }

    public preRender(): void {
        this.preRenderSky();
        this.preRenderGrid();
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