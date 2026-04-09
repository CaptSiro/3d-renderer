import { Opt } from "./types.ts";



export type ThrottledFunction<F extends (...args: any[]) => any> = (
    ...args: Parameters<F>
) => number;
export type ThrottleCancel = () => void;

/**
 * Wraps `fn` in throttled function. Calling this function will ignore and skip all calls until the initial call is
 * resolved. Afterward the function will not go back to skipped calls and "waits" for next call
 *
 * @param fn
 * @param ms
 */
export default function throttle<F extends (...args: any[]) => any>(
    fn: F,
    ms: number,
): [(...args: any[]) => Opt<number>, () => void] {
    let timeout: number | undefined = undefined;

    return [
        (...args) => {
            if (timeout !== undefined) {
                return timeout;
            }

            timeout = setTimeout(() => {
                const got = fn(...args);

                if (got instanceof Promise) {
                    got.then(() => {
                        timeout = undefined;
                    });

                    return;
                }

                timeout = undefined;
            }, ms);

            return timeout;
        },
        () => clearTimeout(timeout),
    ];
}
