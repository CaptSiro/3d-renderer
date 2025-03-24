import { float, float01 } from "../types.ts";



export default class Time {
    public dayDuration: float = 30;
    public scale: float = 1;

    private _deltaTime: float = 0;
    private _systemTime: float = 0;
    private _dayTime: float = 0;



    public update(): void {
        const now = Date.now() / 1000;

        this._deltaTime = (now - this._systemTime) * this.scale;

        this._dayTime += this._deltaTime / this.dayDuration;
        this._dayTime -= Math.floor(this._dayTime);

        this._systemTime = now;
    }



    public getDeltaTime(): float {
        return this._deltaTime;
    }

    public getSystemTime(): float {
        return this._systemTime;
    }

    public getDayTime(): float {
        return this._dayTime;
    }

    public setDayTime(time: float01): void {
        this._dayTime = time;
    }
}