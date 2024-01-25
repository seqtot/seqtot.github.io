'use babel';

import { Sound } from './sound';
import { MidiPlayer } from './midi-player';
import { toneAndDrumPlayerSettings, DEFAULT_TONE_INSTR } from './keyboards';
import { Ticker } from './ticker';
import { DEFAULT_OUT_VOLUME } from '../../pages/song-store';
import {TextBlock, DataByTracks} from './types';
import * as u from './utils';
import {Deferred} from './utils';
//import * as Fs from 'fs';

const Fs: any = null;

type SoundSourceSet = AudioBufferSourceNode[];

// https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
// AudioContext: decodeAudioData,
export async function decodeArrayBufferToAudio(
    arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
    return await Sound.ctx.decodeAudioData(arrayBuffer);
}

export async function getAudioBufferFromBlob(blob: Blob): Promise<AudioBuffer> {
    let arrayBuffer = await blob.arrayBuffer();
    return decodeArrayBufferToAudio(arrayBuffer);
}

type Info = {
    name?: string,
    path?: string,
    beats?: number[],
    use?: boolean,
    midi?: string,
}

type OutLoopsInfo = {
    repeat: number,
    // rowLoops играются последовательно
    rowLoops: {
        ids: (string | number)[],
        beatsMs: number[],
    }[],
    durationInFullQ?: number;
    durationInFullQMs?: number;
}

export class MultiPlayer {
    isPlaying = false;
    ctx: AudioContext;
    files: string[];
    soundSourceSet: SoundSourceSet = [];
    startTime: number;
    durationX: number;
    offset: number;
    private playSessions: {[key: string]: any}[] = [];
    outGain: GainNode;
    ticker = new Ticker(Sound.ctx);
    midiPlayer = new MidiPlayer();
    tickPlayer = new MidiPlayer();

    constructor(ctx?: AudioContext) {
        this.ctx = ctx || Sound.ctx;

        this.outGain = this.ctx.createGain();
        this.outGain.gain.value = 0.6;

        this.outGain.connect(this.ctx.destination);

        this.midiPlayer.connect({ ctx: Sound.ctx });
        this.midiPlayer.setSettings(toneAndDrumPlayerSettings);
        this.tickPlayer.connect({ ctx: Sound.ctx });
        this.tickPlayer.setSettings(toneAndDrumPlayerSettings);
    }

    playMidi(text: string, beats: number[]) {
        //console.log(text, beats);
    }

    playTick(params: {
        beatsWithOffsetMs: number[],
        startTimeSec: number,
        delayMs?: number,
        bpm?: number,
        repeat?: number,
    }) {
        this.ticker.stop();
        const delayMs = params.delayMs | 0;
        const beatsWithOffsetMs = Array.isArray(params.beatsWithOffsetMs) ? params.beatsWithOffsetMs: [];

        if (!beatsWithOffsetMs.length) {
            return;
        }

        //console.log('playTick', params.beatsMs);

        this.ticker.start({
            beatsWithOffsetMs: [...beatsWithOffsetMs],
            startTimeSec: params.startTimeSec || 0,
        }, () => {
            this.midiPlayer.getNotesMidi({
                notes: 'cowbell',
                instrCode: 'cowbell',
                durationMs: 1000,
            });
        });
    }

    get currentTime(): number {
        return this.ctx.currentTime;
    }

