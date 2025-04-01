import GameObject from "./GameObject.ts";
import Camera from "../component/Camera.ts";
import { Opt } from "../../lib/types";
import Path from "../resource/Path.ts";
import MeshRenderer from "../component/renderer/MeshRenderer.ts";
import { is } from "../../lib/jsml/jsml.ts";
import Time from "./Time.ts";
import { Predicate } from "../types.ts";
import Movement from "../component/Movement.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";



export default class Scene {
    private readonly _gameObjects: GameObject[];
    private readonly _time: Time;
    private _activeCamera: Opt<Camera>;

    constructor() {
        this._gameObjects = [];
        this._time = new Time();
    }



    public update(): void {
        this._time.update();
        this._activeCamera?.gameObject.update();

        for (const gameObject of this._gameObjects.values()) {
            if (gameObject === this._activeCamera?.gameObject) {
                continue;
            }

            gameObject.update();
        }
    }

    public render(): void {
        const camera = this.getActiveCamera();
        if (!is(camera)) {
            return;
        }

        camera.preRender();

        for (const gameObject of this._gameObjects.values()) {
            if (gameObject === this._activeCamera?.gameObject) {
                continue;
            }

            gameObject.render();
        }
    }



    public getTime(): Time {
        return this._time;
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
            const shaderSource = await ShaderSource.loadShader("base");

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
}