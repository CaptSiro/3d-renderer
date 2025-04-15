import { $, is } from "../lib/jsml/jsml.ts";
import { Mat4, Vec3 } from "./types";
import Scene from "./object/Scene.ts";
import MaterialSource from "./resource/material/MaterialSource.ts";
import { window_open } from "../lib/window.ts";
import Keyboard from "./input/Keyboard.ts";
import State from "./object/State.ts";
import MathLib from "./utils/MathLib.ts";
import devScene_loader from "../assets/scenes/dev-scene.ts";
import Movement from "./component/Movement.ts";

declare global {
    const glm: {
        lookAt(...a: any[]): any,
        vec3(...a: any[]): Vec3,
        normalize(...a: any[]): any,
        dot(...a: any[]): any,
        cross(...a: any[]): any,
        radians(x: number): number,
    } | any;
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



export let mainScene: Scene = new Scene('default_scene');



async function init() {
    Keyboard.init();
    Keyboard.register({
        key: "F3",
        onPress: () => State.isStatisticScreenOpened = !State.isStatisticScreenOpened,
        preventDefault: true,
        stopPropagation: true
    });
    Keyboard.register({
        key: "F1",
        onPress: () => window_open(mainScene.getSettingsEditorWindow()),
        preventDefault: true,
        stopPropagation: true
    });
    Keyboard.register({
        key: "F2",
        onPress: () => window_open(mainScene.getGameObjectsWindow()),
        preventDefault: true,
        stopPropagation: true
    });
    Keyboard.register({
        key: "f",
        onPress: () => State.isBoundingBoxRenderingEnabled = !State.isBoundingBoxRenderingEnabled,
        preventDefault: true,
    });

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    mainScene.delete();
    mainScene = await devScene_loader();
}



async function update() {
    mainScene.update();
}

async function render() {
    const c = 0.09019607843137255;
    gl.clearColor(c, c, c, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mainScene.render();
}



viewport.addEventListener("contextmenu", event => {
    const camera = mainScene.getActiveCamera();
    if (!is(camera)) {
        return;
    }

    event.preventDefault();
    const mouseRay = camera.screenPositionToWorldRay(glm.vec2(event.clientX, event.clientY));
    const hit = mouseRay.cast(mainScene);
    if (!is(hit.closest)) {
        window_open(camera.gameObject.getEditorWindow());
        return;
    }

    window_open(hit.closest.getEditorWindow());
});

viewport.addEventListener("click", async () => {
    const camera = mainScene.getActiveCamera();
    if (!is(camera) || !camera.gameObject.hasComponent(Movement)) {
        return;
    }

    await _viewport.requestPointerLock();
    _viewport.focus();
});



export const play = $(".play");
export const pause = $(".pause");
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
    return State.isStatisticScreenOpened || Date.now() - frameStart < 1000;
}

let u = 0;
let r = 0;
let fps = 0;
const stats = $('.stats');
const statsUpdate = $('.stats .update');
const statsRender = $('.stats .render');
const statsFps = $('.stats .fps');
function frameCallback(): void {
    const statsHidden = !State.isStatisticScreenOpened;
    stats?.classList.toggle('hide', statsHidden);

    const startUpdate = Date.now();
    update()
        .then(async () => {
            const postUpdate = Date.now();
            const renderStats = postUpdate - frameStart >= 1000 && !statsHidden;
            u += Math.round(postUpdate - startUpdate);

            if (is(statsUpdate) && renderStats) {
                statsUpdate.textContent = 'update: ' + MathLib.round(u / frame, 2) + "ms";
            }

            const startRender = postUpdate;
            await render();
            const postRender = Date.now();
            r += Math.round(postRender - startRender);
            fps += Math.round(1000 / Math.round(postRender - startUpdate));

            if (is(statsRender) && renderStats) {
                statsRender.textContent = 'render: ' + MathLib.round(r / frame, 2) + "ms";
            }

            if (is(statsFps) && renderStats) {
                statsFps.textContent = MathLib.round(fps / frame, 2)  + " fps";
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
