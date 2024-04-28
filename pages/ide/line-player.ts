import { Muse as m, TFileSettings, TNoteInfo, MultiPlayer, Synthesizer, TTextBlock, TDataByTracks } from '../../libs/muse';

import { Editor } from 'codemirror';
import {
    getAllMusicKeyCodes,
    getRightKeyCodes,
    getLeftKeyCodes,
    getInstrCodesByKeyCodes,
    unplayedKeysHash,
    skipEvent,
} from './line-player-utils';
import { ideService } from './ide-service';

// import * as wav from '../../libs/muse/utils/node-wav'
// import Fs from '../../libs/common/file-service';
import {WavRecorder} from './wav-recorder';

type Nil = null | undefined;
type InputMode = Nil | 'text' | 'beat' | 'sound' | 'voice' | 'linePlayer';

// https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
export async function decodeArrayBufferToAudio(
    arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
    return await m.Sound.ctx.decodeAudioData(arrayBuffer);
}

export async function getAudioBufferFromBlob(blob: Blob): Promise<AudioBuffer> {
    let arrayBuffer = await blob.arrayBuffer();
    return decodeArrayBufferToAudio(arrayBuffer);
}

function getCurrRowCm(cm: Editor): number {
    const selections = cm.listSelections(); // [{acnchor, head}]
    const line = selections[0].head.line;

    return line;
}

type PlayingData = {
    code: string;
    note: string;
    down: number;
    up: number;
    next: number;
    id?: string | number;
};
// syllable ˈsɪləbl слог, слово, звук

type BpmInfo = {
    bpm: number;
    lastDownTime: number;
    pressCount: number;
    totalMs: number;
};

const emptyBpmInfo = (): BpmInfo => {
    //console.log('getEmptyBpm');
    return {
        bpm: 0,
        lastDownTime: 0,
        pressCount: 0,
        totalMs: 0,
    };
};

const fCodes = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F10', 'F11', 'F12'];
const DOWN = 1;
const UP = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTH = 3;

type RowInfo = {
    first: number,
    last: number,
}

function getDataByTracksFromSettings(settings: TFileSettings): TDataByTracks {
    const dataByTracksSrc = settings?.dataByTracks || {};
    const dataByTracks = {} as TDataByTracks;

    Object.keys(dataByTracksSrc).forEach(name => {
        const volume = m.getVolumeFromString(dataByTracksSrc[name]);

        dataByTracks[name] = {
            volume
        }
    });

    return dataByTracks;
}

export class LinePlayer {
    pitchShift: number = 0;
    recorder: WavRecorder;

    isRecording = false;
    pressCount = 0;
    startUpTime = 0;
    noteArr: string[] = [];
    uri = '';

    notesByChannels: {
        left: TNoteInfo[][],
        right: TNoteInfo[][],
    } = {
        left: [],
        right: [],
    }

    keyData: PlayingData; // ??? удалить
    playingKeys: {[key: string]: PlayingData[]} = {};
    playingId = 0;

    keySequence: PlayingData[] = [];
    beatInput: Editor;
    textInput: Editor;
    multiBuffer: Editor;
    synthesizer: Synthesizer;
    isNote: (str: string) => boolean;
    mode: string = 'Digit1';
    downedKeys: { [key: string]: boolean } = {};
    bpmInfo: BpmInfo = emptyBpmInfo();
    multiPlayer: MultiPlayer;
    lastTickTime: number = 0;
    currBlock: TTextBlock;
    currRowInfo: RowInfo = { first: 0, last: 0}; // индекс в текущем блоке
    blocks: TTextBlock[] = [];
    settings: TFileSettings = <any>{};
    bassKeys = getLeftKeyCodes();
    instrCodeByKeyCode = getInstrCodesByKeyCodes();
    musicKeyCodes = getAllMusicKeyCodes();
    playingWithMidi = false;
    inputMode: InputMode = 'linePlayer';

    constructor() {}

