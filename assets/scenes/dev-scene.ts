import Scene from "../../src/object/Scene";
import Path from "../../src/resource/Path";
import Quaternion from "../../src/utils/Quaternion";
import Camera from "../../src/component/Camera";
import Movement from "../../src/component/Movement";
import Sun from "../scripts/Sun.ts";



export default async function devScene_loader(): Promise<Scene> {
    const devScene = new Scene('DevScene');

    const cam0 = devScene.createGameObject('cam0');
    cam0.transform
        .setPosition(glm.vec3(0, 1, 0));

    devScene.setActiveCamera(
        cam0.addComponent(Camera)
    );

    cam0.addComponent(Movement);

    const suzanne = await devScene.loadGameObject("suzanne", Path.from("/assets/models/Suzanne.obj"));
    suzanne.transform
        .setPosition(glm.vec3(1, 0, 3))
        .setRotation(Quaternion.fromEulerDegrees(-50, 180, 60));

    const teapot = await devScene.loadGameObject("teapot", Path.from("/assets/models/Cube.obj"));
    teapot.addComponent(Sun);
    teapot.transform
        .setPosition(glm.vec3(0.0, 5.0, 5.0))
        .setScale(glm.vec3(0.5, 0.5, 0.5));

    const cube = await devScene.loadGameObject("cube_001", Path.from("/assets/models/Cube.obj"));
    cube.transform
        .setScale(glm.vec3(0.25, 0.25, 0.25))
        .setPosition(glm.vec3(-1, -0.5, 3));

    suzanne.transform.addChild(cube);

    const cam1 = devScene.createGameObject('cam1');
    cam1.transform
        .setPosition(glm.vec3(-3, 0.1, -1));
    cam1.addComponent(Camera);

    return devScene;
}