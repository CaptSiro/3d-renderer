import { Opt } from "./types.ts";
import jsml, { $, _, Icon, is } from "./jsml/jsml.ts";



export type ModalWindow = HTMLDivElement;

export const EVENT_WINDOW_FOCUSED = 'windowFocused';
export const EVENT_WINDOW_OPENED = 'windowOpened';
export const EVENT_WINDOW_CLOSED = 'windowClosed';
export const EVENT_WINDOW_MINIMIZED = 'windowMinimized';
export const EVENT_WINDOW_MAXIMIZED = 'windowMaximized';



let windowOverlay: Opt<HTMLElement>;
let windowOverlayActive: Opt<HTMLElement>;
let isWindowModuleLoaded = false;

// Function can be called even though the window has not been fully loaded yet
const queue: { fn: (element: HTMLElement) => void, arg: HTMLElement }[] = [];

window.addEventListener('load', () => {
    windowOverlay = jsml.div('window-overlay');
    windowOverlayActive = jsml.div('window-overlay-active');

    document.body.append(windowOverlay, windowOverlayActive);
    isWindowModuleLoaded = true;

    // Resolve functions that need window to be loaded
    for (const backlog of queue) {
        backlog.fn(backlog.arg);
    }

    queue.length = 0;
});



/**
 * Shows window root element to the user and dispatch custom `EVENT_WINDOW_OPENED` event on the element
 * @see {EVENT_WINDOW_OPENED}
 */
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

    element.style.animationName = "window-open";

    const timeoutId = element.dataset.windowCloseTimeout;
    if (!is(timeoutId)) {
        return;
    }

    element.dataset.windowCloseTimeout = undefined;
    clearTimeout(Number(timeoutId));
}

export function window_isOpened(element: ModalWindow): boolean {
    return !element.classList.contains("hide");
}

function window_move(element: HTMLElement, x: number, y: number): void {
    element.style.left = String(x / window.innerWidth * 100) + "%";
    element.style.top = String(y / window.innerHeight * 100) + "%";
}



function window_minmax(minmax: Opt<HTMLElement>, isMinimized: boolean): void {
    if (!is(minmax)) {
        return;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "white");
    path.setAttribute("stroke-width", "16");
    path.setAttribute("fill", "transparent");

    path.setAttribute("d", isMinimized
        ? "M 0 0 L 0 100 L 100 100 L 100 0 L 0 0"
        : "M 0 50 L 100 50");

    minmax.textContent = "";
    minmax.append(path);
}

/**
 * Hides content of the window still shows title bar and dispatch custom `EVENT_WINDOW_MINIMIZED` event on the element
 * @see {EVENT_WINDOW_MINIMIZED}
 */
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
    element.style.height = "unset";
    const after = element.getBoundingClientRect();

    // Move the title bar now that the content is hidden
    window_move(element, rect.x + after.width / 2, rect.y + after.height / 2);

    window_minmax($(".minmax", element), true);
    // minimize ??= $('.minimize', element);
    // maximize ??= $('.maximize', element);
    //
    // if (!is(minimize) || !is(maximize)) {
    //     return;
    // }

    // minimize.classList.add('hide');
    // maximize.classList.remove('hide');
    element.dispatchEvent(new CustomEvent(EVENT_WINDOW_MINIMIZED));
}

/**
 * Shows content of the window and dispatch custom `EVENT_WINDOW_MAXIMIZED` event on the element
 * @see {EVENT_WINDOW_MAXIMIZED}
 */
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
    element.style.height = element.dataset.height ?? "unset";
    const after = element.getBoundingClientRect();

    // Move the title bar now that the content is show
    window_move(element, rect.x + after.width / 2, rect.y + after.height / 2);

    // minimize ??= $('.minimize', element);
    // maximize ??= $('.maximize', element);
    //
    // if (!is(minimize) || !is(maximize)) {
    //     return;
    // }

    window_minmax($(".minmax", element), false);
    // maximize.classList.add('hide');
    // minimize.classList.remove('hide');
    element.dispatchEvent(new CustomEvent(EVENT_WINDOW_MAXIMIZED));
}



/**
 * Close the window and dispatch custom `EVENT_WINDOW_CLOSED` event on the element
 * @see {EVENT_WINDOW_CLOSED}
 */
export function window_close(element: HTMLElement) {
    if (!isWindowModuleLoaded) {
        queue.push({
            fn: window_close,
            arg: element
        });
        return;
    }

    element.style.animationName = "window-close";

    element.dataset.windowCloseTimeout = String(setTimeout(() => {
        element.dataset.windowCloseTimeout = undefined;
        element.classList.add('hide');
        windowOverlay?.appendChild(element);
        element.dispatchEvent(new CustomEvent(EVENT_WINDOW_CLOSED));
    }, 250));
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
        jsml.button("close", Icon("nf-fa-close", 'X'))
    ];

    if (settings.isMinimizable === true) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");
        svg.classList.add("minmax");

        let isMinimized = false;
        controls.unshift(
            jsml.button({
                onClick: (event: Event) => {
                    const target = event.target
                    if (!(target instanceof Element)) {
                        return;
                    }

                    const win = target.closest(".window");
                    if (!(win instanceof HTMLElement)) {
                        return;
                    }

                    if (isMinimized) {
                        window_maximize(win);
                    } else {
                        window_minimize(win);
                    }

                    isMinimized = !isMinimized;
                }
            }, svg),
            // jsml.button("minimize", Icon("nf-fa-window_minimize", '_')),
            // jsml.button("maximize", Icon("nf-fa-window_maximize", '[]')),
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

    w.dataset.width = w.style.width = settings.width ?? "300px";
    w.dataset.height = w.style.height = settings.height ?? "unset";

    if (settings.isDraggable === true) {
        w.dataset.windowDraggable = "true";
    }

    window_init(w);
    return w;
}



/**
 * @returns {Promise<void>} Resolves when the user closes the window
 */
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



/**
 * @returns {Promise<void>} Resolves when the user selects their answer. Closing the window resolves as false
 */
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
