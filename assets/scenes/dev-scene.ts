import Scene from "../../src/object/Scene";
import Path from "../../src/resource/Path";
import Quaternion from "../../src/utils/Quaternion";
import Camera from "../../src/component/Camera";
import Movement from "../../src/component/Movement";
import Sun from "../scripts/Sun.ts";
import LookAt from "../scripts/LookAt.ts";
import { pause } from "../../src/main.ts";
import RigidBody from "../../src/component/RigidBody.ts";
import SpotLight from "../../src/component/lights/SpotLight.ts";
import Spline from "../../src/component/Spline.ts";
import BezierCurve from "../../src/component/BezierCurve.ts";
import SplineRenderer from "../../src/component/renderer/SplineRenderer.ts";
import FollowPath from "../scripts/FollowPath.ts";



export default async function devScene_loader(): Promise<Scene> {
    const devScene = new Scene('DevScene');

    const cam0 = devScene.createGameObject('cam0');
    cam0.transform
        .setPosition3(0, 0.2, -3);

    devScene.setActiveCamera(
        cam0.addComponent(Camera)
    );

    cam0.addComponent(Movement);

    const suzanne = await devScene.loadGameObject("suzanne", Path.from("/assets/models/Suzanne.obj"));
    suzanne.transform
        .setPosition3(1, 0, 3)
        .setRotation(Quaternion.fromEulerDegrees(-50, 180, 60));
    suzanne.addComponent(RigidBody);

    const teapot = await devScene.loadGameObject("teapot", Path.from("/assets/models/Cube.obj"));
    teapot.addComponent(Sun);
    teapot.transform
        .setPosition3(0, 5, 5)
        .setScale3(5, 5, 5);

    const cube = await devScene.loadGameObject("cube_001", Path.from("/assets/models/Cube.obj"));
    cube.transform
        .setScale(glm.vec3(0.25, 0.25, 0.25))
        .setPosition(glm.vec3(-1, -0.5, 3));

    suzanne.transform.addChild(cube);

    const cam1 = devScene.createGameObject('cam1');
    cam1.transform
        .setPosition3(-3, 0.1, -1);
    cam1.addComponent(Camera);
    const lookAt = cam1.addComponent(LookAt);

    const spline2 = devScene.createGameObject('spline_002');
    spline2.transform.setPosition3(8, 0, 0);
    const s2 = spline2.addComponent(Spline);
    s2.addSegment(new BezierCurve(
        glm.vec3(0, 2, 3),
        glm.vec3(2, 0, 4),
        glm.vec3(3, 4, 0),
        glm.vec3(4, 5, 6),
    ));
    spline2.addComponent(SplineRenderer);
    const f2 = cam1.addComponent(FollowPath);
    f2.setPath(s2);

    // const cam2 = devScene.createGameObject('cam2');
    // cam2.transform
    //     .setPosition3(0, 1, -4);
    // cam2.addComponent(Camera);
    //
    // suzanne.transform.addChild(cam2);

    // const pointLight = await devScene.loadGameObject("light_000", Path.from("/assets/models/Cube.obj"));
    // pointLight.transform
    //     .setScale3(0.1, 0.1, 0.1);
    // const l0 = pointLight.addComponent(Light);
    // l0.intensity = 21;

    const directionalLight = await devScene.loadGameObject("light_001", Path.from("/assets/models/camera.obj"));
    directionalLight.transform
        .setRotation(Quaternion.fromEulerDegrees(0, 180, 0))
        .setPosition3(1, 0, 0);
    const l1 = directionalLight.addComponent(SpotLight);
    l1.intensity = 1000;

    const spline = devScene.createGameObject('spline_001');
    spline.transform.setPosition3(12, 0, 0);
    const s = spline.addComponent(Spline);
    s.addSegment(new BezierCurve(
        glm.vec3(1, 0, 1),
        glm.vec3(2, 2, 0),
        glm.vec3(0, 4, 4),
        glm.vec3(4, 4, 0),
    ));
    s.addSegment(new BezierCurve(
        glm.vec3(4, 4, 0),
        glm.vec3(2, 0, 4),
        glm.vec3(3, 4, 0),
        glm.vec3(4, 5, 6),
    ));
    spline.addComponent(SplineRenderer);

    const cube2 = await devScene.loadGameObject("light_000", Path.from("/assets/models/Cube.obj"));
    cube2.transform.setScale3(0.25, 0.25, 0.25);
    const follower = cube2.addComponent(FollowPath);
    follower.setPath(s);
    // follower.log = true;

    lookAt.setTarget(cube2);

    pause?.click();
    devScene.getTime().setDayTime(0.25);
    devScene.getTime().scale = 0;

    return devScene;
}