    async playFractions(params: {
        files: string[] | Info[],
        offsetSec?: number,
        durationSec?: number,
        repeatCount?: number,
        beatOffsetMs?: number,
        beatsWithOffsetMs?: number[],
        startDelaySec?: number,
        playMidiBlock?: string | TextBlock,
        midiTextBlocks?: string | TextBlock[],
    }) {
        //console.log('play.files', files);
        let files = params.files;
        let offsetSec = params.offsetSec || 0;
        let durationSec = params.durationSec || 0;
        let repeatCount = params.repeatCount || 1;
        let beatsWithOffsetMs = Array.isArray(params.beatsWithOffsetMs) ? params.beatsWithOffsetMs: [];

        //console.log('beatsWithOffsetMs', beatsWithOffsetMs);

        let startDelaySec = params.startDelaySec || 0;

        let playing = 0;
        let repeated = 0;
        const sessionInfo = {
            break: false,
        };
        let useTick = false;
        let hasBeats = !!beatsWithOffsetMs.length;
        let midiOut: TextBlock | string;

        if (params.playMidiBlock && Array.isArray(params.midiTextBlocks) && params.midiTextBlocks.length) {
            midiOut = u.getOutBlock(params.playMidiBlock, params.midiTextBlocks);
        }

        this.soundSourceSet = [];
        this.offset = offsetSec;
        this.durationX = 0;

        const buffers: {
            path: string,
            buffer: AudioBuffer
        }[] = [];

        const filesInfo: Info[] = files.map(item => {
            if (typeof item === 'string') {
                return {
                    path: item,
                    name: item,
                    use: true,
                };
            }

            return item;
        });

        let outLoops: OutLoopsInfo;

        this.midiPlayer.stopAndClear();
        if (midiOut) {
            outLoops = this.getLoopsInfo({
                repeat: 1, // jjkl
                beatOffsetMs: params.beatOffsetMs || beatsWithOffsetMs[0],
                beatsMs: beatsWithOffsetMs.slice(1),
                blocks: params.midiTextBlocks,
                playBlock: midiOut,
            });
        }

        for (const info of filesInfo) {
            const path = info.path;
            const name = info.name;

            if (!path || name === 'midi' || name === 'tick' || !info.use) {
                if (name === 'tick' && hasBeats && info.use) {
                    useTick = true;
                }

                if (name === 'midi' && !info.use) {
                    midiOut = null;
                }

                continue;
            }

            let blob: Blob = new Blob([Fs.readFileSync(info.path)]);
            const buffer = await getAudioBufferFromBlob(blob);

            //console.log(info.path, buffer.duration);

            buffers.push({
                path,
                buffer,
            });
        }

        if (buffers.length) {
            this.playSessions.push(sessionInfo);
        }

        const run = () => {
            this.startTime = this.ctx.currentTime + startDelaySec;

            if (useTick && !midiOut) {
                this.playTick({
                    beatsWithOffsetMs: [...beatsWithOffsetMs],
                    startTimeSec: this.startTime
                });
            }

            if (midiOut) {
                this.tryPlayMidiBlock({
                    repeatCount: 1,
                    beatOffsetMs: params.beatOffsetMs || beatsWithOffsetMs[0],
                    beatsWithOffsetMs: [...beatsWithOffsetMs],
                    startTimeSec: this.startTime,
                    outLoops,
                    dontClear: true,
                })
            }

            const onEnded = () => {
                playing--;
                if (!playing) {
                    repeated++;

                    if (!sessionInfo.break && repeated < repeatCount) {
                        run();
                    } else {
                        // this.midiPlayer.stop(); jjkl

                        if (this.playSessions.length === 1 && this.playSessions.includes(sessionInfo)) {
                            this.isPlaying = false;
                            this.playSessions = [];
                            this.ticker.stop(); // jjkl
                        }
                    }
                }
            };

            buffers.forEach(item => {
                const soundSource = this.ctx.createBufferSource(); // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource
                soundSource.buffer = item.buffer;
                soundSource.connect(this.outGain);

                if (!durationSec) {
                    soundSource.start(this.startTime, offsetSec); // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start   start(when, offset, duration)
                } else {
                    soundSource.start(this.startTime, offsetSec, durationSec); // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start   start(when, offset, duration)
                }

                playing++;
                this.soundSourceSet.push(soundSource);

                //if (!durationSec) {
                soundSource.onended = onEnded;
                //}
            });

            // if (durationSec) {
            // 	let oscil = this.ctx.createOscillator();
            // 	oscil.onended = () => {
            // 		playing = 1;
            // 		onEnded();
            // 	}
            // 	oscil.start(this.startTime);
            // 	oscil.stop(this.startTime + durationSec);
            // }
        }

        run();

        if (playing) {
            this.isPlaying = true;
        }
    } // playFractions

    stop(offset = 0) {
        this.playSessions.forEach(item => {
            item.break = true;
        });
        this.playSessions = [];

        this.soundSourceSet.forEach(item => {
            item.disconnect(this.outGain); // jjkl
            item.stop(offset);
        });

        this.soundSourceSet = [];
        this.isPlaying = false;
        this.ticker.stop();
        this.midiPlayer.stop({
            break: true,
        });
    }

    clear() {

    }

    pause() {

    }

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        repeat = repeat || 1;
        text = (text || '').trim();

        this.midiPlayer.stopAndClear();
        const noteLine = u.clearNoteLine(text);
        const bpm = u.getBpmFromString(noteLine);

        const loopId = this.midiPlayer.addLoopByQuarters({
            noteLine,
            bpm,
            isDrum: false, // isDrum,
            repeat,
            instrCode: DEFAULT_TONE_INSTR, // instrAlias[key], // MIDI_INSTR
            beatsMs: [],
            dataByTracks: this.normalizeDataByTracks(),
        }).id;

        await this.midiPlayer.waitLoadingAllInstruments();

