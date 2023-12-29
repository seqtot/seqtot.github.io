'use babel';

import { WebAudioFontPlayer } from '../waf-player/player';
import { preparePreset } from '../waf-player/prepare';

import {
    freqByNoteHash,
    codeByNoteHash,
    noteLatByNoteHash,
} from './freq';
import * as un from './utils';
import { DEFAULT_TONE_INSTR } from './keyboards';
import { drumCodes } from './drums';
import { hardcodedInstruments, instruments as instruments2 } from './instruments';
import {WaveZone} from '../waf-player/otypes';

export const instruments = instruments2;
const loadingInstruments: { [code: number]: boolean } = {};
const drumKeys: { [code: string]: number } = {};

export type KeyInfo = {
    oscil?: OscillatorNode;
    midi?: any;
    volume: number;
    id: string | number;

    node: GainNode;
    code: number;
    octave: string;
    noteStep: string,
    instrCode?: number;
    noteLat: string;
    noteRus: string;

    isDrum?: boolean;
    freq?: number;

    zone?: WaveZone;
};

export type PlayingItem = {
    oscil?: OscillatorNode;
    midi?: any;
    volume: GainNode;

    pauseTimeout: number;
    durationTimeout: number;
    dfr: un.Deferred;
    isSound: boolean;
    node?: GainNode;
};

const fontPlayer = new WebAudioFontPlayer();
const fontLoader = fontPlayer.loader;
const ctx: AudioContext = new AudioContext();
const masterGain = ctx.createGain();
masterGain.gain.value = 1;
masterGain.connect(ctx.destination);

export class Sound {
    oscills: { [key: string]: OscillatorNode };
    keysAndNotes: { [key: string]: KeyInfo } = {};
    static MasterVolume = 100;

    readonly instrSettings: {[key: string]: { [key: string]: KeyInfo }} = {};

    readonly fontPlayer = fontPlayer;
    readonly fontLoader = fontLoader;

    static get masterGain(): GainNode {
        return masterGain;
    }

    get masterVolume(): number {
        return Sound.MasterVolume;
    }

    set masterVolume(val: number) {
        Sound.MasterVolume = val;
    }

    static get ctx(): AudioContext {
        return ctx;
    }

    get ctx(): AudioContext {
        return ctx;
    }

    static get Instruments(): { [code: number]: any } {
        return instruments;
    }

    get instruments(): { [code: number]: any } {
        return instruments;
    }

    static get LoadingInstruments(): { [code: number]: any } {
        return loadingInstruments;
    }

    get loadingInstruments(): { [code: number]: any } {
        return loadingInstruments;
    }

    static get DrumKeys(): { [code: string]: number } {
        return drumKeys;
    }

    get drumKeys(): { [code: string]: number } {
        return drumKeys;
    }

    async waitLoadingAllInstruments(): Promise<unknown> {
        const dfr = new un.Deferred();

        if (!Object.keys(Sound.LoadingInstruments).length) {
            dfr.resolve(true);

            return dfr.promise;
        }

        let interval = setInterval(() => {
            if (!Object.keys(Sound.LoadingInstruments).length) {
                clearInterval(interval);

                dfr.resolve(true);
            }
        }, 100);

        return dfr.promise;
    }

    static setToneSound(id: number, varName: string, fontObj: any) {
        window[varName] = fontObj;
        Sound.Instruments[id] = window[varName];
        preparePreset({
            audioContext: this.ctx,
            preset: <any>window[varName],
            var: varName,
            id
        });
    }

