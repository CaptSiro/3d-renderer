import { $, assert, is } from "../lib/jsml/jsml.ts";
import Path from "./resource/Path.ts";
import { Mat4 } from "./types";
import Scene from "./object/Scene.ts";
import GameObject from "./object/GameObject.ts";
import Camera from "./component/Camera.ts";
import { Quaternion } from "./primitives/Quaternion.ts";
import MaterialSource from "./resource/material/MaterialSource.ts";
import { RayRenderer } from "./component/renderer/RayRenderer.ts";
import { Opt } from "../lib/types.ts";
import { window_alert, window_open } from "../lib/window.ts";
import Movement from "./scripts/Movement.ts";
import Mathf from "./primitives/Mathf.ts";
import Sun from "./scripts/Sun.ts";
import Dummy from "./scripts/Dummy.ts";
import BoundingBoxRenderer from "./component/renderer/BoundingBoxRenderer.ts";
import Editor from "./editor/Editor.ts";



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
    projectionMatrix = glm.perspective(glm.radians(35.0), aspectRatio, 0.1, 500);
}

const context = _viewport?.getContext("webgl2");
if (!is(context)) {
    throw new Error("Could not load WebGL context");
}

export const gl = context;

resizeViewport();
window.addEventListener("resize", resizeViewport);



export let mainScene: Scene = new Scene();

const defaultCameraObject = new GameObject("default_camera");

defaultCameraObject.transform
    .setRotation(Quaternion.eulerDegrees(15, 0, 0))
    .setPosition(glm.vec3(0, 1, 0));

mainScene.setActiveCamera(
    defaultCameraObject.addComponent(Camera)
);

defaultCameraObject.addComponent(Movement);



const rayGameObject = new GameObject("ray");
const ray = rayGameObject.addComponent(RayRenderer);



async function init() {
    await MaterialSource.load(MaterialSource.getDefaultMaterial());

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const suzanne = await mainScene.loadGameObject("suzanne", Path.from("/models/Suzanne.obj"));
    suzanne.transform
        .setPosition(glm.vec3(1, 0, 3))
        .setRotation(Quaternion.eulerDegrees(-50, 180, 60));

    suzanne.addComponent(Dummy);

    const teapot = await mainScene.loadGameObject("teapot", Path.from("/models/Cube.obj"));
    teapot.addComponent(Sun);
    teapot.transform
        .setPosition(glm.vec3(0.0, 5.0, 5.0))
        .setScale(glm.vec3(0.5, 0.5, 0.5));
}

export let time: number = 0;
export let deltaTime: number = 0;



type Key = {
    pressedToggle: boolean,
    held: boolean
};

export const keyboard: Record<string, Opt<Key>> = {}

function getKey(key: string): Key {
    if (is(keyboard[key])) {
        return keyboard[key];
    }

    const k = {
        pressedToggle: false,
        held: false
    };

    keyboard[key] = k;
    return k;
}



async function update() {
    const now = Date.now() / 1000;
    deltaTime = now - time;
    time = now;

    mainScene.update();
}

async function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mainScene.render();
}

viewport.addEventListener("contextmenu", event => {
    const camera = mainScene.getActiveCamera();
    if (!is(camera)) {
        return;
    }

    const mouseRay = camera.screenPositionToWorldRay(glm.vec2(event.clientX, event.clientY));
    const hit = mouseRay.cast(mainScene);
    if (!is(hit)) {
        return;
    }

    window_open(Editor.createWindow(hit));
    event.preventDefault();
});

viewport.addEventListener("click", async () => {
    await _viewport.requestPointerLock();
    _viewport.focus();
});

window.addEventListener("keyup", event => {
    if (event.key !== "F5") {
        event.preventDefault();
    }

    if (event.key.toLowerCase() === 's' && event.ctrlKey) {
        window_alert("Saved", { isDraggable: true, isMinimizable: true }).then();
    }

    const key = getKey(event.key.toLowerCase());
    key.held = false;
    key.pressedToggle = !key.pressedToggle;
});

window.addEventListener("keydown", event => {
    if (event.key !== "F5") {
        event.preventDefault();
    }

    if (event.key.toLowerCase() === 's' && event.ctrlKey) {
        return;
    }

    const key = getKey(event.key.toLowerCase());
    key.held = true;
});



const play = $(".play");
const pause = $(".pause");
const timeInput = $<HTMLInputElement>(".time-input > input");

if (is(timeInput)) {
    timeInput.value = String(0.25);
    timeInput.addEventListener("input", () => {
        mainScene
            .getTime()
            .setDayTime(Number(timeInput.value));
    });

    timeInput.addEventListener("pointerdown", event => {
        timeInput.setPointerCapture(event.pointerId);
        pause?.click();
    });

    timeInput.addEventListener("pointerup", event => {
        timeInput.releasePointerCapture(event.pointerId);
        play?.click();
    });
}

if (is(play) && is(pause)) {
    let timeScale = mainScene.getTime().scale;
    play.classList.add("hide");

    play.addEventListener("click", () => {
        pause.classList.remove("hide");
        play.classList.add("hide");
        mainScene.getTime().scale = timeScale;
    });

    pause.addEventListener("click", () => {
        play.classList.remove("hide");
        pause.classList.add("hide");

        if (timeScale > 0.000001 && mainScene.getTime().scale > 0.000001) {
            timeScale = mainScene.getTime().scale;
        }

        mainScene.getTime().scale = 0;
    });

    pause.click();
    mainScene.getTime().setDayTime(0.25);
}



let frame = 1;
let frameStart = 0;

export function areStatsHidden(): boolean {
    return !(keyboard["f3"]?.pressedToggle ?? false) || Date.now() - frameStart < 1000;
}

let u = 0;
let r = 0;
let fps = 0;
const stats = $('.stats');
const statsUpdate = $('.stats .update');
const statsRender = $('.stats .render');
const statsFps = $('.stats .fps');
function frameCallback(): void {
    const statsHidden = !(keyboard["f3"]?.pressedToggle ?? false);
    stats?.classList.toggle('hide', statsHidden);

    const startUpdate = Date.now();
    update()
        .then(async () => {
            const postUpdate = Date.now();
            const renderStats = postUpdate - frameStart >= 1000 && !statsHidden;
            u += Math.round(postUpdate - startUpdate);

            if (is(statsUpdate) && renderStats) {
                statsUpdate.textContent = 'update: ' + Mathf.round(u / frame, 2) + "ms";
            }

            const startRender = postUpdate;
            await render();
            const postRender = Date.now();
            r += Math.round(postRender - startRender);
            fps += Math.round(1000 / Math.round(postRender - startUpdate));

            if (is(statsRender) && renderStats) {
                statsRender.textContent = 'render: ' + Mathf.round(r / frame, 2) + "ms";
            }

            if (is(statsFps) && renderStats) {
                statsFps.textContent = Mathf.round(fps / frame, 2)  + " fps";
            }

            if (postUpdate - frameStart >= 1000) {
                frameStart = postRender;
                frame = u = r = fps = 0;
            }

            frame++;
            requestAnimationFrame(frameCallback);
        });
}

init().then(() => {
    frameCallback();
});
