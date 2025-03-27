import { float, float01 } from "../types.ts";
import { areStatsHidden } from "../main.ts";
import { $, is } from "../../lib/jsml/jsml.ts";
import Mathf from "../primitives/Mathf.ts";



const statsTime = $(".stats > .day-time");

export default class Time {
    public dayDuration: float = 30;
    public scale: float = 1;

    private _deltaTime: float = 0;
    private _systemTime: float = 0;
    private _dayTime: float = 0;
    private _dayDeltaTime: float = 0;



    public update(): void {
        const now = Date.now() / 1000;

        this._deltaTime = now - this._systemTime;

        this._dayDeltaTime = this._deltaTime * this.scale;
        this._dayTime += this._dayDeltaTime / this.dayDuration;
        this._dayTime -= Math.floor(this._dayTime);

        this._systemTime = now;

        this.updateStats();
    }

    private updateStats(): void {
        if (areStatsHidden() || !is(statsTime)) {
            return;
        }

        statsTime.textContent = "time-day: " + Mathf.round(this._dayTime, 3);
    }



    public getDeltaTime(): float {
        return this._deltaTime;
    }

    public getDayDeltaTime(): float {
        return this._dayDeltaTime;
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