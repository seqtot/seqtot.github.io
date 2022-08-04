'use babel';

import WebAudioFontPlayer from 'webaudiofont';
// import {
//   freqByNoteHash,
//   codeByNoteHash,
//   noteByKeyHash,
//   getNoteByStepAndOctave,
//   noteLatByNoteHash,
// } from './freq';
// import { fullOctaveBlocks } from './keyboard';
// import { drumCodes } from './drums';
// import * as un from './utils-note';

import { freqByNoteHash, codeByNoteHash, noteLatByNoteHash } from './freq';
import * as un from './utils-note';
import { MIDI_INSTR } from './keyboards';
import { drumCodes } from './drums';
import { hardcodedInstruments } from './instruments';

const instruments: { [code: number]: any } = {};
const loadingInstruments: { [code: number]: boolean } = {};
const drumKeys: { [code: string]: number } = {};
const DRUM_PREFIX = 'drum_';

export type KeyInfo = {
  oscil?: OscillatorNode;
  midi?: any;
  volume: number;
  id: string | number;

  node: GainNode;
  code: number;
  octave: string;
  noteStep: string;
  instr: number;
  instrCode?: number;
  noteLat: string;
  noteRus: string;

  isDrum?: boolean;
  freq?: number;
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

export class Sound {
  oscills: { [key: string]: OscillatorNode };
  keysAndNotes: { [key: string]: KeyInfo } = {};
  readonly instrSettings: { [key: string]: { [key: string]: KeyInfo } } = {};

  readonly fontPlayer = fontPlayer;
  readonly fontLoader = fontLoader;

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

  static AddToneSound(id: number) {
    if (!id) {
      return;
    }

    if (Sound.Instruments[id] || Sound.LoadingInstruments[id]) {
      return;
    }

    const fontInfo = fontLoader.instrumentInfo(id);

    // это захардкоженный инструмент
    if (hardcodedInstruments[id]) {
      const variable = hardcodedInstruments[id];
      const instr = window[variable];

      fontPlayer.adjustPreset(this.ctx, instr);
      instruments[id] = instr;

      delete Sound.LoadingInstruments[id];

      return;
    }

    if (window.location.origin === 'file://') {
      console.log(`Sound ${id} not found`);

      return;
    }

    Sound.LoadingInstruments[id] = true;
    fontLoader.startLoad(Sound.ctx, fontInfo.url, fontInfo.variable);
    fontLoader.waitLoad(() => {
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
    const id = DRUM_PREFIX + drumId;
    Sound.DrumKeys[id] = drumInfo.pitch;

    if (window.location.origin === 'file://') {
      console.log(`Sound ${id} not found`);

      return;
    }

    // это захардкоженный инструмент
    if (hardcodedInstruments[id]) {
      const variable = hardcodedInstruments[id];
      const instr = window[variable];

      fontPlayer.adjustPreset(this.ctx, instr);
      instruments[id] = instr;

      delete Sound.LoadingInstruments[id];

      return;
    }

    // href: "file:///C:/Users/asdf/AppData/Local/atom/app-1.60.0/resources/app.asar/static/index.html"
    // origin: "file://"
    // pathname: "/C:/Users/asdf/AppData/Local/atom/app-1.60.0/resources/app.asar/static/

    if (window.location.origin === 'file://') {
      return;
    }

    Sound.LoadingInstruments[id] = true;
    fontLoader.startLoad(Sound.ctx, drumInfo.url, drumInfo.variable);

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

    let drumId = un.parseInteger(id.replace(DRUM_PREFIX, ''), -1);

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

  getNoteSame(val: string): string {
    val = (val || '').toLocaleLowerCase().trim();

    let result = freqByNoteHash[val] ? val : '';

    result = result || (drumCodes[val] ? val : '');

    return result;
  }

  getNoteLat(val: string): string {
    val = (val || '').toLocaleLowerCase().trim();
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
  //         instr: (DRUM_PREFIX + 'undefined') as any,
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
  //       instr: (DRUM_PREFIX + info.instr) as any,
  //     };
  //   });
  //
  //   return keysAndNotes;
  // }

  getSettingsForKeysAndNotes(settings: any): { [key: string]: KeyInfo } {
    const keysAndNotes: { [key: string]: KeyInfo } = {};

    if (settings.keys) {
      const obj = un.getKeysFromText(settings.keys, MIDI_INSTR);

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
          instr: item.instrCode,
          instrCode: item.instrCode,
        };
      });
    }

    //console.log('keysAndNotes', { ...keysAndNotes });

    Object.keys(keysAndNotes).forEach((key) => {
      this.addToneSound(keysAndNotes[key].instr);
    });

    if (!settings.drums) {
      return keysAndNotes;
    }

    Object.keys(settings.drums).forEach((key) => {
      const info = settings.drums[key] as KeyInfo;
      const drumIndex = fontLoader.findDrum(info.instr);
      const drumInfo = fontLoader.drumInfo(drumIndex);
      this.addDrumSound(info.instr);

      keysAndNotes[key] = {
        ...info,
        code: drumInfo.pitch,
        instr: ('drum_' + info.instr) as any,
        isDrum: true,
      };
    });

    return keysAndNotes;
  }
}

// добавление инструментов
Object.keys(hardcodedInstruments).forEach((key) => {
  Sound.AddSound(key);
});