    connect(params: {
        beatInput: LinePlayer['beatInput'],
        textInput: LinePlayer['textInput'],
        multiBuffer?: LinePlayer['multiBuffer'],
        isNote?: (str: string) => boolean;
        multiPlayer?: MultiPlayer;
        synthesizer: Synthesizer,
        uri?: string,
        mode?: 'line-player' | 'synthesizer' | 'beat-recorder'
    }) {
        //console.log('connect.params', params);

        this.disconnect();

        this.beatInput = params.beatInput;
        this.textInput = params.textInput;
        this.multiBuffer = params.multiBuffer;
        this.isNote = params.isNote || ((() => {}) as any);
        this.multiPlayer = params.multiPlayer || new m.player.MultiPlayer();
        this.synthesizer = params.synthesizer;
        this.uri = params.uri;

        this.onConnect();
    }

    disconnect() {
        //console.log('disconnect.line-player');

        this.downedKeys = {};

        this.clear(true);
        this.stopTick();

        this.multiBuffer = null;

        this.multiPlayer && this.multiPlayer.stopAndClearMidiPlayer();
        this.multiPlayer = null;

        this.textInput = null;
        this.synthesizer = null;
        this.isNote = null;
        this.lastTickTime = 0;

        if (this.recorder) {
            this.recorder.stopAndSave();
            this.recorder = null;
        }
    }

    handleGetBpmKey(time: number, type: number) {
        // const bpmInfo = this.bpmInfo;
        //
        // if (type === DOWN) {
        //     bpmInfo.pressCount++;
        //
        //     if (bpmInfo.lastDownTime) {
        //         bpmInfo.totalMs = bpmInfo.totalMs + (time - bpmInfo.lastDownTime);
        //     }
        //     bpmInfo.lastDownTime = time;
        //
        //     if (bpmInfo.totalMs) {
        //         const avg = this.bpmInfo.totalMs / (this.bpmInfo.pressCount - 1);
        //         bpmInfo.bpm = Math.round(60000 / avg);
        //     }
        //
        //     if (this.multiPlayer) {
        //         this.multiPlayer.midiPlayer.getNotesMidi({
        //             notes: 'cowbell',
        //             instrCode: 'cowbell',
        //             durationMs: 1000,
        //         });
        //     }
        //
        //console.log('bpmInfo', bpmInfo);
        // }
    }

    stopSound(notesStr: string, id: string | number) {
        const notes = notesStr.split('+');
        notes.forEach(note => {
            return this.synthesizer.playSound({
                id,
                keyOrNote: note,
                print: false,
                onlyStop: true,
            });
        });
    }

    playSound(notesStr: string, instrAlias: string | number, id: string | number, volume: number, pitchShift = 0) {
        //console.log('PLAY SOUND', notesStr, pitchShift);

        const notes = notesStr.split('+');
        notes.forEach(note => {
            return this.synthesizer.playSound({
                id,
                keyOrNote: note,
                print: false,
                instrCode: m.getInstrCodeBy(instrAlias),
                volume: volume / 100,
                pitchShift: pitchShift,
            });
        });
    }

    getInstrCodeByKeyCode(code: string): string {
        return this.instrCodeByKeyCode[code] || '';
    }

    handlePlayKey(keyCode: string, time: number, type: number) {
        //console.log('handlePlayKey', keyCode, type);

        if (this.playingKeys[keyCode] && type === UP) {
            const data = this.playingKeys[keyCode];
            delete this.playingKeys[keyCode];
            data.forEach(item => {
                this.stopSound(item.note, item.id);
            });

            return;
        }

        let noteArrays: TNoteInfo[][] = this.bassKeys[keyCode] ? this.notesByChannels.left : this.notesByChannels.right;

        if (!noteArrays.reduce((acc, item) => acc + item.length, 0)) {
            return;
        }

        if (!this.playingKeys[keyCode] && type === DOWN) {
            const playingKeys: PlayingData[] = [];

            noteArrays.forEach(noteArr => {
                if (!noteArr.length) {
                    return;
                }

                const noteInfo = noteArr[0];
                const id = ++this.playingId;
                playingKeys.push({
                    id,
                    code: keyCode,
                    down: time,
                    note: noteInfo.note,
                    up:0,
                    next: 0,
                });

                noteArr.shift();
                this.playSound(
                    noteInfo.note,
                    noteInfo.instr || this.getInstrCodeByKeyCode(keyCode),
                    id,
                    noteInfo.volume,
                    noteInfo.pitchShift + this.pitchShift,
                );
            });

            this.playingKeys[keyCode] = playingKeys;
            this.syncCurrentLine();
        }
    }