    static AddToneSound(id: number) {
        //console.log('Sound.AddToneSound', id);

        if (!id) {
            return;
        }

        if (Sound.Instruments[id] || Sound.LoadingInstruments[id]) {
            return;
        }

        // это захардкоженный инструмент
        if (hardcodedInstruments[id]) {
            const variable = hardcodedInstruments[id];
            const instrObj = window[variable];

            // и он есть
            if (instrObj) {
                //console.log('prepare', id);
                preparePreset({
                    audioContext: this.ctx,
                    preset: <any>instrObj,
                    var: variable,
                    id
                });
                instruments[id] = instrObj;

                delete Sound.LoadingInstruments[id];

                return;
            }
        }

        if (window.location.origin === 'file://') {
            //console.log(`Sound ${id} not found`);
            return;
        }

        if (id > 10000) {
            return;
        }

        //console.log('AddToneSound', id);

        const fontInfo = fontLoader.instrumentInfo(id);

        Sound.LoadingInstruments[id] = true;
        fontLoader.startLoad(
            Sound.ctx,
            fontInfo.url,
            fontInfo.variable,
            id
        );

        fontLoader.waitLoad(() => {
            //console.log('waitLoad', id);
            Sound.Instruments[id] = window[fontInfo.variable];
            delete Sound.LoadingInstruments[id];
        });
    }

    static AddDrumSound(drumId: number) {
        if (!drumId) {
            return;
        }

        //console.log(this.fontLoader.drumKeys()); //
        //console.log(this.fontLoader.drumTitles()); //
        const drumIndex = fontLoader.findDrum(drumId);
        const drumInfo = fontLoader.drumInfo(drumIndex);
        const id = un.drumPrefix + drumId;
        Sound.DrumKeys[id] = drumInfo.pitch;

        // это захардкоженный инструмент
        if (hardcodedInstruments[id]) {
            const variable = hardcodedInstruments[id];
            const instrObj = window[variable];

            // и он есть
            if (instrObj) {
                preparePreset({
                    audioContext: this.ctx,
                    preset: <any>instrObj,
                    var: variable,
                    id
                });
                instruments[id] = instrObj;

                delete Sound.LoadingInstruments[id];

                return;
            }
        }

        // href: "file:///C:/Users/asdf/AppData/Local/atom/app-1.60.0/resources/app.asar/static/index.html"
        // origin: "file://"
        // pathname: "/C:/Users/asdf/AppData/Local/atom/app-1.60.0/resources/app.asar/static/

        if (window.location.origin === 'file://') {
            //console.log(`Sound ${id} not found`);

            return;
        }

        Sound.LoadingInstruments[id] = true;
        fontLoader.startLoad(
            Sound.ctx,
            drumInfo.url,
            drumInfo.variable,
            id
        );

        fontLoader.waitLoad(() => {
            Sound.Instruments[id] = window[drumInfo.variable];
            delete Sound.LoadingInstruments[id];
        });
    }

    static AddSound(id: string | number) {
        let safeId = un.parseInteger(id, -1);

        if (safeId > -1) {
            Sound.AddToneSound(safeId);

            return;
        }

        if (!id || typeof id !== 'string') {
            return;
        }

        let drumId = un.parseInteger(id.replace(un.drumPrefix, ''), -1);

        if (drumId > -1) {
            Sound.AddDrumSound(drumId);
        }
    }

    addToneSound(instumentId: number) {
        Sound.AddToneSound(instumentId);
    }

    addDrumSound(drumId: number) {
        Sound.AddDrumSound(drumId);
    }

    // тональные или ударные ноты
    getNoteSame(val: string): string {
        val = (val || '').toLocaleLowerCase().trim();

        //if (val === 'DEF' || val === 'ДЭФ') return val;

        let result = freqByNoteHash[val] ? val : '';

        result = result || (drumCodes[val] ? val : '');

        return result;
    }

    getNoteLat(val: string): string {
        return Sound.GetNoteLat(val);
    }

    static GetNoteLat(val: string): string {
        val = (val || '').toLocaleLowerCase().trim();

        //if (val === 'DEF' || val === 'ДЭФ') return 'df';

        let result = noteLatByNoteHash[val];

        result = freqByNoteHash[result] ? result : '';
        result = result || (drumCodes[val] ? val : '');

        return result;
    }

