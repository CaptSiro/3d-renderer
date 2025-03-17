import type { Content } from "./jsml.js";



export default function addContent(element: HTMLElement, content: Content): void {
    if (content === undefined) {
        return;
    }

    if (typeof content === "string") {
        element.textContent = content;
        return;
    }

    if (content instanceof Node) {
        element.append(content);
        return;
    }

    if (content instanceof Array) {
        for (const node of content) {
            if (node instanceof Node || typeof node === "string") {
                element.append(node);
            }
        }
    }
}