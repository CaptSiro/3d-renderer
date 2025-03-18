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
    viewport.width = rect.width;
    viewport.height = rect.height;

    const aspectRatio = rect.width / rect.height;
    projectionMatrix = glm.perspective(glm.radians(35.0), aspectRatio, 0.1, 100);
}

resizeViewport();
window.addEventListener("resize", resizeViewport);

const context = viewport?.getContext("webgl2");
if (!is(context)) {
    throw new Error("Could not load WebGL context");
}

export const gl = context;



let suzaneMesh: Mesh;
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
    right: undefined,
    direction: undefined,

    view: undefined,
};

export function createMVP(model: any): any {
    return projectionMatrix ["*"] (camera.view) ["*"] (model);
}

async function main() {
    camera.view = glm.lookAt(camera.position, camera.position ["+"] (camera.front), camera.up);

    // const cubeSource = await MeshSource.load(Path.from("/models/Cube.obj"));
    const suzanneSource = await MeshSource.load(Path.from("/models/Suzanne.obj"));
    const teapotSource = await MeshSource.load(Path.from("/models/Teapot.obj"));

    // const cube = cubeSource.map(source => new Mesh(source));
    const suzanne = suzanneSource.map(source => new Mesh(source));
    const teapot = teapotSource.map(source => new Mesh(source));

    suzaneMesh = suzanne[0];
    teapotMesh = teapot[0];

    shader = new Shader(
        await ShaderSource.load(Path.from("/shaders/base.vert"), Path.from("/shaders/base.frag"))
    );
}

export let time: number = 0;
export let deltaTime: number = 0;

async function update() {
    const now = Date.now();
    deltaTime = now - time;
    time = now;
}

async function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!is(shader)) {
        return;
    }

    shader.bind();

    shader.setVec3("ViewPosition", camera.position);

    shader.setVec3("light.position", glm.vec3(0, 10, 0));
    shader.setVec3("light.ambient", glm.vec3(0.2, 0.2, 0.2));
    shader.setVec3("light.diffuse", glm.vec3(0.5, 0.5, 0.5));
    shader.setVec3("light.specular", glm.vec3(1.0, 1.0, 1.0));

    // suzanne
    const suzanneModel = glm.translate(glm.vec3(-1, -1, -3))
        ["*"] (glm.toMat4(glm.quat(0, 0, 0, 0)))
        ["*"] (glm.scale(glm.vec3(1, 1, 1)));

    shader.setMat4("Model", suzanneModel);
    shader.setMat4("MVP", createMVP(suzanneModel));

    shader.setVec3("material.ambient", glm.vec3(0.05375, 0.05, 0.06625));
    shader.setVec3("material.diffuse", glm.vec3(0.18275, 0.17, 0.22525));
    shader.setVec3("material.specular", glm.vec3(0.332741, 0.328634, 0.346435));
    shader.setFloat("material.shininess", 0.3 * 128);

    suzaneMesh.bind();
    suzaneMesh.draw();

    // teapot
    const teapotModel = glm.translate(glm.vec3(1, -1, -3))
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

function frameCallback() {
    update()
        .then(async () => {
            await render();
            requestAnimationFrame(frameCallback);
        });
}

main().then();
requestAnimationFrame(frameCallback);
