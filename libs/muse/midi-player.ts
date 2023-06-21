'use babel';

import { freqByNoteHash } from './freq';
import { Sound, PlayingItem, KeyInfo } from './sound';
import { EventEmitter } from './ee';
import * as un from './utils';
import {DEFAULT_TONE_INSTR} from './keyboards';
import {getInstrCodeBy} from './instruments';
import {Ticker} from './ticker';
import {getSkedByQuarters, LoopAndTicksInfo} from './midi-player-utils'
import {NoteLineInfo, WaveSlide} from './types';

const QUANT = 10;
// 10 10 10 10 10
// 0  1  2  3  4

type PlayResult = {
    break: boolean,
    endTime?: number
}

const ee = new EventEmitter();

export class MidiPlayer extends Sound {
    private loopDfr: un.Deferred<PlayResult>;

    private isStopped: boolean = false;
    private loopId: number = 0;
    private interval: any;
    private ticker: Ticker;
    private pitchShift = 0;

    gains: { [key: string]: GainNode } = {} as any;
    loops: { [key: string]: LoopAndTicksInfo } = {};

    connect({
                ctx,
                oscills,
            }: {
        ctx: AudioContext;
        oscills?: { [key: string]: OscillatorNode };
    }): this {
        // this.ctx = ctx;
        this.oscills = oscills || {};

        return this;
    }

    playByQuarters(params: {
        beatOffsetMs?: number, // ??? unused but
        beatsWithOffsetMs: number[],
        startTimeSec?: number,
        loopIdsArr?: (string | number)[],
        cb?: (type: string, data: unknown) => void
        pitchShift?: number,
    }): Promise<PlayResult> {
        //console.log('midiPlayer.playByQuarters', params);
        //console.log('midiPlayer.playByQuarters.loops', this.loops);
        this.pitchShift = params.pitchShift || 0;

        let beatOffsetMs = params.beatOffsetMs || 0; // ??? unused but
        let cb = params.cb || ((type: string, data: unknown) => {});
        let beatsWithOffsetMs = Array.isArray(params.beatsWithOffsetMs) ? params.beatsWithOffsetMs : [];
        let loopIdsArr = params.loopIdsArr;
        let startTimeSec = params.startTimeSec;

        this.stop({
            break: true
        });

        this.ticker = new Ticker(this.ctx);
        this.loopDfr = new un.Deferred();

        //console.log('midiPlayer.playByQuarters.loops', this.loops);

        const loopIdsObj = (loopIdsArr || []).reduce((acc, item) => {
            acc[item] = item;

            return acc;
        }, {});

        startTimeSec = startTimeSec || this.ctx.currentTime;

        ee.emit('prepare', loopIdsObj);
        cb('prepare', params);

        let planTick = -1;
        let realTick = -1;
        let endTick = beatsWithOffsetMs.length - 2; // -1 смещение
        let offsetMs = 0;

        //console.log('totalTickCount', startTimeSec, endTick, beatsWithOffsetMs);

        const runTick = (isVirtTick: boolean = false) => {
            planTick++;

            if (!isVirtTick) {
                realTick++;
            }

            //console.log('planTick', planTick, realTick);
            cb('tick', { isVirtTick, planTick, endTick });

            offsetMs = offsetMs + beatsWithOffsetMs[planTick];
            const whenSec = startTimeSec + (offsetMs / 1000);

            if (planTick <= endTick) {
                ee.emit('getNextSound', {
                    tick: planTick,
                    whenSec,
                });

                //cb('planTick', { planTick, endTick, offsetMs, whenSec });
            }

            if (realTick >= endTick) {
                //console.log('midiPlayer.playByQuarters.stop');
                this.stop({
                    break: false,
                    // endTime: startTimeSec + (offsetMs / 1000)
                });

                cb('lastTick', { realTick, endTick, offsetMs });
            }
        };

        runTick(true);

        this.ticker.start({
            beatsWithOffsetMs: [...beatsWithOffsetMs],
            startTimeSec: startTimeSec,
        }, () => runTick());

        //cb('start.ticker', {
        //    beatsWithOffsetMs: [...beatsWithOffsetMs],
        //    startTimeSec: startTimeSec,
        //});

        return this.loopDfr.promise;
    }

