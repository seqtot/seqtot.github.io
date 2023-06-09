'use babel';

export function tickOnTime(endTime: number, ctx: AudioContext, cb: () => void): OscillatorNode | undefined {
    if (ctx.currentTime >= endTime) {
        cb();

        return;
    }

    let oscil = this.ctx.createOscillator();

    oscil.onended = cb;
    oscil.start(0);
    oscil.stop(endTime);

    return oscil;
}

export class Ticker {
    private interval: any = null;

    info: {
        startCtxTimeSec: number,
        stopCtxTimeSec: number,
        break: boolean,
    } = {
        startCtxTimeSec: 0,
        stopCtxTimeSec: 0,
        break: false,
    };

    constructor(public ctx: AudioContext) {}

    tickByBeatsMs(params: {
        beatsWithOffsetMs?: number[],
        startTimeSec?: number,
    }, cb: () => void) {
        //console.log('ticker.tickByBeatsMs', params);

        this.stop();

        let beatsWithOffsetMs = Array.isArray(params.beatsWithOffsetMs) ? [...params.beatsWithOffsetMs] : [];

        if (!beatsWithOffsetMs.length) {
            return;
        }

        const info = this.info;
        info.startCtxTimeSec = params.startTimeSec || this.ctx.currentTime;

        let oscil = this.ctx.createOscillator();
        let index = 0;
        let nextTimeSec = info.startCtxTimeSec + (beatsWithOffsetMs[index] / 1000);

        const onEnded = () => {
            index++;

            if (info.break || index >= beatsWithOffsetMs.length) {
                return;
            }

            cb();

            nextTimeSec = nextTimeSec + (beatsWithOffsetMs[index] / 1000);

            oscil = this.ctx.createOscillator();
            oscil.onended = onEnded;
            oscil.start();
            oscil.stop(nextTimeSec);
        };

        oscil.onended = onEnded;
        oscil.start(0);
        oscil.stop(nextTimeSec);
    }

    start(params: {
        beatsWithOffsetMs?: number[],
        bpm?: number,
        startTimeSec?: number,
    }, cb: () => void) {
        let started = false;

        if (params.beatsWithOffsetMs) {
            started = true;
            this.tickByBeatsMs(params, cb);
        } else if(params.bpm) {
            started = true;
            this.tickByBpm(<any>params, cb);
        }

        if (!started) {
            this.stop();
        }
    }

    tickByBpm(params: {
        bpm: number,
        startCtxTimeSec?: number,
    }, cb: () => void) {
        //console.log('ticker.tickByBpm', params);

        this.stop();

        if (!params.bpm || !cb) {
            return;
        }

        const quarterSec = 60 / params.bpm;

        const info = this.info;
        info.startCtxTimeSec = params.startCtxTimeSec || this.ctx.currentTime;

        let oscil = this.ctx.createOscillator();
        let index = 0;
        let nextTimeSec = info.startCtxTimeSec + quarterSec;

        const onEnded = () => {
            index++;

            if (info.break) {
                return;
            }

            cb();

            nextTimeSec = nextTimeSec + quarterSec;
            oscil = this.ctx.createOscillator();
            oscil.onended = onEnded;
            oscil.start();
            oscil.stop(nextTimeSec);
        };

        oscil.onended = onEnded;
        oscil.start(0);
        oscil.stop(nextTimeSec);

        if (!params.startCtxTimeSec || params.startCtxTimeSec >= this.ctx.currentTime) {
            cb();
        }
    }

    tickByQuantMs(quantMs: number, cb: () => void) {
        let nextTime = Date.now() + quantMs;

        this.interval = setInterval(() => {
            if (Date.now() > nextTime) {
                nextTime = nextTime + quantMs;
                cb();
            }
        });
    }

    stop() {
        this.info.break = true;
        this.info.stopCtxTimeSec = this.ctx.currentTime;

        this.info = {
            startCtxTimeSec: 0,
            stopCtxTimeSec: 0,
            break: false,
        };

        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
