'use babel';

import {Sound} from './sound';
import {WavePreset} from '../waf-player/otypes';

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

    createTickSource(x: {
        qms: number,
        signature?: string,
        preset1: WavePreset,
        preset2?: WavePreset,
        cb: (x: {
            ab: AudioBufferSourceNode,
            startTimeMs: number
         })=> void,
        repeat: number,
    }) {
        let repeat = x.repeat || 100;
        let qms = x.qms || 400;
        let qmsSec = qms / 1000;
        let totalDurationSec = qmsSec * repeat;
        let offlineCtx = new OfflineAudioContext(1, 44100 * totalDurationSec, 44100);
        let currentTime = offlineCtx.currentTime;
        let offset = 0;

        for (let i=0; i<repeat; i++) {
            if (x.signature !== '3:4') {
                const soundSource = offlineCtx.createBufferSource(); // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource
                soundSource.buffer = x.preset1.zones[0].buffer;
                soundSource.connect(offlineCtx.destination);
                soundSource.start(currentTime + offset);
                offset = offset + qmsSec;
            }
            else if (x.signature === '3:4') {
                const qmsHalfSec = qmsSec / 2;

                let soundSource = offlineCtx.createBufferSource(); // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource
                soundSource.buffer = x.preset1.zones[0].buffer;
                soundSource.connect(offlineCtx.destination);
                soundSource.start(currentTime + offset);
                offset = offset + qmsHalfSec;

                soundSource = offlineCtx.createBufferSource(); // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource
                soundSource.buffer = x.preset2.zones[0].buffer;
                soundSource.connect(offlineCtx.destination);
                soundSource.start(currentTime + offset);
                offset = offset + qmsHalfSec;

                soundSource = offlineCtx.createBufferSource(); // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource
                soundSource.buffer = x.preset2.zones[0].buffer;
                soundSource.connect(offlineCtx.destination);
                soundSource.start(currentTime + offset);
                offset = offset + qmsHalfSec;
            }
        }

        offlineCtx
            .startRendering()
            .then(audioBuffer => {
                const audioBufferSourceNode = Sound.ctx.createBufferSource();

                audioBufferSourceNode.buffer = audioBuffer;
                audioBufferSourceNode.connect(Sound.ctx.destination);
                audioBufferSourceNode.start();
                audioBufferSourceNode.stop(Sound.ctx.currentTime + totalDurationSec);
                audioBufferSourceNode.onended = () => {
                    //console.log('onended');
                    audioBufferSourceNode.disconnect(Sound.ctx.destination);
                }

                x.cb({
                    ab: audioBufferSourceNode,
                    startTimeMs: Date.now()
                });

            })
            .catch(function(err) {
                console.log('Rendering failed: ' + err);
                // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
            });
    }
}
