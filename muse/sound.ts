import WebAudioFontPlayer from 'webaudiofont';
import {
  freqByNoteHash,
  codeByNoteHash,
  noteByKeyHash,
  getNoteByStepAndOctave,
  noteLatByNoteHash,
} from './freq';
import { fullOctaveBlocks } from './keyboard';
import { drumCodes } from './drums';
import * as un from './utils-note';

const instruments: { [code: number]: any } = {};
const loadingInstruments: { [code: number]: boolean } = {};
const drumKeys: { [code: string]: number } = {};
const fontPlayer = new WebAudioFontPlayer();
const DRUM_PREFIX = 'drum_';

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

  static get Instruments(): { [code: number]: any } {
    return instruments;
  }

  get instruments(): { [code: number]: any } {
    return Sound.Instruments;
  }

  get loadingInstruments(): { [code: number]: any } {
    return Sound.LoadingInstruments;
  }

  static get LoadingInstruments(): { [code: number]: any } {
    return loadingInstruments;
  }

  static get DrumKeys(): { [code: string]: number } {
    return drumKeys;
  }

  get drumKeys(): { [code: string]: number } {
    return Sound.DrumKeys;
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

  static AddSound(id: string | number) {
    if (!id) {
      return;
    }

    if (typeof id === 'number') {
      Sound.AddToneSound(id);

      return;
    }

    let drumId = parseInt(id.replace(DRUM_PREFIX, ''), 10);
    drumId = isNaN(drumId) ? null : drumId;

    if (!drumId) {
      return;
    }

    Sound.AddDrumSound(drumId);
  }

  addMidiSound(id: number) {
    Sound.AddToneSound(id);
  }

  addToneSound(id: number) {
    Sound.AddToneSound(id);
  }

  static AddToneSound(id: number) {
    if (!id) {
      return;
    }

    if (Sound.Instruments[id] || Sound.LoadingInstruments[id]) {
      return;
    }

    const fontInfo = fontPlayer.loader.instrumentInfo(id);

    Sound.LoadingInstruments[id] = true;

    fontPlayer.loader.startLoad(
      new AudioContext() /*this.ctx*/,
      fontInfo.url,
      fontInfo.variable
    );
    fontPlayer.loader.waitLoad(() => {
      Sound.Instruments[id] = window[fontInfo.variable];
      delete Sound.LoadingInstruments[id];
    });
  }

  addDrumSound(drumId: number) {
    Sound.AddDrumSound(drumId);
  }

  static AddDrumSound(drumId: number) {
    if (!drumId) {
      return;
    }

    // console.log(this.fontPlayer.loader.drumKeys()); //
    // console.log(this.fontPlayer.loader.drumTitles()); //
    const drumIndex = fontPlayer.loader.findDrum(drumId);
    const drumInfo = fontPlayer.loader.drumInfo(drumIndex);
    const id = DRUM_PREFIX + drumId;
    Sound.DrumKeys[id] = drumInfo.pitch;

    if (Sound.Instruments[id] || Sound.LoadingInstruments[id]) {
      return;
    }

    Sound.LoadingInstruments[id] = true;
    fontPlayer.loader.startLoad(
      new AudioContext() /*this.ctx*/,
      drumInfo.url,
      drumInfo.variable
    );

    fontPlayer.loader.waitLoad(() => {
      Sound.Instruments[id] = window[drumInfo.variable];
      delete Sound.LoadingInstruments[id];
    });
  }

  getNoteSame(val: string): string {
    val = (val || '').trim();

    let result = freqByNoteHash[val.toLocaleLowerCase()]
      ? val.toLocaleLowerCase()
      : '';

    result = result || (drumCodes[val] ? val : '');

    return result;
  }

  getNoteLat(val: string): string {
    val = (val || '').trim();

    let result = noteLatByNoteHash[val.toLocaleLowerCase()];

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

      if (info && !info.instr) {
        playingKey[key] = {
          ...info,
          instr: (DRUM_PREFIX + 'undefined') as any,
        };

        return;
      }

      const drumIndex = this.fontPlayer.loader.findDrum(info.instr);
      const drumInfo = this.fontPlayer.loader.drumInfo(drumIndex);
      this.addDrumSound(info.instr);

      playingKey[key] = {
        ...info,
        code: drumInfo.pitch,
        instr: (DRUM_PREFIX + info.instr) as any,
      };
    });

    return playingKey;
  }
}
