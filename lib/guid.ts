const GUID_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const guids = new Set();



function random(from: number, to: number): number {
    return Math.random() * (Math.max(from, to) - Math.min(from, to)) + from;
}

export function guid(forceFirstLetter: boolean = false, length: number = 8): string {
    let id;
    const MAX_RETRIES = 10_000;
    let retry = 0;

    do {
        do {
            id = "";
            id += GUID_CHARSET[Math.floor(random(0, GUID_CHARSET.length))];
        } while (forceFirstLetter && !/^[a-zA-Z]$/.test(id));

        for (let i = 0; i < length - 1; i++) {
            id += GUID_CHARSET[Math.floor(random(0, GUID_CHARSET.length))];
        }

        if (++retry === MAX_RETRIES) break;
    } while (guids.has(id));

    if (retry === MAX_RETRIES) {
        return guid(forceFirstLetter, length + 1);
    }

    guids.add(id);
    return id;
}

export function freeGuid(id: string): void {
    guids.delete(id);
}