    soundKeyHandler(evt: KeyboardEvent, type: number) {
        skipEvent(evt);

        if (type === DOWN) {
            this.synthesizer.playSound({
                keyOrNote: evt.code,
                pitchShift: m.utils.parseInteger(this.settings.boardShift[0], 0),
                print: true,
                onlyStop: false,
                instrCode: ideService.useToneInstrument,
            });

            return;
        }

        if (type === UP) {
            this.synthesizer.playSound({
                keyOrNote: evt.code,
                pitchShift: m.utils.parseInteger(this.settings.boardShift[0], 0),
                onlyStop: true,
            });

            return;
        }
    }

    keyHandler = (evt: KeyboardEvent, type: number): unknown => {
        const code = evt.code;

        //console.log('keyHandler', code);

        if (unplayedKeysHash[code]) {
            return;
        }

        if (type === DOWN && (code === 'Enter' || (code === 'Space' && evt.ctrlKey))) { // Space Enter
            this.clear(true);
            this.getCurrBlockInfo(evt);

            return skipEvent(evt);
        }

        // переместить ниже ???
        if (code === 'Delete') {
            if (type === UP) {
                this.synthesizer.clearOut();
            }

            return skipEvent(evt);
        }

        if (type === DOWN) {
            if (evt.repeat || this.downedKeys[code]) {
                return skipEvent(evt);
            } else {
                this.downedKeys[code] = true;
            }
        } else {
            delete this.downedKeys[code];
        }

        // LINEPLAYER
        if (this.inputMode === 'linePlayer' && this.currBlock) {
            if (this.musicKeyCodes[code]) {
                this.handlePlayKey(evt.code, Date.now(), type);
                if (type === DOWN && (!this.countNotesForPlay())) {
                    this.getNextLinesForHandlePlay();
                }

                return skipEvent(evt);
            }
        }

        if (fCodes.find(item => item === code)) {
            return;
        }

        // TODO: setting for synthesizer
        // if (
        //     (this.inputMode === 'sound' || this.inputMode === 'linePlayer') &&
        //     type === UP &&
        //     presetKeys.includes(code)
        // ) {
        //   if (evt.code === 'F5') {
        //     this.synthesizer.setSettings(defaultSynthSettings);
        //   }
        //   else if (evt.code === 'F6') {
        //     this.synthesizer.setSettings(drumSettings);
        //   }
        //   else if (evt.code === 'F7') {
        //     this.synthesizer.setSettings(leftToRightBrassSection);
        //   }
        //
        //   return skipEvent(evt, true);
        // }

        // PLAYSOUND
        if (this.inputMode === 'sound') {
            return this.soundKeyHandler(evt, type);
        }

        return skipEvent(evt);
    }

    stopTick() {
        // if (this.multiPlayer) {
        //     this.multiPlayer.ticker.stop();
        // }
    }

     playTick(bpm: number) {
        // this.stopTick();
        //
        // if (this.multiPlayer) {
        //     this.multiPlayer.ticker.tickByBpm({
        //         bpm,
        //     }, () => {
        //         this.lastTickTime = Date.now();
        //
        //         this.multiPlayer.midiPlayer.getNotesMidi({
        //             notes: 'cowbell',
        //             instrCode: 'cowbell',
        //             durationMs: 1000,
        //         });
        //     });
        // }
    }

    clear(force: boolean, print: boolean = false) {
        // if (print) {
        //     if (this.multiBuffer) {
        //         this.multiBuffer.setValue(this.getOut2(true));
        //     }
        // }

        this.pressCount = 0;
        this.startUpTime = 0;
        this.noteArr = [];
        this.keyData = null;
        this.keySequence = [];

        this.playingId = 0;
        this.notesByChannels.left = [];
        this.notesByChannels.right = [];

        if (force) {
            this.bpmInfo = emptyBpmInfo();
        }
    }

    countNotesForPlay(): number {
        return this.notesByChannels.left.reduce((acc, item) => acc + item.length, 0)
            + this.notesByChannels.right.reduce((acc, item) => acc + item.length, 0);
    }

