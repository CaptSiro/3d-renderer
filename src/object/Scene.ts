import GameObject from "./GameObject.ts";
import Camera from "../component/Camera.ts";
import { Opt } from "../../lib/types";



export default class Scene {
    private gameObjects: Map<string, GameObject>;
    private mainCamera: Opt<Camera>;

    constructor() {
        this.gameObjects = new Map<string, GameObject>();
    }



    public update(): void {
        for (const [_, gameObject] of this.gameObjects) {
            gameObject.update();
        }
    }

    public addGameObject(gameObject: GameObject): void {
        this.gameObjects.set(gameObject.name, gameObject);
    }

    public getMainCamera(): Opt<Camera> {
        return this.mainCamera;
    }

    public setMainCamera(camera: Camera): void {
        this.mainCamera = camera;
    }
}