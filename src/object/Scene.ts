import GameObject from "./GameObject.ts";
import Camera from "../component/Camera.ts";
import { Opt } from "../../lib/types";
import Path from "../resource/Path.ts";
import MeshRenderer from "../component/renderer/MeshRenderer.ts";
import jsml, { $, is } from "../../lib/jsml/jsml.ts";
import Time from "./Time.ts";
import { float, int, Predicate } from "../types.ts";
import Movement from "../component/Movement.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import RenderingContext from "../primitives/RenderingContext.ts";
import Matrix4 from "../utils/Matrix4.ts";
import { ModalWindow, window_create, window_open } from "../../lib/window.ts";
import Editor, { getEditor } from "../editor/Editor.ts";
import SceneSettings from "./SceneSettings.ts";
import Light from "../component/lights/Light.ts";
import { FLOAT_SIZE, LIGHT_UBO_LENGTH_OFFSET, LIGHT_UBO_SIZE, MAX_LIGHTS } from "../webgl.ts";
import { gl } from "../main.ts";
import Shader from "../resource/shader/Shader.ts";
import SphereCollider from "../component/SphereCollider.ts";



const FIXED_UPDATE_MILLISECONDS = 20;

export default class Scene {
    private readonly _gameObjects: GameObject[];
    private readonly _lights: Light[];
    private readonly _lightsBuffer: WebGLBuffer;
    private readonly _colliders: SphereCollider[];

    private readonly _time: Time;
    private readonly _settings: SceneSettings;
    private _activeCamera: Opt<Camera>;

    private _physicsTimestamp: float;



    constructor(
        private _name: string = ''
    ) {
        this._lightsBuffer = gl.createBuffer();
        this._gameObjects = [];
        this._lights = [];
        this._colliders = [];
        this._time = new Time(FIXED_UPDATE_MILLISECONDS);
        this._settings = new SceneSettings();
        this._physicsTimestamp = Date.now();
    }



    public update(): void {
        while (this._physicsTimestamp < Date.now()) {
            this.fixedUpdate();
            this._physicsTimestamp += this._time.fixedUpdateMilliseconds;
        }

        this._time.update();
        this._activeCamera?.gameObject.update();

        for (const gameObject of this._gameObjects.values()) {
            if (gameObject === this._activeCamera?.gameObject) {
                continue;
            }

            gameObject.update();
        }
    }

    public fixedUpdate(): void {
        this._activeCamera?.gameObject.fixedUpdate();

        for (const gameObject of this._gameObjects.values()) {
            if (gameObject === this._activeCamera?.gameObject) {
                continue;
            }

            gameObject.fixedUpdate();
        }

        this.checkCollision();
    }

    /**
     * Iterate over each collider and test for collision with any other collider
     */
    public checkCollision(): void {
        if (this._colliders.length <= 1) {
            return;
        }

        for (let i = 0; i < this._colliders.length; i++) {
            const ci = this._colliders[i];

            for (let j = 0; j < this._colliders.length; j++) {
                if (i == j) {
                    continue;
                }

                const cj = this._colliders[j];
                if (!ci.isColliding(cj)) {
                    continue;
                }

                ci.onCollision(cj);
            }
        }
    }

    /**
     * Create and send a buffer of currently present lights in the scene to the GPU
     * @private
     */
    private populateLights(): void {
        gl.bindBuffer(gl.UNIFORM_BUFFER, this._lightsBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, LIGHT_UBO_SIZE, gl.DYNAMIC_DRAW);

        const buffer = new Float32Array(LIGHT_UBO_LENGTH_OFFSET / FLOAT_SIZE);

        let count = 0;
        let offset = 0;
        for (const light of this._lights) {
            if (!light.isEnabled()) {
                continue;
            }

            offset += light.getDescription().writeLight(buffer, offset);
            count++;
        }

        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, buffer, 0, offset * FLOAT_SIZE);

