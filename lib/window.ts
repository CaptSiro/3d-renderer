import { Opt } from "./types.ts";
import jsml, { $, _, Icon, is } from "./jsml/jsml.ts";



const EVENT_WINDOW_OPENED = 'windowOpened';
const EVENT_WINDOW_CLOSED = 'windowClosed';



let windowOverlay: Opt<HTMLElement>;
let windowOverlayActive: Opt<HTMLElement>;
let isWindowModuleLoaded = false;
const queue: { fn: (element: HTMLElement) => void, arg: HTMLElement }[] = [];

window.addEventListener('load', () => {
    windowOverlay = jsml.div('window-overlay');
    windowOverlayActive = jsml.div('window-overlay-active');

    document.body.append(windowOverlay, windowOverlayActive);
    isWindowModuleLoaded = true;

    for (const backlog of queue) {
        backlog.fn(backlog.arg);
    }

    queue.length = 0;
});



export function window_open(element: HTMLElement): void {
    if (!isWindowModuleLoaded) {
        queue.push({
            fn: window_open,
            arg: element
        });
        return;
    }

    window_maximize(element);
    element.style.left = "50%";
    element.style.top = "50%";

    element.classList.remove('hide');
    element.dispatchEvent(new CustomEvent(EVENT_WINDOW_OPENED));
    windowOverlayActive?.appendChild(element);
}

function window_move(element: HTMLElement, x: number, y: number): void {
    element.style.left = String(x / window.innerWidth * 100) + "%";
    element.style.top = String(y / window.innerHeight * 100) + "%";
}


export function window_minimize(
    element: HTMLElement,
    maximize: Opt<HTMLElement> = undefined,
    minimize: Opt<HTMLElement> = undefined
): void {
    if (!isWindowModuleLoaded) {
        queue.push({
            fn: window_minimize,
            arg: element
        });
        return;
    }

    const content = $(".content", element);
    if (!is(content)) {
        return;
    }

    const rect = element.getBoundingClientRect();
    content.classList.add('hide');
    const after = element.getBoundingClientRect();

    window_move(element, rect.x + after.width / 2, rect.y + after.height / 2);

    minimize ??= $('.minimize', element);
    maximize ??= $('.maximize', element);

    if (!is(minimize) || !is(maximize)) {
        return;
    }

    minimize.classList.add('hide');
    maximize.classList.remove('hide');
}

export function window_maximize(
    element: HTMLElement,
    maximize: Opt<HTMLElement> = undefined,
    minimize: Opt<HTMLElement> = undefined
): void {
    if (!isWindowModuleLoaded) {
        queue.push({
            fn: window_minimize,
            arg: element
        });
        return;
    }

    const content = $(".content", element);
    if (!is(content)) {
        return;
    }

    const rect = element.getBoundingClientRect();
    content.classList.remove('hide');
    const after = element.getBoundingClientRect();

    window_move(element, rect.x + after.width / 2, rect.y + after.height / 2);

    minimize ??= $('.minimize', element);
    maximize ??= $('.maximize', element);

    if (!is(minimize) || !is(maximize)) {
        return;
    }

    maximize.classList.add('hide');
    minimize.classList.remove('hide');
}



export function window_close(element: HTMLElement) {
    if (!isWindowModuleLoaded) {
        queue.push({
            fn: window_close,
            arg: element
        });
        return;
    }

    element.classList.add('hide');
    windowOverlay?.appendChild(element);
    element.dispatchEvent(new CustomEvent(EVENT_WINDOW_CLOSED));

    window.onbeforeunload = null;
}

export function window_requestAction(id: string, action: "close" | "open") {
    const w = $("#" + id);
    if (w === null) {
        return;
    }

    switch (action) {
        case 'close': {
            window_close(w);
            break;
        }

        case 'open': {
            window_open(w);
            break;
        }
    }
}



