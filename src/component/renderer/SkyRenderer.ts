import Component from "../Component.ts";
import { Opt } from "../../../lib/types.ts";
import Shader from "../../resource/shader/Shader.ts";
import Transform from "../Transform.ts";
import ShaderSource from "../../resource/shader/ShaderSource.ts";
import { gl } from "../../main.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import type { float, int, Vec3 } from "../../types.ts";
import Time from "../../object/Time.ts";
import { editor } from "../../editor/Editor.ts";
import Vec3Editor from "../../editor/Vec3Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import Vector3 from "../../utils/Vector3.ts";
import MathLib from "../../utils/MathLib.ts";
import Fog from "./Fog.ts";



export type Light = {
    ambient: Vec3,
    diffuse: Vec3,
    specular: Vec3,
};

export type SolarPath = (time: Time, sky: SkyRenderer) => Vec3;

export const defaultSolarPath: SolarPath = (time, sky) => glm.vec3(
    0,
    Math.sin(time.getDayTime() * 2 * Math.PI) * sky.atmosphereHeight * 2,
    Math.cos(time.getDayTime() * 2 * Math.PI) * sky.atmosphereHeight * 2
);

export default class SkyRenderer extends Component {
    private _target: Opt<Transform>;
    private _shader: Opt<Shader>;

    @editor(NumberEditor)
    public cubeSize: float = 250;
    @editor(NumberEditor)
    public atmosphereHeight: float = 100;

    @editor(Vec3Editor)
    public wavelengths: Vec3 = glm.vec3(700, 530, 440);
    @editor(NumberEditor)
    public scatteringStrength: float = 0.4;

    @editor(NumberEditor)
    public atmosphereFalloff: float = 0.2;

    @editor(NumberEditor)
    public lightPoints: int = 6;
    @editor(NumberEditor)
    public opticalDepthPoints: int = 6;



    private _solarPath: SolarPath = defaultSolarPath;



    private lightDescriptions: (Light & { time: float })[] = [
        {
            time: 0,
            ambient: Vector3.rgb(10, 10, 20),
            diffuse: Vector3.rgb(5, 5, 10),
            specular: Vector3.rgb(20, 20, 30)
        },
        {
            time: 0.05,
            ambient: Vector3.rgb(255, 147, 41),
            diffuse: Vector3.rgb(255, 147, 41),
            specular: Vector3.rgb(255, 255, 255)
        },
        {
            time: 0.100,
            ambient: Vector3.rgb(255, 230, 200),
            diffuse: Vector3.rgb(255, 230, 200),
            specular: Vector3.rgb(255, 255, 245)
        },
        {
            time: 0.25,
            ambient: Vector3.rgb(255, 255, 255),
            diffuse: Vector3.rgb(255, 255, 255),
            specular: Vector3.rgb(255, 255, 255)
        },
        {
            time: 0.375,
            ambient: Vector3.rgb(255, 230, 200),
            diffuse: Vector3.rgb(255, 230, 200),
            specular: Vector3.rgb(255, 255, 245)
        },
        {
            time: 0.450,
            ambient: Vector3.rgb(255, 147, 41),
            diffuse: Vector3.rgb(255, 147, 41),
            specular: Vector3.rgb(255, 255, 255)
        },
        {
            time: 0.5,
            ambient: Vector3.rgb(30, 30, 40),
            diffuse: Vector3.rgb(20, 20, 30),
            specular: Vector3.rgb(50, 50, 60)
        },
        {
            time: 0.75,
            ambient: Vector3.rgb(5, 5, 15),
            diffuse: Vector3.rgb(2, 2, 8),
            specular: Vector3.rgb(10, 10, 20)
        },
    ];



    public awake(): void {
        this.gameObject
            .addComponent(Fog)
            .bindSkyRenderer(this);
    }



    public render(): void {
        const camera = this.scene.getActiveCamera();
        if (!is(camera) || !is(this._shader) || !is(this._target)) {
            return;
        }

        this._shader.bind();

        // Vertex
        this._shader.setMat4("VP", camera.vp);
        this._shader.setVec3("TargetPosition", this._target.getPosition());
        this._shader.setFloat("CubeSize", this.cubeSize);

        // Fragment
        this._shader.setVec3("CameraPosition", camera.position);
        this._shader.setVec3("SunPosition", this.getSunPosition());
        this._shader.setVec3("Scattering", this.getInverseWavelengths());
        this._shader.setFloat("AtmosphereHeight", this.atmosphereHeight);
        this._shader.setFloat("DensityFalloff", this.atmosphereFalloff);
        this._shader.setInt("LightPoints", this.lightPoints);
        this._shader.setInt("OpticalDepthPoints", this.opticalDepthPoints);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    public setSunPosition(path: SolarPath): void {
        this._solarPath = path;
    }

    public getSunPosition(): Vec3 {
        return this._solarPath(this.scene.getTime(), this);
    }

    public getSunLight(): Light {
        const current = this.scene.getTime().getDayTime();
        let lower: int = this.lightDescriptions.length - 1;
        let upper: int = 0;

        for (let j = 0; j < this.lightDescriptions.length; j++) {
            const light = this.lightDescriptions[j];

            if (light.time > current) {
                lower = j - 1;
                upper = j;
                break;
            }
        }

        if (lower >= this.lightDescriptions.length) {
            lower -= this.lightDescriptions.length;
        }

        if (upper >= this.lightDescriptions.length) {
            upper -= this.lightDescriptions.length;
        }

        if (lower === upper) {
            return this.lightDescriptions[lower];
        }

        const lowerLight = this.lightDescriptions[lower];
        const upperLight = this.lightDescriptions[upper];
        const t = (upper < lower)
            ? MathLib.normalize(lowerLight.time, 1.0, current)
            : MathLib.normalize(lowerLight.time, upperLight.time, current);

        return {
            ambient: MathLib.lerpColor(lowerLight.ambient, upperLight.ambient, t),
            diffuse: MathLib.lerpColor(lowerLight.diffuse, upperLight.diffuse, t),
            specular: MathLib.lerpColor(lowerLight.specular, upperLight.specular, t),
        };
    }

    private getInverseWavelengths(): Vec3 {
        return glm.vec3(
            Math.pow(180 / this.wavelengths.x, 4) * this.scatteringStrength,
            Math.pow(180 / this.wavelengths.y, 4) * this.scatteringStrength,
            Math.pow(180 / this.wavelengths.z, 4) * this.scatteringStrength,
        );
    }

    public async init(target: Transform): Promise<void> {
        this._target = target;
        const sky = await ShaderSource.loadShader("sky");
        if (!is(sky)) {
            console.warn('Sky renderer not found');
            return;
        }

        this._shader = Shader.load(sky);
    }
}