        const length = Int32Array.from([count]);
        gl.bufferSubData(gl.UNIFORM_BUFFER, LIGHT_UBO_LENGTH_OFFSET, length);

        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }

    /**
     * Bind uniform buffer object that contains lights description data to provided shader
     * @param shader
     * @param uniform
     * @param binding
     */
    public bindLights(shader: Shader, uniform: string, binding: int): void {
        shader.setUniformBlockBinding(uniform, binding);
        gl.bindBuffer(gl.UNIFORM_BUFFER, this._lightsBuffer);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, this._lightsBuffer);
    }

    public render(): void {
        this.populateLights();

        const camera = this.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        camera.preRender();

        const context = new RenderingContext(
            Matrix4.IDENTITY,
            camera
        )

        for (const gameObject of this._gameObjects.values()) {
            if (gameObject === this._activeCamera?.gameObject) {
                continue;
            }

            gameObject.render(context);
        }
    }

    public delete(): void {
        for (const gameObject of this._gameObjects) {
            gameObject.delete();
        }

        gl.deleteBuffer(this._lightsBuffer);
    }



    public get name(): string {
        return this._name;
    }

    public getTime(): Time {
        return this._time;
    }

    public getSettings(): SceneSettings {
        return this._settings;
    }

    public addLight(light: Light): void {
        if (this._lights.length >= MAX_LIGHTS) {
            console.warn("Action 'addLight' was ignored because it would have exceeded maximum number of lights in scene");
            return;
        }

        this._lights.push(light);
    }

    public deleteLight(light: Light): boolean {
        const i = this._lights.indexOf(light);
        if (i < 0) {
            return false;
        }

        this._lights.splice(i, 1);
        return true;
    }

    public addCollider(collider: SphereCollider): void {
        this._colliders.push(collider);
    }

    public deleteCollider(collider: SphereCollider): boolean {
        const i = this._colliders.indexOf(collider);
        if (i < 0) {
            return false;
        }

        this._colliders.splice(i, 1);
        return true;
    }

    public addGameObject(gameObject: GameObject): void {
        this._gameObjects.push(gameObject);
    }

    public deleteGameObject(predicate: Predicate<GameObject>): boolean {
        const i = this._gameObjects.findIndex(predicate);
        if (i < 0) {
            return false;
        }

        this._gameObjects.splice(i, 1);
        return true;
    }

    public getGameObjects(): MapIterator<GameObject> {
        return this._gameObjects.values();
    }

    public getActiveCamera(): Opt<Camera> {
        return this._activeCamera;
    }

    public setActiveCamera(camera: Camera): void {
        const movement = this._activeCamera?.gameObject.getComponent(Movement);
        if (is(movement)) {
            movement.setEnable(false);
        }

        this._activeCamera = camera;

        const m = camera.gameObject.getComponent(Movement);
        if (is(m)) {
            m.setEnable(true);
        }
    }

    public async loadGameObject(name: string, path: Path): Promise<GameObject> {
        const gameObject = new GameObject(name, undefined, this);

        if (MeshSource.isMeshFile(path)) {
            const meshSources = await MeshSource.load(path);
            if (!is(meshSources)) {
                console.warn('Mesh file not found ' + path.getLiteral());
                return gameObject;
            }

            const first = meshSources[0];
            if (!is(first)) {
                return gameObject;
            }

            const meshRenderer = gameObject.addComponent(MeshRenderer);
            await meshRenderer.init([first]);

            for (let i = 1; i < meshSources.length; i++) {
                const meshSource = meshSources[i];
                const child = new GameObject(meshSource.getName(), undefined, this);

                const meshRenderer = child.addComponent(MeshRenderer);
                await meshRenderer.init([meshSource]);

                gameObject.transform.addChild(child);
            }

            return gameObject;
        }

        return gameObject;
    }

    public createGameObject(name: string): GameObject {
        return new GameObject(name, undefined, this);
    }



    public getSettingsEditorWindow(): ModalWindow {
        const id = "__scene-settings__" + this._name;
        const win = $<HTMLDivElement>("#" + id);
        if (is(win)) {
            return win;
        }

        const content = jsml.div("editor-content");
        const w = window_create(
            this._name + " settings",
            content,
            {
                isDraggable: true,
                isMinimizable: true,
                isResizable: true,
                width: "400px"
            }
        );

        const componentContent = jsml.div("component-content");

        for (const key of Object.keys(this._settings)) {
            const editor = getEditor(w, this._settings, key);
            if (!is(editor)) {
                continue;
            }

            componentContent.append(editor.html());
        }

        content.append(
            jsml.div("component no-hr", [
                componentContent
            ])
        );

        return Editor.initWindow(w, id);
    }

    public getGameObjectsWindow(): ModalWindow {
        const id = "__scene-gameObjects__" + this._name;
        const win = $<HTMLDivElement>("#" + id);
        if (is(win)) {
            return win;
        }

        const content = jsml.div("editor-content pad");
        const w = window_create(
            this._name + " settings",
            content,
            {
                isDraggable: true,
                isMinimizable: true,
                isResizable: true,
                width: "400px"
            }
        );

        for (const gameObject of this._gameObjects) {
            content.append(jsml.button({
                onClick: () => window_open(gameObject.getEditorWindow())
            }, gameObject.name));
        }

        return Editor.initWindow(w, id);
    }
}