export function window_addDraggable(element: HTMLElement): void {
    element.classList.add('draggable');

    const head = $(".head", element);
    if (!is(head)) {
        return;
    }

    let isDragging = false;
    let start: Opt<DOMRect>;
    let offsetX: Opt<number>;
    let offsetY: Opt<number>;

    head.addEventListener('pointerdown', event => {
        isDragging = true;

        start = element.getBoundingClientRect();
        offsetX = event.clientX - start.x;
        offsetY = event.clientY - start.y;

        head.setPointerCapture(event.pointerId);
    });

    head.addEventListener('pointerup', event => {
        isDragging = false;

        head.releasePointerCapture(event.pointerId);
    });

    head.addEventListener('pointermove', event => {
        if (!isDragging || !is(offsetX) || !is(offsetY) || !is(start)) {
            return;
        }

        const x = event.clientX - offsetX + start.width / 2;
        const y = event.clientY - offsetY + start.height / 2;

        window_move(element, x, y);
    });

    $(".controls", head)?.addEventListener('pointerdown', event => {
        event.stopImmediatePropagation();
    });
}



export function window_init(element: HTMLElement): void {
    if (!isWindowModuleLoaded) {
        queue.push({
            fn: window_init,
            arg: element
        });

        return;
    }

    if (!element.parentElement?.classList.contains("window-overlay-active")) {
        windowOverlay?.appendChild(element);
        element.classList.add('hide');
    }

    if (Boolean(element.dataset.windowDraggable)) {
        window_addDraggable(element);
    }

    $('.close', element)?.addEventListener('click', () => {
        window_close(element);
    });

    const minimize = $('.minimize', element);
    const maximize = $('.maximize', element);

    if (!is(minimize) || !is(maximize)) {
        return;
    }

    minimize.classList.remove('hide');
    maximize.classList.add('hide');

    minimize.addEventListener('click', () => {
        window_minimize(element, maximize, minimize);
    });

    maximize.addEventListener('click', () => {
        window_maximize(element, maximize, minimize);
    });
}



export type WindowSettings = {
    isDraggable?: boolean,
    isMinimizable?: boolean,
    isResizable?: boolean,
    width?: string,
    height?: string,
}

export function window_create(title: string, content: any, settings: WindowSettings = {}): HTMLDivElement {
    const controls = [
        jsml.button("close", Icon("nf-fa-close"))
    ];

    if (settings.isMinimizable === true) {
        controls.unshift(
            jsml.button("minimize", Icon("nf-fa-window_minimize")),
            jsml.button("maximize", Icon("nf-fa-window_maximize")),
        );
    }

    const w = jsml.div({
        class: "window hide",
    }, [
        jsml.div("head", [
            jsml.span(_, title),
            jsml.div("controls", controls)
        ]),
        jsml.div("content", content)
    ]);

    w.style.width = settings.width ?? "300px";
    w.style.height = settings.height ?? "unset";

    if (settings.isDraggable === true) {
        w.dataset.windowDraggable = "true";
    }

    window_init(w);
    return w;
}



export function window_alert(message: string, settings: WindowSettings = {}): Promise<void> {
    return new Promise(resolve => {
        const w = window_create(
            "Alert",
            jsml.div("text-window", [
                jsml.h3(_, message),
                jsml.div("controls",
                    jsml.button({
                        onClick: () => window_close(w)
                    }, 'Ok')
                )
            ]),
            settings
        );

        w.addEventListener(EVENT_WINDOW_CLOSED, () => resolve(undefined));
        window_open(w);
    });
}



export function window_confirm(message: string, settings: WindowSettings = {}): Promise<boolean> {
    return new Promise(resolve => {
        let result = false;

        const w = window_create(
            "Confirm",
            jsml.div("text-window", [
                jsml.h3(_, message),
                jsml.div("controls", [
                    jsml.button({
                        onClick: () => {
                            result = true;
                            window_close(w);
                        }
                    }, 'Ok'),

                    jsml.button({
                        onClick: () => {
                            window_close(w);
                        }
                    }, 'Cancel'),
                ])
            ]),
            settings
        );

        w.addEventListener(EVENT_WINDOW_CLOSED, () => resolve(result));
        window_open(w);
    });
}
