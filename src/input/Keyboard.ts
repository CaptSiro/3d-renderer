import { assert, is } from "../../lib/jsml/jsml.ts";
import { Vec3 } from "../types.ts";
import Vector3 from "../primitives/Vector3.ts";



type KeyboardModifiers = "ctrl" | "shift" | "alt";

export type KeyboardRegister = {
    onPress?: () => any,
    onDown?: () => any,
    onUp?: () => any,
    key: KeyboardEvent["key"],
    modifiers?: KeyboardModifiers[],
    preventDefault?: boolean,
    stopPropagation?: boolean,
};

export type MovementDirection = "forward" | "backwards" | "left" | "right" | "up" | "down";
export type MovementVectorDescription = Record<KeyboardEvent["key"], MovementDirection>;

export const wasdMovementVectorDescription: MovementVectorDescription = {
    "w": "forward",
    "s": "backwards",
    "a": "left",
    "d": "right",
    " ": "up",
    "shift": "down",
};
export const arrowMovementVectorDescription: MovementVectorDescription = {
    "ArrowUp": "forward",
    "ArrowDown": "backwards",
    "ArrowLeft": "left",
    "ArrowRight": "right",
    " ": "up",
    "shift": "down",
};

export default class Keyboard {
    public static registers: Map<string, KeyboardRegister[]> = new Map();

    public static register(register: KeyboardRegister): void {
        const hit = Keyboard.registers.get(register.key);
        if (!is(hit)) {
            Keyboard.registers.set(register.key.toLowerCase(), [register]);
            return;
        }

        hit.push(register);
    }



    public static movementVectorDescription: MovementVectorDescription = wasdMovementVectorDescription;
    private static movementVector: Vec3 = new Array(6).fill(glm.vec3(0, 0, 0));

    public static getMovementVector(): Vec3 {
        const v = glm.vec3(0, 0, 0);

        for (const direction of Keyboard.movementVector) {
            v.x += direction.x;
            v.y += direction.y;
            v.z += direction.z;
        }

        return glm.normalize(v);
    }

    private static addMovementDirection(direction: MovementDirection, type: "down" | "up"): void {
        let index;
        let v: Vec3;

        switch (direction) {
            case "forward": {
                index = 0;
                v = Vector3.FORWARD;
                break;
            }
            case "backwards": {
                index = 1;
                v = Vector3.FORWARD ["*"] (-1);
                break;
            }
            case "left": {
                index = 2;
                v = Vector3.LEFT;
                break;
            }
            case "right": {
                index = 3;
                v = Vector3.LEFT ["*"] (-1);
                break;
            }
            case "up": {
                index = 4;
                v = Vector3.UP;
                break;
            }
            case "down": {
                index = 5;
                v = Vector3.UP ["*"] (-1);
                break;
            }
        }

        Keyboard.movementVector[index] = type === "up"
            ? glm.vec3(0, 0, 0)
            : v;
    }



    public static handle(event: KeyboardEvent, type: "down" | "up" | "press"): void {
        const isMovementDirectionEvent = event.key in Keyboard.movementVectorDescription
            || event.key.toLowerCase() in Keyboard.movementVectorDescription;

        if (type !== "press" && isMovementDirectionEvent) {
            const direction = event.key in Keyboard.movementVectorDescription
                ? Keyboard.movementVectorDescription[event.key]
                : Keyboard.movementVectorDescription[event.key.toLowerCase()]

            Keyboard.addMovementDirection(direction, type);
        }

        const registers = Keyboard.registers.get(event.key.toLowerCase());
        if (!is(registers)) {
            return;
        }

        for (const register of registers) {
            if (register.key.toLowerCase() !== event.key.toLowerCase()) {
                continue;
            }

            const requirementCtrlKeyNotMet = (register.modifiers?.includes("ctrl") ?? false) && !event.ctrlKey;
            const requirementShiftKeyNotMet = (register.modifiers?.includes("shift") ?? false) && !event.shiftKey;
            const requirementAltKeyNotMet = (register.modifiers?.includes("alt") ?? false) && !event.altKey;

            if (requirementCtrlKeyNotMet || requirementShiftKeyNotMet || requirementAltKeyNotMet) {
                continue;
            }

            const registerModifierCount = register.modifiers?.length ?? 0;
            const eventModifierCount = Number(event.altKey) + Number(event.shiftKey) + Number(event.ctrlKey)

            if (registerModifierCount !== eventModifierCount) {
                continue;
            }

            if (type === "down") {
                if (is(register.onDown)) {
                    register.onDown();
                }
            } else {
                if (is(register.onUp)) {
                    register.onUp();
                }

                if (is(register.onPress)) {
                    register.onPress();
                }
            }

            if (register.preventDefault) {
                event.preventDefault();
            }

            if (register.stopPropagation) {
                event.stopPropagation();
                return;
            }
        }
    }

    public static init(): void {
        window.addEventListener("keydown", event => {
            Keyboard.handle(event, "down");
        });

        window.addEventListener("keyup", event => {
            Keyboard.handle(event, "up");
        });

        window.addEventListener("keypress", event => {
            Keyboard.handle(event, "press");
        });
    }
}