    getNotesMidi(x: {
        notes: string,
        durationMs: number,
        volume?: number,
        instrCode?: string | number,
        whenSec?: number,
        pitchShift?: number,
        slides?: WaveSlide[],
        cent?: number,
    }) {
        const instrCode = getInstrCodeBy(x.instrCode || DEFAULT_TONE_INSTR);
        const soundInfo = this.getSoundInfoArr(x.notes);
        const instrObj = this.instruments[instrCode];

        if (!soundInfo.length || !instrObj) {
            return null;
        }

        return this.getSoundMidi({
            soundInfo,
            instrObj,
            durationMs: x.durationMs || 0,
            isDrum: un.isDrum(instrCode),
            volume: un.getSafeVolume(x.volume),
            whenSec: x.whenSec || 0,
            pitchShift: x.pitchShift || 0,
            slides: x.slides,
            cent: x.cent,
        });
    }

    // getNotesMidi
    //   getSoundMidi
    getSoundMidi(x: {
        soundInfo: KeyInfo | KeyInfo[];
        durationMs: number;
        isDrum?: boolean;
        volume?: number;
        instrObj?: any;
        whenSec?: number;
        pitchShift?: number;
        slides?: WaveSlide[],
        cent?: number,
    }): any {
        if (!x.instrObj || !x.soundInfo || !x.durationMs) {
            return;
        }

        let { durationMs, volume, pitchShift } = x;

        volume = un.getSafeVolume(volume);

        const item = (<any>{
            isSound: true,
            midis: [],
        }) as PlayingItem;

        if (x.isDrum) {
            durationMs = 1000; //duration * 2;
        }

        const sounds = Array.isArray(x.soundInfo)
            ? x.soundInfo
            : [x.soundInfo];

        for (let soundInfo of sounds) {
            (item as any).midis.push(
                this.fontPlayer.queueWaveTableSrc({
                    audioContext: this.ctx,
                    targetNode: Sound.masterGain, // this.ctx.destination,
                    preset: x.instrObj,
                    when: x.whenSec || 0,
                    pitch: soundInfo.code + (pitchShift || 0),
                    duration: durationMs / 1000, // in sec / 1000
                    volume: volume / 100, // soundInfo.volume * volume
                    slides: x.slides,
                    cent: x.cent,
                })
            );
        }

        return item;
    }

    // до+ре+му
    getSoundInfoArr(notes: string): KeyInfo[] {
        const result: KeyInfo[] = [];

        notes = (notes || '').trim();
        if (!notes) return [];

        let subArr = notes.split('+');

        subArr.forEach((note) => {
            note = this.getNoteSame(note);

            if (!note) return;

            const noteLat = this.getNoteLat(note);
            const keysAndNotes = this.keysAndNotes || {}
            const soundInfo = keysAndNotes[noteLat];

            result.push(soundInfo);
        });

        return result.filter((item) => !!item);
    }

