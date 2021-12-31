import WebAudioFontPlayer from 'webaudiofont';
import {
  freqByNoteHash,
  codeByNoteHash,
  noteByKeyHash,
  getNoteByStepAndOctave,
  noteLatByNoteHash,
} from './freq';
import { fullOctaveBlocks } from './keyboard';
import { drumCodes } from './midi';
import * as un from './utils-note';

const instruments: { [code: number]: any } = {};
const loadingInstruments: { [code: number]: boolean } = {};
const drumKeys: { [code: string]: number } = {};

export type KeyInfo = {
  oscil?: OscillatorNode;
  midi?: any;
  volume: number;

  node: GainNode;
  code: number;
  octave: string;
  instr: number;
  noteLat: string;
  noteRus: string;

  freq?: number;
};

export type PlayingItem = {
  oscil?: OscillatorNode;
  midis?: any[];
  volume: GainNode;

  pauseTimeout: number;
  durationTimeout: number;
  dfr: un.Deferred;
  isSound: boolean;
  node?: GainNode;
};

// playingSounds: {
//   [key: string]: {
//     oscil: OscillatorNode;
//     node: GainNode;
//     midi?: any;
//   };
// } = {};

export class Sound {
  ctx: AudioContext;
  oscills: { [key: string]: OscillatorNode };
  playingKey: { [key: string]: KeyInfo } = {};
  fontPlayer = new WebAudioFontPlayer();
  // fontInfo: any;
  // fontInstr: any;

  get instruments(): { [code: number]: any } {
    return instruments;
  }

  get loadingInstruments(): { [code: number]: any } {
    return loadingInstruments;
  }

  get drumKeys(): { [code: string]: number } {
    return drumKeys;
  }

  addMidiSound(instumentId: number) {
    if (this.instruments[instumentId] || this.loadingInstruments[instumentId]) {
      return;
    }

    const fontInfo = this.fontPlayer.loader.instrumentInfo(instumentId);

    this.loadingInstruments[instumentId] = true;

    this.fontPlayer.loader.startLoad(this.ctx, fontInfo.url, fontInfo.variable);
    this.fontPlayer.loader.waitLoad(() => {
      this.instruments[instumentId] = window[fontInfo.variable];
      delete this.loadingInstruments[instumentId];
    });
  }

  addDrumSound(drumId: number) {
    if (!drumId) {
      return;
    }

    // console.log(this.fontPlayer.loader.drumKeys()); //
    // console.log(this.fontPlayer.loader.drumTitles()); //
    const drumIndex = this.fontPlayer.loader.findDrum(drumId);
    const drumInfo = this.fontPlayer.loader.drumInfo(drumIndex);
    const id = 'drum_' + drumId;
    this.drumKeys[id] = drumInfo.pitch;

    if (this.instruments[id] || this.loadingInstruments[id]) {
      return;
    }

    this.loadingInstruments[id] = true;
    this.fontPlayer.loader.startLoad(this.ctx, drumInfo.url, drumInfo.variable);

    this.fontPlayer.loader.waitLoad(() => {
      this.instruments[id] = window[drumInfo.variable];
      delete this.loadingInstruments[id];
    });
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

  getSettingsForKeys(settings: any): { [key: string]: KeyInfo } {
    const playingKey: { [key: string]: KeyInfo } = {};

    fullOctaveBlocks.forEach((octaveInfo) => {
      if (!settings.octaves[octaveInfo.name]) {
        return;
      }

      const stepKeys = octaveInfo.value;
      const octaveVowel = settings.octaves[octaveInfo.name].octave;

      Object.keys(stepKeys).forEach((key) => {
        const noteLat = getNoteByStepAndOctave(
          stepKeys[key],
          octaveVowel,
          'lat'
        );
        const noteRus = getNoteByStepAndOctave(
          stepKeys[key],
          octaveVowel,
          'rus'
        );

        // console.log(octaveVowel, noteLat, noteRus);

        playingKey[key] = {
          ...settings.octaves[octaveInfo.name],
          noteLat,
          noteRus,
          code: codeByNoteHash[noteLat],
        };
      });
    });

    Object.keys(playingKey).forEach((key) => {
      this.addMidiSound(playingKey[key].instr);
    });

    if (!settings.drums) {
      return playingKey;
    }

    Object.keys(settings.drums).forEach((key) => {
      const info = settings.drums[key] as KeyInfo;
      const drumIndex = this.fontPlayer.loader.findDrum(info.instr);
      const drumInfo = this.fontPlayer.loader.drumInfo(drumIndex);
      this.addDrumSound(info.instr);

      playingKey[key] = {
        ...info,
        code: drumInfo.pitch,
        instr: ('drum_' + info.instr) as any,
      };
    });

    return playingKey;
  }
}
