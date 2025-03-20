import { $, assert, is } from "../lib/jsml/jsml.ts";
import Path from "./resource/Path.ts";
import { float, Mat4 } from "./types";
import Scene from "./object/Scene.ts";
import GameObject from "./object/GameObject.ts";
import Camera from "./component/Camera.ts";
import Mathf from "./primitives/Mathf.ts";
import { Quaternion } from "./primitives/Quaternion.ts";
import Vector3 from "./primitives/Vector3.ts";
import MaterialSource from "./resource/material/MaterialSource.ts";
import { RayRenderer } from "./component/renderer/RayRenderer.ts";
import BoundingBoxRenderer from "./component/renderer/BoundingBoxRenderer.ts";



declare global {
    const glm: any;
}



const _viewport = $<HTMLCanvasElement>("#viewport");
if (!is(_viewport)) {
    throw new Error("Could not locate main viewport");
}

export const viewport = _viewport;
export let projectionMatrix: Mat4;

function resizeViewport() {
    if (!is(_viewport)) {
        return;
    }

    const rect = _viewport.getBoundingClientRect();
    _viewport.width = Math.floor(rect.width);
    _viewport.height = Math.floor(rect.height);

    gl.viewport(0, 0, _viewport.width, _viewport.height);

    const aspectRatio = rect.width / rect.height;
    projectionMatrix = glm.perspective(glm.radians(35.0), aspectRatio, 0.1, 100);
}

const context = _viewport?.getContext("webgl2");
if (!is(context)) {
    throw new Error("Could not load WebGL context");
}

export const gl = context;

resizeViewport();
window.addEventListener("resize", resizeViewport);



export let mainScene: Scene = new Scene();

const defaultCameraObject = new GameObject(
    "default_camera",
    mainScene
);

mainScene.setMainCamera(
    defaultCameraObject.addComponent(Camera)
);



const rayGameObject = new GameObject("ray", mainScene);
const ray = rayGameObject.addComponent(RayRenderer);



async function init() {
    await MaterialSource.load(MaterialSource.getDefaultMaterial());

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    const suzanne = await mainScene.loadGameObject("suzanne", Path.from("/models/Suzanne.obj"));
    suzanne.transform
        .setPosition(glm.vec3(1, 0, 3))
        .setRotation(Quaternion.eulerDegrees(-30, 180, 60));

    const teapot = await mainScene.loadGameObject("teapot", Path.from("/models/Cube.obj"));
    teapot.transform
        .setPosition(glm.vec3(-1, 0, 3))
        .setScale(glm.vec3(0.5, 0.5, 0.5));

}

export let time: number = 0;
export let deltaTime: number = 0;

export const keyboard: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
    f: false,
    " ": false,
    "shift": false,
}

async function update() {
    const now = Date.now() / 1000;
    deltaTime = now - time;
    time = now;

    const camera = mainScene.getMainCamera();
    if (!is(camera)) {
        return;
    }

    const cameraSpeed = camera.speed * deltaTime;
    const cameraTransform = camera.transform;
    const forward = glm.normalize(cameraTransform.getForward());
    const up = glm.normalize(cameraTransform.getUp());

    if (keyboard["w"]) {
        camera.position ["+="] (forward ["*"] (cameraSpeed));
    }

    if (keyboard["s"]) {
        camera.position ["-="] (forward ["*"] (cameraSpeed));
    }

    if (keyboard["a"]) {
        camera.position ["-="] (glm.normalize(glm.cross(forward, Vector3.UP)) ["*"] (cameraSpeed));
    }

    if (keyboard["d"]) {
        camera.position ["+="] (glm.normalize(glm.cross(forward, Vector3.UP)) ["*"] (cameraSpeed));
    }

    if (keyboard[" "]) {
        camera.position ["+="] (up ["*"] (cameraSpeed));
    }

    if (keyboard["shift"]) {
        camera.position ["-="] (up ["*"] (cameraSpeed));
    }

    mainScene.update();
}

async function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mainScene.render();
}

window.addEventListener("click", async (event) => {
    // const camera = mainScene.getMainCamera();
    // if (is(camera)) {
    //     const mouseRay = camera.screenPositionToWorldRay(glm.vec2(event.clientX, event.clientY));
    //     ray.setRay(mouseRay.getStart(), mouseRay.getDirection());
    //     ray.setColor(glm.vec3(1.0, 0.3, 0.3));
    //
    //     const hit = mouseRay.cast(mainScene);
    //     if (!is(hit)) {
    //         console.log('Ray did not hit anything');
    //     } else {
    //         const bb = assert(hit.getComponent(BoundingBoxRenderer));
    //         bb.color = glm.vec3(0.3, 0.3, 1.0);
    //         console.log('Hit ', hit.name);
    //     }
    // }

    await _viewport.requestPointerLock();
    _viewport.focus();
});

let yaw: float = 0;
let pitch: float = 0;
_viewport.addEventListener("pointermove", event => {
    const camera = mainScene.getMainCamera();
    if (!is(camera)) {
        return;
    }

    if (document.pointerLockElement !== _viewport) {
        return;
    }

    const offsetX = -event.movementX * camera.sensitivity;
    const offsetY = event.movementY * camera.sensitivity;

    yaw += offsetX;
    pitch += offsetY;

    pitch = Mathf.clamp(pitch, -90, 90);

    camera.transform.setRotation(
        Quaternion.euler(glm.radians(pitch), glm.radians(yaw), 0)
    );
});

window.addEventListener("keyup", event => {
    if (event.key.toLowerCase() === 'f') {
        return;
    }

    keyboard[event.key.toLowerCase()] = false;
});

window.addEventListener("keydown", event => {
    if (event.key.toLowerCase() === 'f') {
        return;
    }

    keyboard[event.key.toLowerCase()] = true;
});

window.addEventListener("keypress", event => {
    if (event.key.toLowerCase() === 'f') {
        keyboard.f = !keyboard.f;
    }
});

function frameCallback() {
    update()
        .then(async () => {
            await render();
            requestAnimationFrame(frameCallback);
        });
}

init().then();
requestAnimationFrame(frameCallback);
