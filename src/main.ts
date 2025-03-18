import { $, is } from "../lib/jsml/jsml.ts";
import MeshSource from "./resource/mesh/MeshSource.ts";
import Path from "./resource/Path.ts";
import ShaderSource from "./resource/shader/ShaderSource.ts";
import Shader from "./resource/shader/Shader.ts";
import Mesh from "./resource/mesh/Mesh.ts";
import { float, Mat4 } from "./types";
import Scene from "./object/Scene.ts";
import GameObject from "./object/GameObject.ts";
import Camera from "./component/Camera.ts";
import Mathf from "./primitives/Mathf.ts";
import { Quaternion } from "./primitives/Quaternion.ts";
import Vector3 from "./primitives/Vector3.ts";



declare global {
    const glm: any;
}



const viewport = $<HTMLCanvasElement>("#viewport");
if (!is(viewport)) {
    throw new Error("Could not locate main viewport");
}

export let projectionMatrix: Mat4;

function resizeViewport() {
    if (!is(viewport)) {
        return;
    }

    const rect = viewport.getBoundingClientRect();
    viewport.width = Math.floor(rect.width);
    viewport.height = Math.floor(rect.height);

    gl.viewport(0, 0, viewport.width, viewport.height);

    const aspectRatio = rect.width / rect.height;
    projectionMatrix = glm.perspective(glm.radians(35.0), aspectRatio, 0.1, 100);
}

const context = viewport?.getContext("webgl2");
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



let suzanneMesh: Mesh;
let teapotMesh: Mesh;
let shader: Shader;

async function init() {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // const cubeSource = await MeshSource.load(Path.from("/models/Cube.obj"));
    const suzanneSource = await MeshSource.load(Path.from("/models/Suzanne.obj"));
    const teapotSource = await MeshSource.load(Path.from("/models/Teapot.obj"));

    // const cube = cubeSource.map(source => new Mesh(source));
    const suzanne = suzanneSource.map(source => new Mesh(source));
    const teapot = teapotSource.map(source => new Mesh(source));

    suzanneMesh = suzanne[0];
    teapotMesh = teapot[0];

    shader = new Shader(
        await ShaderSource.load(Path.from("/shaders/base.vert"), Path.from("/shaders/base.frag"))
    );

    shader.onBind(() => {
        const camera = mainScene.getMainCamera();
        if (!is(camera)) {
            return;
        }

        shader.setVec3("ViewPosition", camera.position);

        shader.setVec3("light.position", glm.vec3(0, 3, 0));
        shader.setVec3("light.ambient", glm.vec3(0.2, 0.2, 0.2));
        shader.setVec3("light.diffuse", glm.vec3(0.5, 0.5, 0.5));
        shader.setVec3("light.specular", glm.vec3(1.0, 1.0, 1.0));
    });
}

export let time: number = 0;
export let deltaTime: number = 0;

const keyboard: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
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

    if (!is(shader)) {
        return;
    }

    const camera = mainScene.getMainCamera();
    if (!is(camera)) {
        return;
    }

    shader.bind();

    // suzanne
    const suzanneModel = glm.translate(glm.vec3(-1, 0, 3))
        ["*"] (glm.toMat4(glm.quat(0, 0, 0, 0)))
        ["*"] (glm.scale(glm.vec3(1, 1, 1)));

    shader.setMat4("Model", suzanneModel);
    shader.setMat4("MVP", camera.createMVP(suzanneModel));

    shader.setVec3("material.ambient", glm.vec3(0.0215, 0.1745, 0.0215));
    shader.setVec3("material.diffuse", glm.vec3(0.07568, 0.61424, 0.07568));
    shader.setVec3("material.specular", glm.vec3(0.633, 0.727811, 0.633));
    shader.setFloat("material.shininess", 0.6 * 128);

    suzanneMesh.bind();
    suzanneMesh.draw();

    // teapot
    const teapotModel = glm.translate(glm.vec3(1, 0, 3))
        ["*"] (glm.toMat4(glm.quat(0, 0, 0, 0)))
        ["*"] (glm.scale(glm.vec3(1, 1, 1)));

    shader.setMat4("Model", teapotModel);
    shader.setMat4("MVP", camera.createMVP(teapotModel));

    shader.setVec3("material.ambient", glm.vec3(0.25, 0.20725, 0.20725));
    shader.setVec3("material.diffuse", glm.vec3(1, 0.829, 0.829));
    shader.setVec3("material.specular", glm.vec3(0.296648, 0.296648, 0.296648));
    shader.setFloat("material.shininess", 0);

    teapotMesh.bind();
    teapotMesh.draw();
}

window.addEventListener("click", async () => {
    await viewport.requestPointerLock();
    viewport.focus();
});

let yaw: float = 0;
let pitch: float = 0;
viewport.addEventListener("pointermove", event => {
    if (document.pointerLockElement !== viewport) {
        return;
    }

    const camera = mainScene.getMainCamera();
    if (!is(camera)) {
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
    keyboard[event.key.toLowerCase()] = false;
});

window.addEventListener("keydown", event => {
    keyboard[event.key.toLowerCase()] = true;
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
