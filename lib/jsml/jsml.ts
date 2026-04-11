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

/**
 * Shorthand for root.querySelector(query)
 */
export function $<T extends HTMLElement = HTMLElement>(query: string, root: HTMLElement|Document = document): T|null {
    return root.querySelector(query);
}

/**
 * Shorthand for root.querySelectorAll(query)
 */
export function $$(query: string, root: HTMLElement|Document = document): NodeList {
    return root.querySelectorAll(query);
}

/**
 * Checks if variable is defined (x !== undefined && x !== null)
 */
export function is<T>(variable: T|null|undefined): variable is T {
    return variable !== undefined && variable !== null;
}

/**
 * Asserts that variable is defined and throws Error if it is not defined
 */
export function assert<T>(variable: Opt<T>): T {
    if (!is(variable)) {
        throw new Error("Is-Assertion failed x does not have defined value");
    }

    return variable;
}

/**
 * Optionally returns content if condition is met
 */
function Optional(condition: boolean, content: Content): Opt<Content> {
    return condition
        ? content
        : undefined;
}

export function Icon(nf: string, alt: Opt<string> = null): HTMLElement {
    return jsml.i(
        'nf ' + nf,
        Optional(is(alt), jsml.span(_, alt))
    );
}

class IconElement extends HTMLElement {
    static observedAttributes = ['src', 'placeholder'];

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = '';

        const src = this.getAttribute('src');
        const placeholder = this.getAttribute('placeholder');

        if (!is(src)) {
            return;
        }

        this.appendChild(Icon(src, placeholder));
    }
}

customElements.define('x-icon', IconElement);
