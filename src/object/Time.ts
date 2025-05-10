import { float, float01 } from "../types.ts";
import { areStatsHidden } from "../main.ts";
import { $, is } from "../../lib/jsml/jsml.ts";
import MathLib from "../utils/MathLib.ts";



const statsTime = $(".stats > .day-time");

export default class Time {
    /**
     * Number of seconds that represents the whole 24 hours of days. Example: dayDuration = 24 -> each hour takes 1 second
     */
    public dayDuration: float = 30;
    public scale: float = 1;

    private dayTime: float = 0;

    private _deltaTime: float = 0;
    private _systemTimestamp: float = 0;
    private _dayDeltaTime: float = 0;



    public constructor(
        public readonly fixedUpdateMilliseconds: number
    ) {
    }

    public update(): void {
        const now = Date.now() / 1000;

        this._deltaTime = now - this._systemTimestamp;

        this._dayDeltaTime = this._deltaTime * this.scale;
        this.dayTime += this._dayDeltaTime / this.dayDuration;
        this.dayTime -= Math.floor(this.dayTime);

        this._systemTimestamp = now;

        this.updateStats();
    }

    private updateStats(): void {
        if (areStatsHidden() || !is(statsTime)) {
            return;
        }

        statsTime.textContent = "time-day: " + MathLib.round(this.dayTime, 3);
    }



    public getDeltaTime(): float {
        return this._deltaTime;
    }

    /**
     * @returns The delta time for the runtime day cycle. If the day cycle is sped up, the day delta time value is sped up
     * by the same multiplier (in seconds)
     */
    public getDayDeltaTime(): float {
        return this._dayDeltaTime;
    }

    /**
     * @returns The current time snapshot (in seconds)
     */
    public getSystemTimestamp(): float {
        return this._systemTimestamp;
    }

    /**
     * @returns The relative day time offset from 0/sunrise to `Time.dayDuration`/sunrise the next day (in seconds)
     * @see {dayDuration}
     */
    public getDayTime(): float {
        return this.dayTime;
    }

    /**
     * Set time of the day. Should be from 0 to 1 range:
     *  - 0 = sunrise
     *  - 0.25 = noon
     *  - 0.5 = sunset
     *  - 0.75 = midnight
     *  - 1 = sunrise the next day
     *
     * @param time
     */
    public setDayTime(time: float01): void {
        this.dayTime = time;
    }

    public getFixedDeltaTime(): float {
        return this.fixedUpdateMilliseconds / 1000;
    }
}