    syncCurrentLine() {
        //console.log(getCurrRowCm(<any>this.textInput), this.currRow);

        const firstRow = this.currRowInfo.first + this.currBlock.startRow;

        if(getCurrRowCm(<any>this.textInput) === firstRow) {
            return;
        }

        const editor = this.textInput;
        editor.setCursor(firstRow + 6, 0);
        editor.setCursor(firstRow, 0);
    }

    getNextLinesForHandlePlay(getNextRange = true, isInitEvent = false) {
        const data = m.getNextLinesForHandlePlay({
            block: this.currBlock,
            getNextRange: getNextRange,
            //isInitEvent: isInitEvent,
            currRowInfo: this.currRowInfo,
            skipLineByType: this.playingWithMidi? '$R' : null,
        });

        this.notesByChannels.left = data.notesByChannels.left;
        this.notesByChannels.right = data.notesByChannels.right;
        this.currRowInfo.first = data.rowsRange.first;
        this.currRowInfo.last = data.rowsRange.last;

        if (data.gotoTop) {
            this.syncCurrentLine();
        }
    }

    getCurrBlockInfo(evt: KeyboardEvent) {
        const x = {
            blocks: this.blocks,
            currBlock: null as TTextBlock,
            currRowInfo: this.currRowInfo,
            excludeIndex: [],
            midiBlockOut: null as TTextBlock,
            playBlockOut: '' as string | TTextBlock,
            topBlocksOut: [],
        };

        const rowInd = getCurrRowCm(this.textInput);
        x.currBlock = this.currBlock = x.blocks.find(
            (item) => item.startRow <= rowInd && item.endRow >= rowInd
        );

        x.currRowInfo.first = rowInd - x.currBlock.startRow; // в координатах блока
        x.currRowInfo.last = rowInd - x.currBlock.startRow;  // в координатах блока

        //console.log('getCurrBlockInfo.currBlock', this.currRowInfo.first, this.currBlock);
        //console.log('getCurrBlockInfo.blocks 1', [...blocks]);

        if (evt.ctrlKey) {
            m.getMidiConfig(x);
        }

        const playingWithMidi = this.playingWithMidi;
        if (x.playBlockOut) {
            this.playingWithMidi = true;
            //console.log('midiBlock', midiBlock);
            this.multiPlayer.tryPlayMidiBlock({
                blocks: x.blocks,
                playBlock: x.playBlockOut,
                cb: (type: string, data: any) => {
                    if (type === 'break' || type === 'finish') {
                        this.playingWithMidi = false;
                    }
                    //console.log(type, data);
                },
                dataByTracks: getDataByTracksFromSettings(this.settings),
                pitchShift: m.utils.parseInteger(this.settings.pitchShift[0]),
                //beatsWithOffsetMs: un.getBeatsByBpmWithOffset(90, 8),
            });
        }

        if (x.currBlock && x.currBlock !== x.midiBlockOut) {
            this.getNextLinesForHandlePlay(false, !playingWithMidi);
            this.syncCurrentLine();
        }

        if (evt.ctrlKey && evt.shiftKey) {
            if (this.recorder) {
                this.recorder.break();
                this.recorder = null;
            }

            this.recorder = new WavRecorder(this.synthesizer.ctx);
            this.recorder.start();

            //console.log('ctrl + shift');
        }
    }

    onConnect() {
        let text = this.textInput.getValue() + '\n';

        this.settings = m.getFileSettings(m.getTextBlocks(text));
        this.pitchShift = m.getPitchShiftSetting(this.settings);
        //console.log('onConnect.settings', this.settings);

        if (this.settings['import'].length) {
            //text = text + uc.readFileSync(uc.dirname(this.uri) + '/' + this.settings['import'][0]); // jjkl
        }

        let blocks = m.getTextBlocks(text);

        blocks.forEach(block => {
            block.rows = block.rows.map(text => {
                return m.clearEndComment(text).trim();
            });
        });

        this.blocks = blocks;
    }

    setInputMode(val: InputMode) {
        //console.log('setInputMode', val);


        this.inputMode = val;
    }
}

// увезти в ITBand
// https://github.com/also/soundtouch-js/blob/master/src/js/buffer.js