        this.midiPlayer.playByQuarters({
            loopIdsArr: [loopId],
            beatsWithOffsetMs: []
        });
    }


    normalizeDataByTracks(dataByTracks?: DataByTracks, volume?: number): DataByTracks {
        dataByTracks = dataByTracks || <DataByTracks>{};

        if (!dataByTracks.total || !dataByTracks.total.volume) {
            dataByTracks.total = {
                volume: volume || DEFAULT_OUT_VOLUME
            }
        }

        return  dataByTracks;
    }

    /**
     * Ничего не знает про offset
     * un.getOutBlock
     * un.getOutBlocksInfo
     */
    getLoopsInfo(x: {
        blocks?: TextBlock[] | string,
        playBlock?: TextBlock | string,
        repeat?: number, // jjkl delete ?
        repeatCount?: number, // jjkl delete ?
        beatOffsetMs?: number, // jjkl delete ?
        beatsMs?: number[],
        bpm?: number,
        excludeLines?: string[],
        dataByTracks?: DataByTracks,
        pitchShift?: number
    }): OutLoopsInfo {
        //console.log('getLoopsInfo.params', {...params});

        const pitchShift = x.pitchShift || 0;
        const excludeLines = x.excludeLines || [];
        let beatsMs: number[] = Array.isArray(x.beatsMs) ? [...x.beatsMs]: [];
        let playBlock = x.playBlock || 'out';
        const allBlocks = Array.isArray(x.blocks) ? x.blocks : u.getTextBlocks(x.blocks);
        const outBlock = u.getOutBlock(playBlock, allBlocks);
        const dataByTracks = this.normalizeDataByTracks(x.dataByTracks, outBlock.volume);
        const outBlocks = u.getOutBlocksInfo(allBlocks, playBlock);
        const repeat = x.repeat || x.repeatCount || u.getRepeatFromString(outBlock.head);

        //console.log('getLoopsInfo.outBlock', outBlock);
        console.log('getLoopsInfo.outBlocks', outBlocks);

        let startRowBeatIndex = 0;
        let bpm = x.bpm || u.getBpmFromString(outBlock.head, 0);

        if (!bpm) {
            console.warn('getLoopsInfo.bpm is zero or undefined', bpm);
        }

        bpm = beatsMs.length ? 0 : bpm;

        let durationInFullQ = 0;
        let durationInFullQMs = 0;
        let addPauseToNextRowQ = 0;

        outBlocks.rows.forEach(row => {
            row.trackLns.forEach(noteLn => {
                noteLn.noteLineInfo.notes.forEach(noteInfo => {
                    noteInfo.pitchShift = noteInfo.pitchShift + pitchShift;

                    // SET VOLUME
                    // let trackName = noteLn.trackName;
                    // let rootVolume = u.getSafeVolume(dataByTracks.total.volume, DEFAULT_OUT_VOLUME);
                    // let trackVolume = u.getSafeVolume(dataByTracks[trackName]?.volume);
                    // let instData = (dataByTracks[trackName]?.items && dataByTracks[trackName].items[noteInfo.instr]);
                    //
                    // trackVolume = u.mergeVolume(rootVolume, trackVolume);
                    //
                    // if (instData) {
                    //     trackVolume = u.mergeVolume(
                    //       trackVolume,
                    //       instData.volume);
                    // }
                    //
                    // noteInfo.volume = u.mergeVolume(
                    //     noteInfo.volume,
                    //     u.getSafeVolume(trackVolume)
                    // );
                });
            });
        });

        //console.log('outBlocks', outBlocks);

        const rowLoops = outBlocks.rows.map((rowLoop) => {
            const result: {
                ids: (number | string)[],
                beatsMs: number[],
            } = {
                ids: [],
                beatsMs: [],
            }

            const addPauseQ = addPauseToNextRowQ;
            const fullRowDuration = (rowLoop.rowDurationByHeadQ * rowLoop.rowRepeat) + addPauseQ;
            let beatsByRowMs: number[];
            let rowBeatCountCeil = Math.ceil(fullRowDuration  / u.NUM_120);
            let rowBeatCountFloor = Math.floor(fullRowDuration / u.NUM_120);

            addPauseToNextRowQ = fullRowDuration - (rowBeatCountFloor * u.NUM_120);

            //console.log('negOffsetQ',
            //     rowLoop.rowDurationQ,
            //     rowBeatCountFloor,
            //     rowBeatCountCeil,
            //     addPauseQ,
            //     addPauseToNextRowQ
            // );

            if (bpm && !beatsMs.length) {
                beatsByRowMs = u.getBeatsByBpm(bpm, rowBeatCountFloor ? rowBeatCountFloor : fullRowDuration ? 1 : 0);
            } else {
                let endRowBeatIndex = startRowBeatIndex + rowBeatCountFloor;
                beatsByRowMs = beatsMs.slice(startRowBeatIndex, endRowBeatIndex);
                startRowBeatIndex = endRowBeatIndex;
            }

            result.beatsMs = beatsByRowMs;
            durationInFullQ = durationInFullQ + (beatsByRowMs.length * u.NUM_120);
            durationInFullQMs = durationInFullQMs + beatsByRowMs.reduce((acc, item) => (acc + item), 0);

            rowLoop.trackLns.forEach((noteLn) => {
                if (!fullRowDuration) {
                    return;
                }

                const noteLine = noteLn.noteLine;
                //const isDrum = un.isDrum(noteLn.noteLine); // todo: refactor
                const isDrum = u.isDrum(noteLn.trackName);

                const loop = this.midiPlayer.addLoopByQuarters({
                    noteLine,
                    noteLineInfo: noteLn.noteLineInfo,
                    isDrum,
                    beatsMs: [...beatsByRowMs],
                    bpm,
                    parentVolume: noteLn.parentVolume,
                    //repeat: noteLn.repeat, // ??? удалить это из noteLine? Количество повторов уже добавлено в noteLine при вызове getOutBlockInfo
                    repeat: noteLn.repeat,
                    restFromPrevRowQ: addPauseQ,
                    restForNextRowQ: addPauseToNextRowQ,
                    colLoopDurationQ: noteLn.colLoopDurationQ,
                    dataByTracks,
                    trackName: noteLn.trackName,
                });

                result.ids.push(loop.id);
            });

            return result;
        });

        const result = {
            repeat,
            rowLoops,
            durationInFullQ,
            durationInFullQMs
        };

        //console.log('getLoopsInfo', result);

        return result;
    }

    stopAndClearMidiPlayer() {
        this.midiPlayer.stopAndClear();
    }

    /**
     * -> getLoopsInfo
     */
    async tryPlayMidiBlock(x: {
        blocks?: TextBlock[] | string,
        playBlock?: string | TextBlock,
        repeatCount?: number
        beatOffsetMs?: number,
        beatsWithOffsetMs?: number[],
        bpm?: number,
        startTimeSec?: number,
        outLoops?: OutLoopsInfo,
        dontClear?: boolean;
        pitchShift?: number;
        cb?: (type: string, data: any) => void,
        excludeLines?: string[]
        dataByTracks?: DataByTracks,
    }) {
        //console.log('tryPlayMidiBlock', x.dataByTracks);
        if (!x.dontClear) {
            this.midiPlayer.stopAndClear();
        }

        const outLoops = x.outLoops || this.getLoopsInfo(x);
        const beatOffsetMs = x.beatOffsetMs || 0;
        const cb = x.cb || (() => {}) as any;

        //console.log('tryPlayMidiBlock.outLoops', outLoops);

        let breakLoop: boolean = false;

        await this.midiPlayer.waitLoadingAllInstruments();

        let startTimeSec = x.startTimeSec || this.ctx.currentTime;
        let beatOffsetMsInRowLoop = beatOffsetMs;

        // длительность одного цикла
        let oneLoopDurationMs = 0;

        for (let rowLoops of outLoops.rowLoops) {
            oneLoopDurationMs += (rowLoops.beatsMs.reduce((acc, item) => acc + item, 0));
        }

        const startTimeInMs = new Date().getTime() + beatOffsetMsInRowLoop;
        const endTimeInMs = startTimeInMs + (oneLoopDurationMs * outLoops.repeat);

        for (let i = 0; i < outLoops.repeat; i++) {
            if (breakLoop) break;

            for (let rowLoops of outLoops.rowLoops) {
                const loopResult = await this.midiPlayer.playByQuarters({
                    beatOffsetMs: beatOffsetMsInRowLoop,
                    beatsWithOffsetMs: [beatOffsetMsInRowLoop, ...rowLoops.beatsMs],
                    loopIdsArr: rowLoops.ids,
                    startTimeSec,
                    cb: x.cb || (() => {}) as any,
                });

                breakLoop = !!loopResult.break;
                beatOffsetMsInRowLoop = 0; // значим только для первой rowLoop
                startTimeSec = startTimeSec + (rowLoops.beatsMs.reduce((acc, item) => acc + item, 0) / 1000) + (beatOffsetMs / 1000);

                if (breakLoop) break;
            }
        }

        let msToEnd = endTimeInMs - new Date().getTime();
        msToEnd = msToEnd > 0 ? msToEnd: 0;

        const dfr = new Deferred();

        if (breakLoop) {
            cb('break');
            dfr.resolve('break');
        } else {
            setTimeout(
                () => {
                    cb('finish');
                    dfr.resolve('finish');
                },
                msToEnd
            );
        }

        return dfr.promise;
    }
}

//console.log('u.workspaceRoot()', u.workspaceRoot());
// TODO jjkl
// запуск и остановка когда играется только midi
// повторы запуска только миди
