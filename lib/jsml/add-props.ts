import type { Props } from "./jsml.js";
import camelToKebab from "./camel-to-kebab.js";
import { createCSSString } from "./create-css-string.js";



/**
 * Add properties to element. The names of the props object directly correspond to the HTML attributes that are going to be set.
 * Use `on[event-name]` property to set event handlers
 *
 * @param element
 * @param props
 */
export default function addProps(element: HTMLElement, props: Props | string): void {
    if (typeof props === "string") {
        return;
    }

    if (props === undefined) {
        return;
    }

    if (props.style !== undefined) {
        element.setAttribute("style", createCSSString(props.style));
        delete props.style;
    }

    for (const key in props) {
        if (key[0] === "o" && key[1] === "n") {
            element.addEventListener(key.substring(2).toLowerCase(), props[key]);
            continue;
        }

        if (typeof props[key] === "boolean") {
            element.toggleAttribute(key.substring(Number(key[0] === "\\")), props[key]);
            return;
        }

        element.setAttribute(
            camelToKebab(key.substring(Number(key[0] === "\\"))),
            String(props[key])
        );
    }
}