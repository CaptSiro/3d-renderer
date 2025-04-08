import type { float, int, Vec3 } from "../../types.ts";
import Color from "../../primitives/Color.ts";
import { FLOAT_SIZE, LIGHT_SIZE } from "../../webgl.ts";



const TYPE = 0;
const INTENSITY = 1;
const COS_ANGLE = 2;

const POSITION = 4;
const COLOR = 8;
const DIRECTION = 12;

export default class LightDescription {
    public constructor(
        public type: int,
        public position: Vec3,
        public direction: Vec3,
        public color: Color,
        public intensity: float,
        public cosAngle: float
    ) {}



    private writeVec3(buffer: Float32Array, offset: number, vec: Vec3): void {
        buffer[offset++] = vec.x;
        buffer[offset++] = vec.y;
        buffer[offset] = vec.z;
    }

    /**
     * @returns Total floats written
     */
    public writeLight(buffer: Float32Array, start: number): int {
        if (buffer.byteLength < start * FLOAT_SIZE + LIGHT_SIZE) {
            return 0;
        }

        buffer[start + TYPE] = this.type;
        buffer[start + INTENSITY] = this.intensity;
        buffer[start + COS_ANGLE] = this.cosAngle;

        this.writeVec3(buffer, start + POSITION, this.position);
        this.writeVec3(buffer, start + COLOR, this.color.vec3);
        this.writeVec3(buffer, start + DIRECTION, glm.normalize(this.direction));

        return LIGHT_SIZE;
    }
}