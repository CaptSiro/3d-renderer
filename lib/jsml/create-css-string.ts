import camelToKebab from "./camel-to-kebab.js";



export function createCSSString(styles: Record<string, any>): string {
    let buffer = "";

    for (const key in styles) {
        buffer += `${camelToKebab(key)}: ${styles[key]};`;
    }

    return buffer;
}