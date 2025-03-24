import GameObject from "./GameObject.ts";
import Camera from "../component/Camera.ts";
import { Opt } from "../../lib/types";
import Path from "../resource/Path.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";
import MeshRenderer from "../component/renderer/MeshRenderer.ts";
import { is } from "../../lib/jsml/jsml.ts";
import Time from "./Time.ts";
import { Predicate } from "../types.ts";



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
        this._activeCamera = camera;
    }

    public async loadGameObject(name: string, path: Path): Promise<GameObject> {
        const gameObject = new GameObject(name, undefined, this);

        const meshSources = await MeshSource.load(path);
        const shaderSource = await ShaderSource.load(
            Path.from("/shaders/base.vert"),
            Path.from("/shaders/base.frag")
        );

        const meshRenderer = gameObject.addComponent(MeshRenderer);
        await meshRenderer.init(meshSources, shaderSource);

        return gameObject;
    }
}