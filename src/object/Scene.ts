import GameObject from "./GameObject.ts";
import Camera from "../component/Camera.ts";
import { Opt } from "../../lib/types";
import Path from "../resource/Path.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import ShaderSource from "../resource/shader/ShaderSource.ts";
import MeshRenderer from "../component/renderer/MeshRenderer.ts";
import { is } from "../../lib/jsml/jsml.ts";



export default class Scene {
    private readonly gameObjects: Map<string, GameObject>;
    private mainCamera: Opt<Camera>;

    constructor() {
        this.gameObjects = new Map<string, GameObject>();
    }



    public update(): void {
        for (const gameObject of this.gameObjects.values()) {
            gameObject.update();
        }
    }

    public render(): void {
        const camera = this.getMainCamera();
        if (!is(camera)) {
            return;
        }

        camera.preRender();

        for (const gameObject of this.gameObjects.values()) {
            gameObject.render();
        }
    }



    public addGameObject(gameObject: GameObject): void {
        this.gameObjects.set(gameObject.name, gameObject);
    }

    public deleteGameObject(gameObject: GameObject): void {
        this.gameObjects.delete(gameObject.name);
    }

    public getGameObjects(): MapIterator<GameObject> {
        return this.gameObjects.values();
    }

    public getMainCamera(): Opt<Camera> {
        return this.mainCamera;
    }

    public setMainCamera(camera: Camera): void {
        this.mainCamera = camera;
    }

    public async loadGameObject(name: string, path: Path): Promise<GameObject> {
        const gameObject = new GameObject(name, this);

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