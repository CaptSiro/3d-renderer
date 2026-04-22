import { EVENT_WINDOW_CLOSED, EVENT_WINDOW_OPENED, ModalWindow, window_create } from "../lib/window.ts";
import jsml, { $, _, is } from "../lib/jsml/jsml.ts";
import Editor from "./editor/Editor.ts";



export const LS_KEY_HELP_WINDOW_OPENED = "hw";

export default function HelpWindow(): ModalWindow {
    const id = "help-window";
    const win = $<ModalWindow>("#" + id);
    if (is(win)) {
        return win;
    }

    const w = window_create(
        "Help",
        jsml.div("help-content", [
            jsml.h3(_, "General"),

            jsml.div("description", ["Dynamic cameras are controllable after clicking on the screen thus entering ",
                jsml.b(_, "Dynamic View"),
            ]),

            jsml.div("divider"),
            jsml.div("description", "Picking can be done outside Dynamic View with right mouse button. Successful picking will result in showing editor window for selected object"),

            jsml.div("divider"),
            jsml.h3(_, "Keyboard shortcuts"),

            HelpWindow_Shortcut("CTRL + H", "Show help (this window)"),
            HelpWindow_Shortcut("F1", "Show scene settings"),
            HelpWindow_Shortcut("F2", "Show scene graph (only the top level objects)"),
            HelpWindow_Shortcut("F3", "Debug statistics"),
            HelpWindow_Shortcut("1", "Dynamic camera"),
            HelpWindow_Shortcut("2-4", "Switch to static camera"),
            HelpWindow_Shortcut("F", "Show hit-boxes"),

            jsml.div("divider"),
            jsml.h3(_, "Dynamic View"),
            HelpWindow_Shortcut("W", "Go forward"),
            HelpWindow_Shortcut("A", "Go left"),
            HelpWindow_Shortcut("S", "Go backwards"),
            HelpWindow_Shortcut("D", "Go right"),
            HelpWindow_Shortcut("SPACE", "Go up"),
            HelpWindow_Shortcut("SHIFT", "Go down"),
            HelpWindow_Shortcut("ESC", "Exit Dynamic View"),
        ]),
        {
            isDraggable: true,
            isMinimizable: true,
            isResizable: true,
            width: "400px"
        }
    );

    w.addEventListener(EVENT_WINDOW_CLOSED, () => {
        localStorage.setItem(LS_KEY_HELP_WINDOW_OPENED, String(false));
    });

    w.addEventListener(EVENT_WINDOW_OPENED, () => {
        localStorage.setItem(LS_KEY_HELP_WINDOW_OPENED, String(true));
    });

    return Editor.initWindow(w, id);
}

export function HelpWindow_wasOpen(): boolean {
    return JSON.parse(localStorage.getItem(LS_KEY_HELP_WINDOW_OPENED) ?? "true");
}

function HelpWindow_Shortcut(key: string, description: string): HTMLElement {
    return jsml.div("shortcut", [
        jsml.span("key", key),
        jsml.span("description", description)
    ]);
}