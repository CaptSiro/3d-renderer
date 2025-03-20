export type float = number;
export type int = number;

export type Vec3 = {
    x: float,
    y: float,
    z: float,
} | any;

export type Vec2 = {
    x: float,
    y: float,
} | any;

export type Quat = {
    x: float,
    y: float,
    z: float,
    w: float,
} | any;

export type Mat4 = {
    elements: Float32Array
} | any;

export type Rgb = {
    red: number,
    green: number,
    blue: number
};