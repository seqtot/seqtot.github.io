import { Sound } from './sound';
import { MidiPlayer } from './midi-player';
import { toneAndDrumPlayerSettings, MIDI_INSTR } from './keyboards';
import { getInstrCodeBy } from './instruments';
import * as un from './utils-note';
import { Ticker } from './ticker';

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
  name?: string;
  path?: string;
  beats?: number[];
  use?: boolean;
  midi?: string;
};

type OutLoopsInfo = {
  repeat: number;
  // rowLoops играются последовательно
  rowLoops: {
    ids: (string | number)[];
    beatsMs: number[];
  }[];
  durationQ?: number;
  durationMs?: number;
};

export class MultiPlayer {
  isPlaying = false;
  ctx: AudioContext;
  files: string[];
  soundSourceSet: SoundSourceSet = [];
  startTime: number;
  duration: number;
  offset: number;
  private playSessions: { [key: string]: any }[] = [];
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
    beatsWithOffsetMs: number[];
    startTimeSec: number;
    delayMs?: number;
    bpm?: number;
    repeat?: number;
  }) {
    this.ticker.stop();
    const delayMs = params.delayMs | 0;
    const beatsWithOffsetMs = Array.isArray(params.beatsWithOffsetMs)
      ? params.beatsWithOffsetMs
      : [];

    if (!beatsWithOffsetMs.length) {
      return;
    }

    //console.log('playTick', params.beatsMs);

    this.ticker.start(
      {
        beatsWithOffsetMs: [...beatsWithOffsetMs],
        startTimeSec: params.startTimeSec || 0,
      },
      () => {
        this.midiPlayer.getNotesMidi({
          notes: 'cowbell',
          instrCode: 'cowbell',
          durationMs: 1000,
        });
      }
    );
  }

  get currentTime(): number {
    return this.ctx.currentTime;
  }

  // async playFractions(params: {
  //   files: string[] | Info[];
  //   offsetSec?: number;
  //   durationSec?: number;
  //   repeatCount?: number;
  //   beatOffsetMs?: number;
  //   beatsWithOffsetMs?: number[];
  //   startDelaySec?: number;
  //   playMidiBlock?: string | un.TextBlock;
  //   midiTextBlocks?: string | un.TextBlock[];
  // }) {
  //   //console.log('play.files', files);
  //   let files = params.files;
  //   let offsetSec = params.offsetSec || 0;
  //   let durationSec = params.durationSec || 0;
  //   let repeatCount = params.repeatCount || 1;
  //   let beatsWithOffsetMs = Array.isArray(params.beatsWithOffsetMs)
  //     ? params.beatsWithOffsetMs
  //     : [];

  //   //console.log('beatsWithOffsetMs', beatsWithOffsetMs);

  //   let startDelaySec = params.startDelaySec || 0;

  //   let playing = 0;
  //   let repeated = 0;
  //   const sessionInfo = {
  //     break: false,
  //   };
  //   let useTick = false;
  //   let hasBeats = !!beatsWithOffsetMs.length;
  //   let midiOut: TextBlock | string;

  //   if (
  //     params.playMidiBlock &&
  //     Array.isArray(params.midiTextBlocks) &&
  //     params.midiTextBlocks.length
  //   ) {
  //     midiOut = un.getOutBlock(params.playMidiBlock, params.midiTextBlocks);
  //   }

  //   this.soundSourceSet = [];
  //   this.offset = offsetSec;
  //   this.duration = 0;

  //   const buffers: {
  //     path: string;
  //     buffer: AudioBuffer;
  //   }[] = [];

  //   const filesInfo: Info[] = files.map((item) => {
  //     if (typeof item === 'string') {
  //       return {
  //         path: item,
  //         name: item,
  //         use: true,
  //       };
  //     }

  //     return item;
  //   });

  //   let outLoops: OutLoopsInfo;

  //   this.midiPlayer.stopAndClear();
  //   if (midiOut) {
  //     outLoops = this.getLoopsInfo({
  //       repeat: 1, // jjkl
  //       beatOffsetMs: params.beatOffsetMs || beatsWithOffsetMs[0],
  //       beatsMs: beatsWithOffsetMs.slice(1),
  //       blocks: params.midiTextBlocks,
  //       playBlock: midiOut,
  //     });
  //   }

  //   for (const info of filesInfo) {
  //     const path = info.path;
  //     const name = info.name;

  //     if (!path || name === 'midi' || name === 'tick' || !info.use) {
  //       if (name === 'tick' && hasBeats && info.use) {
  //         useTick = true;
  //       }

  //       if (name === 'midi' && !info.use) {
  //         midiOut = null;
  //       }

  //       continue;
  //     }

  //     let blob: Blob = new Blob([Fs.readFileSync(info.path)]);
  //     const buffer = await getAudioBufferFromBlob(blob);

  //     //console.log(info.path, buffer.duration);

  //     buffers.push({
  //       path,
  //       buffer,
  //     });
  //   }

  //   if (buffers.length) {
  //     this.playSessions.push(sessionInfo);
  //   }

  //   const run = () => {
  //     this.startTime = this.ctx.currentTime + startDelaySec;

  //     if (useTick && !midiOut) {
  //       this.playTick({
  //         beatsWithOffsetMs: [...beatsWithOffsetMs],
  //         startTimeSec: this.startTime,
  //       });
  //     }

  //     if (midiOut) {
  //       this.tryPlayMidiBlock({
  //         repeatCount: 1,
  //         beatOffsetMs: params.beatOffsetMs || beatsWithOffsetMs[0],
  //         beatsWithOffsetMs: [...beatsWithOffsetMs],
  //         startTimeSec: this.startTime,
  //         outLoops,
  //         notClear: true,
  //       });
  //     }

  //     const onEnded = () => {
  //       playing--;
  //       if (!playing) {
  //         repeated++;

  //         if (!sessionInfo.break && repeated < repeatCount) {
  //           run();
  //         } else {
  //           // this.midiPlayer.stop(); jjkl

  //           if (
  //             this.playSessions.length === 1 &&
  //             this.playSessions.includes(sessionInfo)
  //           ) {
  //             this.isPlaying = false;
  //             this.playSessions = [];
  //             this.ticker.stop(); // jjkl
  //           }
  //         }
  //       }
  //     };

  //     buffers.forEach((item) => {
  //       const soundSource = this.ctx.createBufferSource(); // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource
  //       soundSource.buffer = item.buffer;
  //       soundSource.connect(this.outGain);

  //       if (!durationSec) {
  //         soundSource.start(this.startTime, offsetSec); // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start   start(when, offset, duration)
  //       } else {
  //         soundSource.start(this.startTime, offsetSec, durationSec); // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start   start(when, offset, duration)
  //       }

  //       playing++;
  //       this.soundSourceSet.push(soundSource);

  //       //if (!durationSec) {
  //       soundSource.onended = onEnded;
  //       //}
  //     });

  //     // if (durationSec) {
  //     // 	let oscil = this.ctx.createOscillator();
  //     // 	oscil.onended = () => {
  //     // 		playing = 1;
  //     // 		onEnded();
  //     // 	}
  //     // 	oscil.start(this.startTime);
  //     // 	oscil.stop(this.startTime + durationSec);
  //     // }
  //   };

  //   run();

  //   if (playing) {
  //     this.isPlaying = true;
  //   }
  // } // playFractions

  stop(offset = 0) {
    this.playSessions.forEach((item) => {
      item.break = true;
    });
    this.playSessions = [];

    this.soundSourceSet.forEach((item) => {
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

  clear() {}

  pause() {}

  async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
    repeat = repeat || 1;
    text = (text || '').trim();

    this.midiPlayer.stopAndClear();
    const noteLine = un.clearNoteLine(text);
    const bpm = un.getBpmFromString(noteLine);

    const loopId = this.midiPlayer.addLoop({
      noteLine,
      bpm,
      isDrum: false, // isDrum,
      repeat,
      instrCode: MIDI_INSTR, // instrAlias[key], // MIDI_INSTR
    }).id;

    await this.midiPlayer.waitLoadingAllInstruments();

    this.midiPlayer.play([loopId]);
  }

  /**
   * Ничего не знает про offset
   */
  getLoopsInfo(params: {
    blocks?: un.TextBlock[] | string;
    playBlock?: un.TextBlock | string;
    repeat?: number; // jjkl delete ?
    beatOffsetMs?: number; // jjkl delete ?
    beatsMs?: number[];
    bpm?: number;
  }): OutLoopsInfo {
    //console.log('getLoopsInfo', params);

    let beatsMs: number[] = Array.isArray(params.beatsMs)
      ? [...params.beatsMs]
      : [];
    let playBlock = params.playBlock || 'out';
    const allBlocks = Array.isArray(params.blocks)
      ? params.blocks
      : un.getTextBlocks(params.blocks);
    const outBlock = un.getOutBlock(playBlock, allBlocks);

    //console.log('outBlock', outBlock);

    const outBlocks = un.getOutBlocksInfo(allBlocks, <any>playBlock);
    const repeat = params.repeat || un.getOutRepeat(outBlock.head);

    //console.log('OUT', out);

    let startRowBeatIndex = 0;
    let bpm = params.bpm || un.getOutBpm(outBlock.head, 0);
    bpm = beatsMs.length ? 0 : bpm;

    let durationQ = 0;
    let durationMs = 0;

    const rowLoops = outBlocks.rows.map((block) => {
      const result: {
        ids: (number | string)[];
        beatsMs: number[];
      } = {
        ids: [],
        beatsMs: [],
      };

      let beatsByRowMs: number[];
      let rowBeatCount = Math.ceil(
        (block.rowDurationQ * block.rowRepeat) / 100
      );

      if (bpm && !beatsMs.length) {
        beatsByRowMs = un.getBeatsByBpm(bpm, rowBeatCount);
      } else {
        let endRowBeatIndex = startRowBeatIndex + rowBeatCount; // jjkl ???
        beatsByRowMs = beatsMs.slice(startRowBeatIndex, endRowBeatIndex);
        startRowBeatIndex = endRowBeatIndex; // jjkl ???
      }

      result.beatsMs = beatsByRowMs;

      durationQ = durationQ + beatsByRowMs.length * 100;
      durationMs =
        durationMs + beatsByRowMs.reduce((acc, item) => acc + item, 0);

      Object.keys(block.instrs).forEach((instrKey) => {
        const noteLine = block.instrs[instrKey];
        const isDrum = un.isDrum(instrKey);

        let instrAlias: string | number = instrKey.split('-')[0];
        let instrCode = isDrum ? undefined : getInstrCodeBy(instrAlias);

        const loop = this.midiPlayer.addLoopByQuarters({
          noteLine,
          isDrum,
          // repeat: количество повторов уже добавлено в noteLine при вызове getOutBlockInfo
          instrCode,
          instrAlias,
          beatsMs: [...beatsByRowMs],
          bpm,
        });

        result.ids.push(loop.id);
      });

      return result;
    });

    return { repeat, rowLoops, durationQ, durationMs };
  }

  clearMidiPlayer() {
    this.midiPlayer.stopAndClear();
  }

  async tryPlayMidiBlock(params: {
    blocks?: un.TextBlock[] | string;
    playBlock?: string;
    repeatCount?: number;
    beatOffsetMs?: number;
    beatsWithOffsetMs?: number[];
    bpm?: number;
    startTimeSec?: number;
    outLoops?: OutLoopsInfo;
    notClear?: boolean;
  }) {
    if (!params.notClear) {
      this.midiPlayer.stopAndClear();
    }
    const outLoops = params.outLoops || this.getLoopsInfo(params);
    const beatOffsetMs = params.beatOffsetMs || 0;

    //console.log('outLoops', outLoops);

    let breakLoop: boolean = false;

    await this.midiPlayer.waitLoadingAllInstruments();

    let startTimeSec = params.startTimeSec || this.ctx.currentTime;
    let beatOffsetMsInRowLoop = beatOffsetMs;

    for (let i = 0; i < outLoops.repeat; i++) {
      if (breakLoop) break;

      for (let rowLoops of outLoops.rowLoops) {
        const loopResult = await this.midiPlayer.playByQuarters({
          beatOffsetMs: beatOffsetMsInRowLoop,
          beatsWithOffsetMs: [beatOffsetMsInRowLoop, ...rowLoops.beatsMs],
          loopIdsArr: rowLoops.ids,
          startTimeSec,
        });

        breakLoop = !!loopResult.break;
        beatOffsetMsInRowLoop = 0; // значим только для первой rowLoop
        startTimeSec =
          startTimeSec +
          rowLoops.beatsMs.reduce((acc, item) => acc + item, 0) / 1000 +
          beatOffsetMs / 1000;

        if (breakLoop) break;
      }
    }

    //console.log('tryPlayMidiBlock.END', );
  }
}

//console.log('u.workspaceRoot()', u.workspaceRoot());
// TODO jjkl
// запуск и остановка когда играется только midi
// повторы запуска только миди

// Trumpet 617 - 623 (trump)
// 617 hard 0560_Aspirin_sf2_file.js    _tone_0560_Aspirin_sf2_file
// 618 neut 0560_Chaos_sf2_file.js      _tone_0560_Chaos_sf2_file
// 619 soft 0560_FluidR3_GM_sf2_file.js _tone_0560_FluidR3_GM_sf2_file
