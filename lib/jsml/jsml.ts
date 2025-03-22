import addContent from "./add-content.js";
import addProps from "./add-props.js";
import { Opt } from "../types.ts";



export type JSML = {
    [key in keyof HTMLElementTagNameMap]: (props?: any, content?: any) => HTMLElementTagNameMap[key];
};

export type Content = string | Node | ArrayLike<HTMLElement | Node | string> | HTMLElement[] | HTMLCollection | undefined;
export type Props = ({
    [key: string]: ((event: Event) => any) | any
} & {
    style?: Partial<CSSStyleDeclaration>
}) | undefined



export const _ = undefined;



const jsml = new Proxy({}, {
    get(_, tag: keyof HTMLElementTagNameMap) {
        return (props: Props | string, content: Content) => {
            if (props instanceof HTMLElement) {
                console.error(`Can not use HTMLElement as options. Caught at: ${String(tag)}`);
                return document.createElement(String(tag));
            }

            const element = document.createElement(tag);

            if (typeof props === "string") {
                element.className = String(props);
            } else if (props !== undefined && "class" in props) {
                element.className = String(props.class);
                delete props.class;
            }

            addProps(element, props);
            addContent(element, content);

            return element;
        }
    }
}) as JSML;



export default jsml;


export function $<T extends HTMLElement = HTMLElement>(query: string, root: HTMLElement|Document = document): T|null {
    return root.querySelector(query);
}

export function $$(query: string, root: HTMLElement|Document = document): NodeList {
    return root.querySelectorAll(query);
}

export function is<T>(x: T|null|undefined): x is T {
    return x !== undefined && x !== null;
}

export function assert<T>(x: Opt<T>): T {
    if (!is(x)) {
        throw new Error("Is-Assertion failed x does not have defined value");
    }

    return x;
}

export function Icon(nf: string): HTMLElement {
    return jsml.i('nf ' + nf);
}

