import { float, float01 } from "../types.ts";
import { areStatsHidden } from "../main.ts";
import { $, is } from "../../lib/jsml/jsml.ts";
import MathLib from "../utils/MathLib.ts";



const statsTime = $(".stats > .day-time");

export default class Time {
    public dayDuration: float = 30;
    public scale: float = 1;

    private _deltaTime: float = 0;
    private _systemTimestamp: float = 0;
    private _dayTime: float = 0;
    private _dayDeltaTime: float = 0;



    public constructor(
        public readonly fixedUpdateMilliseconds: number
    ) {
    }

    public update(): void {
        const now = Date.now() / 1000;

        this._deltaTime = now - this._systemTimestamp;

        this._dayDeltaTime = this._deltaTime * this.scale;
        this._dayTime += this._dayDeltaTime / this.dayDuration;
        this._dayTime -= Math.floor(this._dayTime);

        this._systemTimestamp = now;

        this.updateStats();
    }

    private updateStats(): void {
        if (areStatsHidden() || !is(statsTime)) {
            return;
        }

        statsTime.textContent = "time-day: " + MathLib.round(this._dayTime, 3);
    }



    public getDeltaTime(): float {
        return this._deltaTime;
    }

    public getDayDeltaTime(): float {
        return this._dayDeltaTime;
    }

    public getSystemTimestamp(): float {
        return this._systemTimestamp;
    }

    public getDayTime(): float {
        return this._dayTime;
    }

    public setDayTime(time: float01): void {
        this._dayTime = time;
    }

    public getFixedDeltaTime(): float {
        return this.fixedUpdateMilliseconds / 1000;
    }
}