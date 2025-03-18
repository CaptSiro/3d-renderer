import { $, is } from "../lib/jsml/jsml.ts";
import MeshSource from "./resource/mesh/MeshSource.ts";
import Path from "./resource/Path.ts";
import ShaderSource from "./resource/shader/ShaderSource.ts";
import Shader from "./resource/shader/Shader.ts";
import Mesh from "./resource/mesh/Mesh.ts";

declare const glm: any;



const viewport = $<HTMLCanvasElement>("#viewport");
if (!is(viewport)) {
    throw new Error("Could not locate main viewport");
}

let projectionMatrix: any;

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



let suzanneMesh: Mesh;
let teapotMesh: Mesh;
let shader: Shader;

const camera = {
    speed: 1,
    sensitivity: 0.05,

    yaw: -90,
    pitch: 0,

    position: glm.vec3(0, 0, 0),
    front: glm.vec3(0, 0, -1),
    up: glm.vec3(0, 1, 0),
    right: glm.vec3(0, 0, 0),
    direction: glm.vec3(0, 0, 0),

    view: undefined,
};

export function createMVP(model: any): any {
    return projectionMatrix ["*"] (camera.view) ["*"] (model);
}

async function init() {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    camera.view = glm.lookAt(camera.position, camera.position ["+"] (camera.front), camera.up);

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

    const cameraSpeed = camera.speed * deltaTime;
    let viewChange = false;

    if (keyboard["w"]) {
        camera.position ["+="] (camera.front ["*"] (cameraSpeed));
        viewChange = true;
    }

    if (keyboard["s"]) {
        camera.position ["-="] (camera.front ["*"] (cameraSpeed));
        viewChange = true;
    }

    if (keyboard["a"]) {
        camera.position ["-="] (glm.normalize(glm.cross(camera.front, camera.up)) ["*"] (cameraSpeed));
        viewChange = true;
    }

    if (keyboard["d"]) {
        camera.position ["+="] (glm.normalize(glm.cross(camera.front, camera.up)) ["*"] (cameraSpeed));
        viewChange = true;
    }

    if (keyboard[" "]) {
        camera.position ["+="] (camera.up ["*"] (cameraSpeed));
        viewChange = true;
    }

    if (keyboard["shift"]) {
        camera.position ["-="] (camera.up ["*"] (cameraSpeed));
        viewChange = true;
    }

    if (viewChange) {
        camera.view = glm.lookAt(camera.position, camera.position ["+"] (camera.front), camera.up);
    }
}

async function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!is(shader)) {
        return;
    }

    shader.bind();

    // suzanne
    const suzanneModel = glm.translate(glm.vec3(-1, 0, -3))
        ["*"] (glm.toMat4(glm.quat(0, 0, 0, 0)))
        ["*"] (glm.scale(glm.vec3(1, 1, 1)));

    shader.setMat4("Model", suzanneModel);
    shader.setMat4("MVP", createMVP(suzanneModel));

    shader.setVec3("material.ambient", glm.vec3(0.0215, 0.1745, 0.0215));
    shader.setVec3("material.diffuse", glm.vec3(0.07568, 0.61424, 0.07568));
    shader.setVec3("material.specular", glm.vec3(0.633, 0.727811, 0.633));
    shader.setFloat("material.shininess", 0.6 * 128);

    suzanneMesh.bind();
    suzanneMesh.draw();

    // teapot
    const teapotModel = glm.translate(glm.vec3(1, 0, -3))
        ["*"] (glm.toMat4(glm.quat(0, 0, 0, 0)))
        ["*"] (glm.scale(glm.vec3(1, 1, 1)));

    shader.setMat4("Model", teapotModel);
    shader.setMat4("MVP", createMVP(teapotModel));

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

viewport.addEventListener("pointermove", event => {
    if (document.pointerLockElement !== viewport) {
        return;
    }

    const offsetX = event.movementX * camera.sensitivity;
    const offsetY = -event.movementY * camera.sensitivity;

    camera.yaw += offsetX;
    camera.pitch += offsetY;

    if (camera.pitch > 89) {
        camera.pitch = 89;
    }

    if (camera.pitch < -89) {
        camera.pitch = -89;
    }

    camera.direction.x = Math.cos(glm.radians(camera.yaw)) * Math.cos(glm.radians(camera.pitch));
    camera.direction.y = Math.sin(glm.radians(camera.pitch));
    camera.direction.z = Math.sin(glm.radians(camera.yaw)) * Math.cos(glm.radians(camera.pitch));

    camera.front = glm.normalize(camera.direction);
//    camera.front = glm.normalize(glm.vec3(cos(glm.radians(camera.yaw)) * cos(glm.radians(camera.pitch)), 1.0, sin(glm.radians(camera.yaw)) * cos(glm.radians(camera.pitch))));

    camera.view = glm.lookAt(camera.position, camera.position ["+"] (camera.front), camera.up);
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
