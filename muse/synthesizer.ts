'use babel';

// https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/linearRampToValueAtTime
// gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 2);

import { freqByNoteHash, noteByKeyHash } from './freq';
import { Sound, KeyInfo } from './sound';
import { offsetFotNoteStep } from './drums';

function isPresent(value: any): boolean {
  return value !== null && value !== undefined;
}

export class Synthesizer extends Sound {
  isConnected = false;
  playingSounds: {
    [key: string]: KeyInfo;
  } = {};
  playingTones: KeyInfo[] = [];
  outEditor: any;
  masterVolume = 100;

  connect({
    ctx,
    oscills,
    outEditor,
  }: {
    ctx: AudioContext;
    oscills?: { [key: string]: OscillatorNode };
    outEditor?: any;
  }) {
    this.oscills = oscills || {};
    //this.ctx = ctx;
    this.outEditor = outEditor;
    this.isConnected = true;
  }

  protected playSoundSynth = (noteOrKey: string, onlyStop?: boolean) => {
    //console.log('playSoundSynth', noteOrKey);

    const { playingSounds, ctx, oscills } = this;

    let note = noteByKeyHash[noteOrKey] || noteOrKey;
    note = (note || '').toLocaleLowerCase();

    if (!freqByNoteHash[note]) {
      return;
    }

    const playing = playingSounds[note];
    let fadeOut = 0; // ms
    let fadeIn = 0; // ms

    if (playing) {
      playing.node.gain.setValueAtTime(
        playing.node.gain.value,
        ctx.currentTime
      );
      playing.node.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + fadeOut / 1000
      );
      delete playingSounds[note];

      setTimeout(() => {
        playing.oscil.disconnect(playing.node);
      }, fadeOut);

      return;
    }

    if (onlyStop) {
      return;
    }

    let oscil: OscillatorNode = oscills[note];

    if (!oscil) {
      oscil = ctx.createOscillator();
      oscil.type = 'sine';
      oscil.frequency.value = freqByNoteHash[note];
      oscil.start(0); // context.currentTime
      oscills[note] = oscil;
    }

    const node = ctx.createGain();
    let volume = 1;

    if (/о/.test(note)) {
      volume = 0.35;
    } else if (/а/.test(note) || /э/.test(note)) {
      volume = 0.2;
    }

    playingSounds[note] = { oscil, node } as any;

    node.gain.setValueAtTime(0, ctx.currentTime);
    oscil.connect(node);
    node.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn / 1000); // jjkl
    node.connect(ctx.destination);

    this.addToOut(note);
  }; // playSoundSynth

  playSound = (
    keyOrObj:
      | string
      | {
          keyOrNote: string;
          id?: string | number;
          instrCode?: string | number;
          print?: boolean;
          onlyStop?: boolean;
        },
    onlyStop?: boolean
  ) => {
    let keyOrNote =
      typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.keyOrNote;
    let id = typeof keyOrObj === 'string' ? 0 : keyOrObj.id || 0;
    let print = typeof keyOrObj === 'string' ? true : !!keyOrObj.print;
    let soundInfo = this.keysAndNotes[keyOrNote];

    let note = this.getNoteSame(keyOrNote);
    const noteLat = this.getNoteLat(note);

    //console.log('playSound', id);

    if (!soundInfo && !note) {
      return;
    }

    if (!soundInfo && noteLat) {
      soundInfo = this.keysAndNotes[noteLat];
    }

    //console.log('playSound', keyInfo, this.instruments);

    if (
      soundInfo &&
      isPresent(soundInfo.instr) &&
      this.instruments[soundInfo.instr]
    ) {
      this.playSoundMidi({ id, ...soundInfo }, print, onlyStop);
    } else if (note) {
      this.playSoundSynth(note, onlyStop);
    }
  }; // playSound

  setPlayingTones() {
    const result: KeyInfo[] = [];

    for (const sound of (Object as any).values(this.playingSounds)) {
      if (sound.noteLat && sound.code && sound.freq) {
        result.push(sound);
      }
    }

    result.sort((a, b) => {
      if (a.code > b.code) {
        return 1;
      }

      if (a.code < b.code) {
        return -1;
      }
      return 0;
    });

    this.playingTones = result;
  }

  protected stopSound(info: KeyInfo) {
    let id = info.noteLat + '-' + (info.id || 0);
    const playing = this.playingSounds[id];

    if (!playing) {
      return;
    }

    let fadeOut = 0; // ms
    let fadeIn = 0; // ms

    // stop midi
    if (playing.midi && playing.midi.cancel) {
      playing.midi.cancel();
      playing.midi = null;

      delete this.playingSounds[id];
    }

    // stop synth
    if (playing.node) {
      playing.node.gain.setValueAtTime(
        playing.node.gain.value,
        this.ctx.currentTime
      );
      playing.node.gain.linearRampToValueAtTime(
        0,
        this.ctx.currentTime + fadeOut / 1000
      );

      setTimeout(() => {
        if (playing.oscil && playing.oscil.disconnect) {
          playing.oscil.disconnect(playing.node);
        }
      }, fadeOut);

      return;
    }

    delete this.playingSounds[id];
  }

  addToOut(val: string) {
    if (this.outEditor) {
      val = this.outEditor.getValue().trim() + ' ' + val;
      // atom.clipboard.write(val);
      this.outEditor.setValue(val);
    }
  }

  protected playSoundMidi = (
    info: KeyInfo,
    print: boolean,
    onlyStop?: boolean
  ) => {
    this.stopSound(info);

    if (onlyStop) {
      return this.setPlayingTones();
    }

    const fontInstr = this.instruments[info.instr];

    if (!fontInstr) {
      return this.setPlayingTones();
    }

    const id = info.noteLat + '-' + (info.id || 0);
    const { playingSounds, ctx } = this;
    let toneOffset = 0;

    if (info.isDrum && this.playingTones[0]) {
      toneOffset = offsetFotNoteStep[this.playingTones[0].noteStep] || 0;
      //console.log('playSoundMidi.toneOffset', toneOffset);
    }
    //console.log('playSoundMidi.info', info);

    // fontPlayer.queueWaveTable(ctx, ctx.destination, instr, 0, 12 * 3 + 3, 10);
    info.midi = this.fontPlayer.queueWaveTable(
      ctx,
      ctx.destination,
      fontInstr,
      0,
      info.code + toneOffset,
      1234567,
      (info.volume * this.masterVolume) / 100
    );

    playingSounds[id] = info;

    this.setPlayingTones();

    //console.log('playSoundMidi.plaingTones', [...this.playingTones]);

    if (print) {
      this.addToOut(info.noteRus);
    }
  }; // playSoundMidi

  setSettings(settings: any, instrName?: string): { [key: string]: KeyInfo } {
    const keysAndNotes = this.getSettingsForKeysAndNotes(settings);
    instrName = instrName || 'default';

    //console.log('keysAndNotes', keysAndNotes);

    Object.keys(keysAndNotes).forEach((key) => {
      const item = keysAndNotes[key];
      item.freq = freqByNoteHash[item.noteLat];

      if (item && item.noteLat) {
        keysAndNotes[item.noteLat] = item;
      }
    });

    this.keysAndNotes = keysAndNotes; // TODO: избавиться
    this.instrSettings[instrName] = keysAndNotes;

    return keysAndNotes;
  }

  clearOut() {
    if (this.outEditor) {
      this.outEditor.setValue('');
    }
  }
} // setSettings
