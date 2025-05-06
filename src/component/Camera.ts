import Component from "./Component.ts";
import { Mat4, Vec2, Vec3 } from "../types";
import { viewport } from "../main.ts";
import Ray from "../primitives/Ray.ts";
import { Opt } from "../../lib/types.ts";
import GridRenderer from "./renderer/GridRenderer.ts";
import { is } from "../../lib/jsml/jsml.ts";
import SkyRenderer from "./renderer/SkyRenderer.ts";
import Counter from "../primitives/Counter.ts";
import Keyboard from "../input/Keyboard.ts";
import MeshRenderer from "./renderer/MeshRenderer.ts";
import Path from "../resource/Path.ts";
import { editor } from "../editor/Editor.ts";
import NumberEditor from "../editor/NumberEditor.ts";



export default class Camera extends Component {
    private static keyCounter: Counter = new Counter(1);

    @editor(NumberEditor)
    private fov: number = 60;

    @editor(NumberEditor)
    public near: number = 0.1;

    @editor(NumberEditor)
    public far: number = 500;



    private _gridRenderer: Opt<GridRenderer>;
    private _skyRenderer: Opt<SkyRenderer>;

    private _view: Mat4 = undefined;
    private _vp: Mat4 = undefined
    private _projection: Mat4 = undefined;



    public awake(): void {
        this.updateProjection();
        this.updateView();
        this.assignKey();

        this._skyRenderer = this.gameObject.addComponent(SkyRenderer);
        this._skyRenderer.init(this.transform).then();

        this._gridRenderer = this.gameObject.addComponent(GridRenderer);
        this._gridRenderer.init(this.transform).then();

        if (!this.gameObject.hasComponent(MeshRenderer)) {
            const meshRenderer = this.gameObject.addComponent(MeshRenderer);
            meshRenderer.initFromModelFile(Path.from("/assets/models/camera.obj")).then();
        }

        window.addEventListener('resize', () => {
            this.updateProjection();
        });
    }

    private updateProjection(): Mat4 {
        const rect = viewport.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;
        this._projection = glm.perspective(glm.radians(this.fov), aspectRatio, this.near, this.far);
    }

    private assignKey(): void {
        if (Camera.keyCounter.peek() > 9) {
            return;
        }

        Keyboard.register({
            key: String(Camera.keyCounter.increment()),
            onPress: () => {
                if (this.scene.getSettings().doCameraSwitching) {
                    this.scene.setActiveCamera(this);
                }
            }
        });
    }

    public update(): void {
        this.updateView();
    }



    private preRenderSky(): void {
        if (!this.scene.getSettings().doRenderSky) {
            return;
        }

        if (!is(this._skyRenderer)) {
            return;
        }

        this._skyRenderer.render();
    }

    private preRenderGrid(): void {
        if (!this.scene.getSettings().doRenderGrid) {
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
        return this.transform.getWorldPosition();
    }

    public get vp(): Mat4 {
        return this._vp;
    }

    private updateView(): void {
        const transform = this.gameObject.transform;
        const forward = glm.normalize(transform.getForward());
        const up = glm.normalize(transform.getUp());

        const w = transform.getWorldPosition();

        this._view = glm.lookAt(
            w,
            w ["+"] (forward),
            up
        );

        this._vp = this._projection ["*"] (this._view);
    }

    public screenPositionToWorldRay(position: Vec2): Ray {
        const clip = glm.vec4(
            (position.x / viewport.width) * 2 - 1,
            1 - (position.y / viewport.height) * 2,
            -1,
            1
        );

        const eye = glm.inverse(this._projection) ["*"] (clip);
        eye.z = -1;
        eye.w = 0;

        const world = glm.normalize(glm.inverse(this._view) ["*"] (eye));
        return new Ray(
            glm.vec3(this.transform.getWorldPosition()),
            glm.vec3(world)
        );
    }

    public setFov(fov: number): Camera {
        this.fov = fov;
        this.updateProjection();
        return this;
    }



    public onPropertyChange(property: string, oldValue: any, newValue: any) {
        if (property === 'fov' || property === 'near' || property === 'far') {
            this.updateProjection();
        }
    }
}