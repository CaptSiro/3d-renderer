import Component from "../Component.ts";
import { Opt } from "../../../lib/types.ts";
import { Vec3 } from "../../types.ts";
import { editor } from "../../editor/Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import SkyRenderer from "./SkyRenderer.ts";
import jsml, { assert, is } from "../../../lib/jsml/jsml.ts";
import Ray from "../../primitives/Ray.ts";
import ColorEditor from "../../editor/ColorEditor.ts";
import Color from "../../primitives/Color.ts";
import Button from "../../editor/Button.ts";
import Vec3Editor from "../../editor/Vec3Editor.ts";
import { ModalWindow, window_create, window_isOpened, window_maximize, window_open } from "../../../lib/window.ts";
import GameObject from "../../object/GameObject.ts";
import { RayRenderer } from "./RayRenderer.ts";
import Vector3 from "../../utils/Vector3.ts";



export default class CpuSkyRenderer extends Component {
    private _skyRenderer: Opt<SkyRenderer>;
    private _center: Vec3 = glm.vec3(0, 0, 0);

    @editor(NumberEditor)
    public atmosphereHeight: number = 100;
    @editor(NumberEditor)
    public atmosphereH0: number = 0.25;

    @editor(NumberEditor)
    public planetRadius: number = 6400;

    @editor(ColorEditor)
    public sunIntensity: Color = Color.vec3(1.0, 0.95, 0.9);

    @editor(Vec3Editor)
    public wavelengths: number = glm.vec3(680, 520, 440);
    @editor(NumberEditor)
    public rayleighPhaseG: number = 0;

    @editor(NumberEditor)
    public opticalDepthSteps: number = 10;

    @editor(NumberEditor)
    public lightSteps: number = 10;



    public awake() {
        this._skyRenderer = this.gameObject.getComponent(SkyRenderer);
    }



    private _window: Opt<ModalWindow>;
    private worldRay: Opt<RayRenderer>;

    public renderPixel(): void {
        if (!is(this._window)) {
            this._window = window_create(
                "CpuSkyRenderer output",
                jsml.div("output"),
                {
                    isDraggable: true,
                    isMinimizable: true,
                    width: "300px",
                    height: "300px"
                }
            );
        }

        if (!is(this.worldRay)) {
            const go = new GameObject("ray");
            this.worldRay = go.addComponent(RayRenderer);
            this.worldRay.setColor(Color.vec3(0.5, 0.6, 1));
        }

        const cameraPosition = this.gameObject.transform.getPosition();
        this._center = glm.vec3(cameraPosition.x, -this.planetRadius, cameraPosition.z);

        const ray = new Ray(cameraPosition, glm.normalize(this.transform.getForward()));
        this.worldRay.setRay(ray.getStart(), ray.getDirection());

        const { close, distance } = ray.intersectSphere(this._center, this.planetRadius + this.atmosphereHeight);
        const surface = ray.intersectSphere(this._center, this.planetRadius).close;

        const atmosphereDepth = Math.min(distance, surface - close);

        const e = 0.00001;

        let color: Color;
        if (atmosphereDepth < 0) {
            color = Color.vec3(0, 0, 0);
        } else {
            const hit = ray.getStart() ["+"] (ray.getDirection() ["*"] (close + e));
            const inScatteredLight = this.inScatteringLight(hit, ray.getDirection(), atmosphereDepth - e);
            color = Color.fromVec3(inScatteredLight);
        }

        this._window.style.setProperty("--color", String(color))

        if (!window_isOpened(this._window)) {
            window_open(this._window);
        } else {
            window_maximize(this._window);
        }
    }

    @editor(Button)
    public render = this.renderPixel;



    private phase(u: Vec3, v: Vec3, g: number = 0) {
        const g2 = g*g;
        const cosTheta = glm.dot(glm.normalize(u), glm.normalize(v));
        const right = (3 * (1 - g2)) / (2 * (2 + g2));
        const left = (1 + cosTheta*cosTheta) / (1 + g2 - 2 * g * cosTheta);
        return right * left;
    }

    private density(p: Vec3): Vec3 {
        const h = (glm.length(p ["-"] (this._center)) - this.planetRadius) / this.atmosphereHeight;
        return this.K(this.wavelengths) ["*"] (Math.exp(-h / this.atmosphereH0)) ["*"] (4*Math.PI);
    }

    private K(lambda: Vec3): Vec3 {
        return glm.vec3(
            1 / Math.pow(lambda.x, 4),
            1 / Math.pow(lambda.y, 4),
            1 / Math.pow(lambda.z, 4),
        );
    }

    private opticalDepth(origin: Vec3, direction: Vec3, length: number): Vec3 {
        const sample = origin;
        const stepSize = length / (this.opticalDepthSteps - 1);
        let x = glm.vec3(0, 0, 0);

        for (let i = 0; i < this.opticalDepthSteps; i++) {
            x ["+="] (this.density(sample) ["*"] (stepSize));
            sample ["+="] (direction ["*"] (stepSize));
        }

        return x;
    }

    private getSunPosition(): Vec3 {
        const skyRenderer = assert(this._skyRenderer);
        return skyRenderer.getSunPosition();
    }

    private inScatteringLight(origin: Vec3, direction: Vec3, length: number): Vec3 {
        const sample = glm.vec3(origin);
        const stepLength = length / (this.lightSteps - 1);
        const step = direction ["*"] (stepLength);
        const sun = this.getSunPosition();

        console.log("[DIRECTION]")
        Vector3.print(direction);
        const v = glm.vec3(origin);
        v ["+="] (step);
        Vector3.print(v);

        let x = glm.vec3(0, 0, 0);

        console.log("[SAMPLES]")
        for (let i = 0; i < this.lightSteps; i++) {
            const sunRay = new Ray(glm.vec3(sample), glm.normalize(sun ["-"] (sample)));
            const sunRayDepth = this.opticalDepth(
                sunRay.getStart(),
                sunRay.getDirection(),
                sunRay.intersectSphere(this._center, this.planetRadius + this.atmosphereHeight).distance
            );

            const cameraRay = new Ray(glm.vec3(sample), glm.normalize(this.transform.getPosition() ["-"] (sample)));
            const cameraRayDepth = this.opticalDepth(
                cameraRay.getStart(),
                cameraRay.getDirection(),
                stepLength * i
            );

            Vector3.print(this.density(glm.vec3(sample)));

            const sampleColor = this.density(glm.vec3(sample))
                ["*"] (Vector3.exp((sunRayDepth ["+"] (cameraRayDepth)) ["*"] (-1)))
                ["*"] (stepLength);

            x ["+="] (sampleColor);
            sample ["+="] (step);
        }

        console.log("[X]")
        Vector3.print(x);

        return x
            ["*"] (this.phase(direction, glm.normalize(sun ["-"] (origin))))
            ["*"] (this.K(this.wavelengths))
            ["*"] (this.sunIntensity.vec3);
    }
}