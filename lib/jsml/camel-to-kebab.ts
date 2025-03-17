export default function camelToKebab(string: string): string {
    let buffer = "";

    for (let i = 0; i < string.length; i++) {
        if (string[i] === string[i].toUpperCase()) {
            buffer += "-" + string[i].toLowerCase();
            continue;
        }

        buffer += string[i];
    }

    return buffer;
}