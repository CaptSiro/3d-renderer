import { editor, getEditor } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import { ModalWindow, window_create } from "../../lib/window.ts";
import jsml, { $, is } from "../../lib/jsml/jsml.ts";



export default class State {
    public static isStatisticScreenOpened: boolean = false;
    public static isBoundingBoxRenderingEnabled: boolean = false;

    @editor(BooleanEditor)
    public static doCameraSwitching: boolean = true;

    @editor(BooleanEditor)
    public static doRenderSky: boolean = false;

    @editor(BooleanEditor)
    public static doRenderGrid: boolean = true;



    public static getEditorWindow(): ModalWindow {
        const id = "__application-state";
        const window = $<HTMLDivElement>("#" + id);
        if (is(window)) {
            return window;
        }

        const content = jsml.div("editor-content");
        const w = window_create(
            "State",
            content,
            {
                isDraggable: true,
                isMinimizable: true,
                isResizable: true,
                width: "400px"
            }
        );

        const componentContent = jsml.div("component-content");

        for (const key of Object.keys(State)) {
            const editor = getEditor(w, State, key);
            if (!is(editor)) {
                continue;
            }

            componentContent.append(editor.html());
        }

        content.append(
            jsml.div("component no-hr", [
                componentContent
            ])
        );

        w.id = id;

        w.addEventListener("keydown", event => event.stopPropagation());
        w.addEventListener("keyup", event => event.stopPropagation());
        w.addEventListener("keypress", event => event.stopPropagation());

        return w;
    }
}