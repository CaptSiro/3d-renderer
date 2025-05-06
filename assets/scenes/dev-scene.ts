import Scene from "../../src/object/Scene";
import Path from "../../src/resource/Path";
import Quaternion from "../../src/utils/Quaternion";
import Camera from "../../src/component/Camera";
import Movement from "../../src/component/Movement";
import LookAt from "../scripts/LookAt.ts";
import { pause } from "../../src/main.ts";
import RigidBody from "../../src/component/RigidBody.ts";
import SpotLight from "../../src/component/lights/SpotLight.ts";
import Spline from "../../src/component/Spline.ts";
import BezierCurve from "../../src/component/BezierCurve.ts";
import SplineRenderer from "../../src/component/renderer/SplineRenderer.ts";
import FollowPath from "../scripts/FollowPath.ts";
import Terrain from "../../src/component/Terrain.ts";
import Sun from "../../src/component/lights/Sun.ts";
import GlobalIllumination from "../../src/component/lights/GlobalIllumination.ts";
import SpriteRenderer from "../../src/component/renderer/SpriteRenderer.ts";
import SphereCollider from "../../src/component/SphereCollider.ts";
import Light from "../../src/component/lights/Light.ts";
import Color from "../../src/primitives/Color.ts";



export default async function devScene_loader(): Promise<Scene> {
    const devScene = new Scene('DevScene');

    const cam0 = devScene.createGameObject('cam0');
    cam0.transform
        .setPosition3(0, 0.2, -3);

    devScene.setActiveCamera(cam0.addComponent(Camera));
    cam0.addComponent(Movement);
    cam0.addComponent(SphereCollider).radius = 0.25;

    const suzanne = await devScene.loadGameObject("suzanne", Path.from("/assets/models/Suzanne.obj"));
    suzanne.transform
        .setPosition3(1, 0, 3)
        .setRotation(Quaternion.fromEulerDegrees(-50, 180, 60));
    suzanne.addComponent(RigidBody);
    suzanne.addComponent(SphereCollider).radius = 0.25;

    const sun = await devScene.loadGameObject("sun", Path.from("/assets/models/Cube.obj"));
    sun.addComponent(GlobalIllumination);
    sun.addComponent(Sun);
    sun.transform
        .setPosition3(0, 5, 5)
        .setScale3(5, 5, 5);

    const cube = await devScene.loadGameObject("cube_001", Path.from("/assets/models/Cube.obj"));
    cube.transform
        .setScale(glm.vec3(0.25, 0.25, 0.25))
        .setPosition(glm.vec3(-1, -0.5, 3));
    cube.addComponent(SphereCollider).radius = 0.25;

    suzanne.transform.addChild(cube);

    const cam1 = devScene.createGameObject('cam1');
    cam1.transform
        .setPosition3(-3, 0.1, -1);
    cam1.addComponent(Camera);
    const lookAt = cam1.addComponent(LookAt);

    const cam2 = devScene.createGameObject('cam2');
    cam2.transform
        .setPosition3(6.6, 6.8, -3.2)
        .setRotation(Quaternion.fromEulerDegrees(65, -21, 0));
    cam2.addComponent(Camera);

    const cam3 = devScene.createGameObject('cam2');
    cam3.transform
        .setPosition3(-15.323511123657227, 12.194103240966797, 20.064395904541016)
        .setRotation(Quaternion.fromEulerDegrees(-155.79981994628906, 45.84980392456055, 179.99984741210938));
    cam3.addComponent(Camera).setFov(15);

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

    const pointLight = await devScene.loadGameObject("light_000", Path.from("/assets/models/Cube.obj"));
    pointLight.transform
        .setPosition3(6, 0.5, 0)
        .setScale3(0.1, 0.1, 0.1);
    const l0 = pointLight.addComponent(Light);
    l0.intensity = 50;
    l0.color = Color.fromHex("#cec600");
    pointLight.addComponent(SphereCollider).radius = 0.25;

    const directionalLight = await devScene.loadGameObject("light_001", Path.from("/assets/models/camera.obj"));
    directionalLight.transform
        .setRotation(Quaternion.fromEulerDegrees(75, 0, 0))
        .setPosition3(4, 2, -0.6);
    const l1 = directionalLight.addComponent(SpotLight);
    l1.color = Color.fromHex("#b40a2b");
    l1.intensity = 200;
    directionalLight.addComponent(SphereCollider).radius = 0.25;

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

    const terrain_001 = devScene.createGameObject('terrain_001');
    terrain_001.transform
        .setPosition3(0, 0.5, 5)
        .setScale3(0.1, 0.1, 0.1);
    const terrain0 = terrain_001.addComponent(Terrain);
    terrain0.height = 4;
    terrain0.size = glm.vec2(20, 20);
    terrain0.scale = 0.3;
    terrain0.generate();

    const terrain_002 = devScene.createGameObject('terrain_002');
    terrain_002.transform
        .setPosition3(3, 0.5, 5)
        .setScale3(0.1, 0.1, 0.1);
    const terrain1 = terrain_002.addComponent(Terrain);
    terrain1.height = 4;
    terrain1.size = glm.vec2(20, 20);
    terrain1.scale = 0.3;
    terrain1.offset = 50;
    terrain1.generate();



    const baussi = devScene.createGameObject('baussi');
    baussi.transform
        .setRotation(Quaternion.fromEulerDegrees(0, 180, 0))
        .setPosition3(5, 0.1, 0);
    const spriteRenderer = baussi.addComponent(SpriteRenderer);
    const images = [];
    for (let i = 0; i < 381; i++) {
        const frame = String(i).padStart(3, '0');
        images.push(`/assets/sprites/baussi/frame_${frame}_delay-0.04s.png`);
    }
    spriteRenderer.images = images;
    spriteRenderer.fps = 25;
    spriteRenderer.setDimensions(4, 2);

    return devScene;
}