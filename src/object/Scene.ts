import GameObject from "./GameObject.ts";
import Camera from "../component/Camera.ts";
import { Opt } from "../../lib/types";
import Path from "../resource/Path.ts";
import MeshRenderer from "../component/renderer/MeshRenderer.ts";
import jsml, { $, is } from "../../lib/jsml/jsml.ts";
import Time from "./Time.ts";
import { float, Predicate } from "../types.ts";
import Movement from "../component/Movement.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import RenderingContext from "../primitives/RenderingContext.ts";
import Matrix4 from "../utils/Matrix4.ts";
import { ModalWindow, window_create } from "../../lib/window.ts";
import Editor, { getEditor } from "../editor/Editor.ts";
import SceneSettings from "./SceneSettings.ts";



const FIXED_UPDATE_MILLISECONDS = 20;

export default class Scene {
    private readonly _gameObjects: GameObject[];
    private readonly _time: Time;
    private readonly _settings: SceneSettings;
    private _activeCamera: Opt<Camera>;

    private _physicsTimestamp: float;



    constructor(
        private _name: string = ''
    ) {
        this._gameObjects = [];
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
    }

    public render(): void {
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
            const shaderSource = await this._settings.getDefaultShader();

            const first = meshSources[0];
            if (!is(first)) {
                return gameObject;
            }

            const meshRenderer = gameObject.addComponent(MeshRenderer);
            await meshRenderer.init([first], shaderSource);

            for (let i = 1; i < meshSources.length; i++) {
                const meshSource = meshSources[i];
                const child = new GameObject(meshSource.getName(), undefined, this);

                const meshRenderer = child.addComponent(MeshRenderer);
                await meshRenderer.init([meshSource], shaderSource);

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
}