    // from itbanddev
    // getSettingsForKeys(settings: any): { [key: string]: KeyInfo } {
    //   const keysAndNotes: { [key: string]: KeyInfo } = {};
    //
    //   fullOctaveBlocks.forEach((octaveInfo) => {
    //     if (!settings.octaves[octaveInfo.name]) {
    //       return;
    //     }
    //
    //     const stepKeys = octaveInfo.value;
    //     const octaveVowel = settings.octaves[octaveInfo.name].octave;
    //
    //     Object.keys(stepKeys).forEach((key) => {
    //       const noteLat = getNoteByStepAndOctave(
    //           stepKeys[key],
    //           octaveVowel,
    //           'lat'
    //       );
    //       const noteRus = getNoteByStepAndOctave(
    //           stepKeys[key],
    //           octaveVowel,
    //           'rus'
    //       );
    //
    //       //console.log(octaveVowel, noteLat, noteRus);
    //
    //       keysAndNotes[key] = {
    //         ...settings.octaves[octaveInfo.name],
    //         noteLat,
    //         noteRus,
    //         code: codeByNoteHash[noteLat],
    //       };
    //     });
    //   });
    //
    //   Object.keys(keysAndNotes).forEach((key) => {
    //     this.addMidiSound(keysAndNotes[key].instr);
    //   });
    //
    //   if (!settings.drums) {
    //     return keysAndNotes;
    //   }
    //
    //   Object.keys(settings.drums).forEach((key) => {
    //     const info = settings.drums[key] as KeyInfo;
    //
    //     if (info && !info.instr) {
    //       keysAndNotes[key] = {
    //         ...info,
    //         instrCode: (un.drumPrefix + 'undefined') as any,
    //       };
    //
    //       return;
    //     }
    //
    //     const drumIndex = fontPlayer.loader.findDrum(info.instr);
    //     const drumInfo = fontPlayer.loader.drumInfo(drumIndex);
    //     this.addDrumSound(info.instr);
    //
    //     keysAndNotes[key] = {
    //       ...info,
    //       code: drumInfo.pitch,
    //       instrCode: (un.drumPrefix + info.instr) as any,
    //     };
    //   });
    //
    //   return keysAndNotes;
    // }

    getSettingsForKeysAndNotes(settings: any): { [key: string]: KeyInfo } {
        const keysAndNotes: { [key: string]: KeyInfo } = {};

        if (settings.keys) {
            const obj = un.getKeysFromText(settings.keys, DEFAULT_TONE_INSTR);

            Object.keys(obj).forEach((key) => {
                const item = obj[key];
                const noteLat = this.getNoteLat(item.note || item.note);
                const noteRus = item.note;

                keysAndNotes[key] = <KeyInfo>{
                    noteStep: noteLat[0],
                    octave: noteLat[1],
                    volume: item.volume,
                    noteLat,
                    noteRus,
                    code: codeByNoteHash[noteLat],
                    instrCode: item.instrCode,
                };
            });
        }

        //console.log('keysAndNotes', { ...keysAndNotes });

        Object.keys(keysAndNotes).forEach((key) => {
            this.addToneSound(keysAndNotes[key].instrCode);
        });

        if (!settings.drums) {
            return keysAndNotes;
        }

        Object.keys(settings.drums).forEach((key) => {
            const info = settings.drums[key] as KeyInfo;
            const drumIndex = fontLoader.findDrum(info.instrCode);
            const drumInfo = fontLoader.drumInfo(drumIndex);
            this.addDrumSound(info.instrCode);

            keysAndNotes[key] = {
                ...info,
                code: drumInfo.pitch,
                instrCode: (un.drumPrefix + info.instrCode) as any,
                isDrum: true,
            };
        });

        return keysAndNotes;
    }
}

// добавление инструментов
Object.keys(hardcodedInstruments).forEach(key => {
    Sound.AddSound(key);
});