    /**
     * Ничего не знаю про startTimeSec, offsetSec, beatOffsetMs
     */
    addLoopByQuarters(params: {
        noteLine: string,
        noteLineInfo?: NoteLineInfo,
        repeat?: number,
        isDrum?: boolean,
        instrCode?: string | number,
        instrAlias?: string,
        beatsMs: number[],
        bpm?: number,
        parentVolume?: number,
        restFromPrevRowQ?: number,
        restForNextRowQ?: number,
        colLoopDurationQ?: number, // длина одного цикла внутри которого надоходится линейка
    }): LoopAndTicksInfo {
        //console.log('addLoopByQuarters.params', params);

        this.loopId++;

        let loopId = this.loopId;
        let { noteLine, isDrum, instrCode } = params;
        let beatsMs = Array.isArray(params.beatsMs) ? params.beatsMs : [];
        let repeat = params.repeat === Infinity ? 1000000 : params.repeat;
        let noteLineInfo = params.noteLineInfo || un.getNoteLineInfo(noteLine);
        let beat = -1;
        let repeated = 0;
        let parentVolume = un.getSafeVolume(params.parentVolume);

        //console.log('addLoopByQuarter.noteLineInfo', noteLineInfo);
        //console.log('addLoopByQuarter.repeat', repeat);
        //console.log('addLoopByQuarter.beatsMs', beatsMs);

        const sked = getSkedByQuarters(
            {
                noteLine,
                noteLineInfo,
                isDrum,
                instrAny: instrCode,
                repeat,
                beatsMs: [...beatsMs],
                parentVolume,
                restFromPrevRowQ: params.restFromPrevRowQ,
                restForNextRowQ: params.restForNextRowQ,
                colLoopDurationQ: params.colLoopDurationQ,
            },
            (val: string) => this.getSoundInfoArr(val)
        );

        sked.id = loopId;
        delete this.loops[loopId];
        this.loops[loopId] = sked;

        //console.log('SKED', sked);

        const onGetNextSound = (eeParams: { tick: number; whenSec: number }) => {
            beat++;

            if (Array.isArray(sked[beat])) {
                for (const item of sked[beat]) {
                    this.getSoundMidi({
                        durationMs: item.durationMs,
                        isDrum: params.isDrum,
                        instrObj: item.instrObj,
                        soundInfo: item.soundInfo,
                        whenSec: eeParams.whenSec + ( item.offsetFromBeatMs / 1000),
                        volume: item.volume,
                        pitchShift: item.pitchShift,
                        slides: item.slides,
                        cent: item.cent,
                    });
                }
            }

            if (beat === sked.tickCount - 1) {
                // последняя четверть в цикле
                beat = -1;
                repeated++;
                if (repeated >= repeat) {
                    // последний цикл
                    repeated = 0;
                    ee.off('getNextSound', onGetNextSound);
                }
            }
        };

        const onPrepare = (loopsForPlay: { [key: string]: any }) => {
            if (!loopsForPlay || !loopsForPlay[loopId]) {
                return;
            }

            ee.on('getNextSound', null, onGetNextSound);
        };

        const onStop = () => {
            ee.off('getNextSound', onGetNextSound);
            repeated = 0;
            beat = -1;
        };

        const onClear = () => {
            ee.off('getNextSound', onGetNextSound);
            ee.off('prepare', onPrepare);
            ee.off('stop', onStop);
            ee.off('clear', onClear);
        };

        ee.on('prepare', null, onPrepare);
        ee.on('stop', null, onStop);
        ee.on('clear', null, onClear);

        return sked as any;
    }

    stopAndClear() {
        this.stop({
            break: true,
        });
        ee.emit('clear');
        this.loopId = 0;
        this.loops = {};
    }

    /**
     * Данные лупов не очищаются
     *
     * break:false сессия просто закончилась
     * break:true  сессия прервана (возможно досрочно)
     */
    stop(params: PlayResult) {
        // this.isStopped = true;
        ee.emit('stop');
        clearInterval(this.interval);

        if (this.ticker) {
            this.ticker.stop();
        }

        if (this.loopDfr) {
            const loopDfr = this.loopDfr;
            this.loopDfr = null;
            loopDfr.resolve({
                ...params,
                break: !!params.break
            });
        }
    }

    setSettings(settings: any, instrName?: string): { [key: string]: KeyInfo } {
        const keysAndNotes = this.getSettingsForKeysAndNotes(settings);
        instrName = instrName || 'default';

        Object.keys(keysAndNotes).forEach((key) => {
            const item = keysAndNotes[key];
            // delete keysAndNotes[key]; // jjkl
            item.freq = freqByNoteHash[item.noteLat];

            if (item && item.noteLat) {
                keysAndNotes[item.noteLat] = item;
            }
        });

        this.keysAndNotes = keysAndNotes; // TODO: избавиться
        this.instrSettings[instrName] = keysAndNotes;

        return keysAndNotes;
    }
}

// https://www.html5rocks.com/en/tutorials/audio/scheduling/
// https://www.youtube.com/user/UsernameInvalidTBH/videos
