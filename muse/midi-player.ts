import { freqByNoteHash } from './freq';
import { Sound, PlayingItem, KeyInfo } from './sound';
import { EventEmitter } from './ee';
import * as un from './utils-note';
import { MIDI_INSTR } from './keyboards';
import { getInstrCodeBy } from './instruments';
import { Ticker } from './ticker';

const QUANT = 10;
// 10 10 10 10 10
// 0  1  2  3  4

type TicksInfo = {
  [key: string]: {
    notes: string; // вид исходных нот переданных для воспроизведения
    offsetFromBeatMs?: number;
    durationMs?: number;

    soundInfo: KeyInfo | KeyInfo[];
    instrCode: number;
    instr: any;
  }[];
};

type LoopInfo = {
  id: string | number;
  tickCount: number;
  durationQ: number;
  repeat: number;
  isDrum: boolean;
  volume: number;
  isHead?: boolean;
};

type LoopAndTicksInfo = LoopInfo & TicksInfo;

type PlayResult = {
  break: boolean;
  endTime?: number;
};

const ee = new EventEmitter();

export class MidiPlayer extends Sound {
  private loopDfr: un.Deferred<PlayResult>;

  private isStopped: boolean = false;
  private loopId: number = 0;
  private interval: any;
  private ticker: Ticker;

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

  play(loopIdsArr?: (string | number)[]) {
    let totalTickCount = 0;
    let totalTickCountByHead = 0;
    this.stop({
      break: true,
    });

    this.ticker = new Ticker(this.ctx);

    this.loopDfr = new un.Deferred();

    const loopIdsObj = (loopIdsArr || []).reduce((acc, item) => {
      acc[item] = item;

      return acc;
    }, {});

    Object.keys(loopIdsObj).forEach((key) => {
      const loopInfo = this.loops[key];

      // if (!this.loops[key].isDrum) {
      //   return;
      // }

      const tickCount = loopInfo.tickCount * loopInfo.repeat;
      const headTickCount = loopInfo.isHead ? tickCount : 0;

      if (tickCount > totalTickCount) {
        totalTickCount = tickCount;
      }

      if (headTickCount > totalTickCountByHead) {
        totalTickCountByHead = tickCount;
      }
    });

    if (totalTickCountByHead) {
      totalTickCount = totalTickCountByHead;
    }

    const startTime = this.ctx.currentTime;

    ee.emit('prepare', loopIdsObj);

    let currTick = -1;
    const endTick = totalTickCount - 2; // выходим из цикла на тик раньше, это костылёк

    const runTick = () => {
      currTick++;

      if (currTick <= endTick) {
        ee.emit('getNextSound', {
          tick: currTick,
          whenSec: startTime + (currTick * QUANT) / 1000,
        });
      } else {
        this.stop({
          break: false,
        });
      }
    };

    this.ticker.tickByQuant(QUANT, () => runTick());
    runTick();

    return this.loopDfr.promise;
  }

  /**
   * {
   *     break: boolean,
   * }
   * @param params
   */
  playByQuarters(params: {
    beatOffsetMs?: number;
    beatsWithOffsetMs: number[];
    startTimeSec?: number;
    loopIdsArr?: (string | number)[];
  }): Promise<PlayResult> {
    //console.log('midiPlayer.playByQuarters', params);
    //console.log('midiPlayer.playByQuarters.loops', this.loops);

    let beatOffsetMs = params.beatOffsetMs || 0;
    let beatsWithOffsetMs = Array.isArray(params.beatsWithOffsetMs)
      ? params.beatsWithOffsetMs
      : [];
    let loopIdsArr = params.loopIdsArr;
    let startTimeSec = params.startTimeSec;

    this.stop({
      break: true,
    });

    this.ticker = new Ticker(this.ctx);
    this.loopDfr = new un.Deferred();

    const loopIdsObj = (loopIdsArr || []).reduce((acc, item) => {
      acc[item] = item;

      return acc;
    }, {});

    startTimeSec = startTimeSec || this.ctx.currentTime;

    ee.emit('prepare', loopIdsObj);

    let planTick = -1;
    let realTick = -1;
    let endTick = beatsWithOffsetMs.length - 2; // -1 смещение
    let offsetMs = 0;

    //console.log('totalTickCount', startTimeSec, endTick, beatsWithOffsetMs);

    const runTick = (ifVirtTick: boolean = false) => {
      planTick++;

      if (!ifVirtTick) {
        realTick++;
      }

      //console.log('planTick', planTick, realTick);

      offsetMs = offsetMs + beatsWithOffsetMs[planTick];

      if (planTick <= endTick) {
        ee.emit('getNextSound', {
          tick: planTick,
          whenSec: startTimeSec + offsetMs / 1000,
        });
      }

      if (realTick >= endTick) {
        //console.log('midiPlayer.playByQuarters.stop');
        this.stop({
          break: false,
          // endTime: startTimeSec + (offsetMs / 1000)
        });
      }
    };

    runTick(true);

    this.ticker.start(
      {
        beatsWithOffsetMs: [...beatsWithOffsetMs],
        startTimeSec: startTimeSec,
      },
      () => runTick()
    );

    return this.loopDfr.promise;
  }

  getNotesMidi(params: {
    notes: string;
    durationMs: number;
    volume?: number;
    instrCode?: string | number;
    whenSec?: number;
  }) {
    const instrCode = getInstrCodeBy(params.instrCode || MIDI_INSTR);
    const soundInfo = this.getSoundInfoArr(params.notes);
    const volume = params.volume || 100;
    const whenSec = params.whenSec || 0;
    const durationMs = params.durationMs || 0;
    const instr = this.instruments[instrCode];
    const isDrum = un.isDrum(instrCode);

    if (!soundInfo.length || !instr) {
      return null;
    }

    return this.getSoundMidi({
      soundInfo,
      durationMs,
      isDrum,
      volume,
      whenSec,
      instr,
    });
  }

  getSoundMidi(params: {
    soundInfo: KeyInfo | KeyInfo[];
    durationMs: number;
    isDrum?: boolean;
    volume?: number;
    instr?: any;
    whenSec?: number;
  }): any {
    if (!params.instr || !params.soundInfo || !params.durationMs) {
      return;
    }

    let { durationMs, volume } = params;

    volume = volume ? volume / 100 : 1;

    const item = (<any>{
      isSound: true,
      midis: [],
    }) as PlayingItem;

    if (params.isDrum) {
      durationMs = 1000; //duration * 2;
    }

    const sounds = Array.isArray(params.soundInfo)
      ? params.soundInfo
      : [params.soundInfo];

    for (let soundInfo of sounds) {
      (item as any).midis.push(
        this.fontPlayer.queueWaveTable(
          this.ctx,
          this.ctx.destination,
          params.instr,
          params.whenSec || 0,
          soundInfo.code,
          durationMs / 1000, // in sec / 1000
          soundInfo.volume * volume
        )
      );
    }

    return item;
  }

  static GetLastPause(val: string): number {
    let arr: string[] = (val || '').split(' ').filter((item) => /-/.test(item));

    if (!arr.length) {
      return 0;
    }

    let subArr = arr[arr.length - 1].split('-');

    let total = parseInt(subArr[1], 10) * 10;
    let duration = parseInt(subArr[2] || subArr[1], 10) * 10;
    let pause = total - duration;

    return pause;
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
      const keysAndNotes = this.keysAndNotes || {};
      const soundInfo = keysAndNotes[noteLat];

      result.push(soundInfo);
    });

    return result.filter((item) => !!item);
  }

  /**
   * beatsMs не включает элемент сдвига
   */
  getSkedByQuarters(props: {
    noteLine: string; // очищенная от {}
    isDrum?: boolean;
    instrCode?: any;
    beatsMs: number[];
    repeat?: number;
    volume?: number;
  }): LoopAndTicksInfo {
    //console.log('getSkedByQuarters.props', props);

    let beatsMs = props.beatsMs;
    let repeat = props.repeat; // !!!
    let volume = props.volume || 100;
    let isDrum = !!props.isDrum;
    let noteLine = un.clearNoteLine(props.noteLine);
    let isHead = /head /.test(noteLine);
    let noteLineInfo = un.getNoteLineInfo(noteLine); // дублирование noteLineInfo

    //console.log('noteLineInfo', noteLineInfo);

    const sked: LoopAndTicksInfo = {
      isDrum,
    } as any;
    let beatsQ = beatsMs.map((item, i) => i * 100);
    let offsetQ = 0;

    repeat = repeat || noteLineInfo.repeat || 1;

    function getBeatIndex(offsetQ: number): number {
      const index = Math.floor(offsetQ / 100);

      return index;
    }

    function getDurationMs(
      startBeat: number,
      offsetFromBeatQ: number,
      durationQ: number
    ): number {
      let lastBeat = getBeatIndex(
        beatsQ[startBeat] + offsetFromBeatQ + durationQ
      );

      lastBeat = lastBeat >= beatsMs.length ? beatsMs.length - 1 : lastBeat;

      let beatsDurationMs = beatsMs
        .slice(startBeat, lastBeat + 1)
        .reduce((acc, val) => {
          return acc + val;
        }, 0);

      let hundredthMs = beatsDurationMs / ((lastBeat - startBeat + 1) * 100);

      return Math.round(durationQ * hundredthMs);
    }

    function getOffsetFromBeatMs(
      startBeat: number,
      offsetFromBeatQ: number
    ): number {
      let beatsDurationMs = beatsMs[startBeat];
      let hundredthMs = beatsDurationMs / 100;

      return Math.round(offsetFromBeatQ * hundredthMs);
    }

    const build = () => {
      noteLineInfo.notes.forEach((info) => {
        let soundInfoArr = this.getSoundInfoArr(info.note);
        let beatIndex = getBeatIndex(offsetQ);

        if (beatIndex >= beatsMs.length) {
          return;
        }

        let offsetFromBeatQ = offsetQ - beatsQ[beatIndex];
        let offsetFromBeatMs = getOffsetFromBeatMs(beatIndex, offsetFromBeatQ);
        let durationMs = getDurationMs(
          beatIndex,
          offsetFromBeatQ,
          info.durationQ
        );

        offsetQ = offsetQ + info.durationQ + info.pauseQ;

        const instrCode = un.isPresent(props.instrCode)
          ? props.instrCode
          : (soundInfoArr[0] || {}).instr; // jjkl ??

        const instr = this.instruments[instrCode];

        if (soundInfoArr.length) {
          sked[beatIndex] = Array.isArray(sked[beatIndex])
            ? sked[beatIndex]
            : [];

          sked[beatIndex].push({
            notes: info.note,
            durationMs,
            offsetFromBeatMs,
            soundInfo: soundInfoArr,
            instrCode,
            instr,
          });
        }
      });
    };

    let buildCount = Math.ceil((beatsMs.length * 100) / noteLineInfo.durationQ);
    buildCount = Math.min(repeat, buildCount);

    //console.log('calculated repeat', buildCount);

    for (let i = 0; i < buildCount; i++) {
      build();
    }

    sked.repeat = 1;
    sked.tickCount = beatsMs.length; // sked.tickCount = Math.ceil(noteLineInfo.durationQ/100);
    sked.isHead = isHead; // sked.isHead = isHead;
    sked.durationQ = beatsMs.length * 100; // sked.durationQ = noteLineInfo.durationQ;

    return sked;
  }

  getSked(props: {
    noteLine: string; // очищенная от {}
    qms: number; // с разрядами
    quant: number;
    isDrum?: boolean;
    instrCode?: any;
  }): LoopAndTicksInfo {
    // https://www.html5rocks.com/en/tutorials/audio/scheduling/
    const { noteLine, qms, quant, isDrum } = props;

    let isHead = /head /.test(noteLine);
    const noteLineInfo = un.getNoteLineInfo(noteLine);

    let offsetQ = 0;
    let offsetMs = 0;
    const sked: LoopAndTicksInfo = {
      isDrum,
    } as any;

    noteLineInfo.notes.forEach((info) => {
      let soundInfoArr = this.getSoundInfoArr(info.note);
      let durationMs = info.durationQ * qms;
      let tickNumber = Math.round(offsetMs / quant);

      offsetQ = offsetQ + info.durationQ + info.pauseQ;
      offsetMs = offsetQ * qms;

      const instrCode = un.isPresent(props.instrCode)
        ? props.instrCode
        : (soundInfoArr[0] || {}).instr;

      const instr = this.instruments[instrCode];

      if (soundInfoArr.length) {
        sked[tickNumber] = Array.isArray(sked[tickNumber])
          ? sked[tickNumber]
          : [];

        sked[tickNumber].push({
          notes: info.note,
          durationMs: Math.round(durationMs),
          soundInfo: soundInfoArr,
          instrCode,
          instr,
        });
      }
    });

    offsetQ = un.getDurationFromString(noteLine) || offsetQ;
    offsetMs = offsetQ * qms;

    sked.tickCount = Math.floor(offsetMs / quant);
    sked.isHead = isHead;
    sked.durationQ = offsetQ;

    (sked as any)['_noteLine'] = noteLine;
    (sked as any)['_totalQ'] = offsetQ;

    return sked;
  }

  // type LoopInfo = {
  //     id: string | number;
  //     tickCount: number;
  //     durationQ: number;
  //     repeat: number;
  //     isDrum: boolean;
  //     volume: number;
  //     isHead?: boolean;
  //     [key: string]: {
  //         notes: string; // вид исходных нот переданных для воспроизведения
  //         offsetFromBeatMs?: number;
  //         durationMs?: number;
  //
  //         soundInfo: KeyInfo | KeyInfo[];
  //         instrCode: number;
  //         instr: any;
  //     }[];
  // };

  /**
   * Ничего не знаю про startTimeSec, offsetSec, beatOffsetMs
   */
  addLoopByQuarters(params: {
    noteLine: string;
    repeat?: number;
    isDrum?: boolean;
    instrCode?: string | number;
    instrAlias?: string;
    // volume?: number, // перадаётся в каждой инструментальной линейке
    beatsMs: number[];
    bpm?: number;
  }): LoopAndTicksInfo {
    //console.log('addLoopByQuarters.params', params);

    this.loopId++;

    let loopId = this.loopId;
    let { noteLine, isDrum, instrCode } = params;
    let beatsMs = Array.isArray(params.beatsMs) ? params.beatsMs : [];
    let repeat = params.repeat === Infinity ? 1000000 : params.repeat;
    let noteLineInfo = un.getNoteLineInfo(noteLine);
    let beat = -1;
    let repeated = 0;

    //console.log('addLoopByQuarter.noteLineInfo', noteLineInfo);
    //console.log('addLoopByQuarter.repeat', repeat);
    //console.log('addLoopByQuarter.beatsMs', beatsMs);

    const sked = this.getSkedByQuarters({
      noteLine,
      isDrum,
      instrCode,
      repeat,
      beatsMs: [...beatsMs],
    });

    sked.id = loopId;
    delete this.loops[loopId];
    this.loops[loopId] = sked;
    //console.log('SKED', sked);
    //console.log('REPEAT', repeat);

    const onGetNextSound = (eeParams: { tick: number; whenSec: number }) => {
      beat++;

      if (Array.isArray(sked[beat])) {
        for (const item of sked[beat]) {
          this.getSoundMidi({
            durationMs: item.durationMs,
            isDrum: params.isDrum,
            instr: item.instr,
            soundInfo: item.soundInfo,
            whenSec: eeParams.whenSec + item.offsetFromBeatMs / 1000,
            volume: noteLineInfo.volume,
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

  addLoop(params: {
    noteLine: string;
    repeat?: number;
    mode?: 'full' | 'prev';
    bpm: number;
    isDrum?: boolean;
    instrCode?: string | number;
    volume?: number;
    beats?: number[];
  }): LoopAndTicksInfo {
    const qms = 60000 / params.bpm / 100;
    let tick = -1;
    let repeated = 0;

    this.loopId++;
    const loopId = this.loopId;

    let { noteLine, repeat, mode, isDrum, instrCode } = params;

    repeat = repeat || 1;
    mode = mode || 'full';

    if (repeat === Infinity) {
      repeat = 1000000;
    }

    noteLine = (noteLine || '').trim();
    noteLine = un.clearNoteLine(noteLine);
    let volume = un.getVolumeFromString(noteLine);

    const sked = this.getSked({
      noteLine,
      qms,
      quant: QUANT,
      isDrum,
      instrCode,
    });

    sked.id = loopId;
    sked.repeat = repeat;

    delete this.loops[loopId];
    this.loops[loopId] = sked;

    const onGetNextSound = (eeParams: { tick: number; whenSec: number }) => {
      tick++;

      if (Array.isArray(sked[tick])) {
        for (const item of sked[tick]) {
          this.getSoundMidi({
            durationMs: item.durationMs,
            isDrum: params.isDrum,
            instr: item.instr,
            soundInfo: item.soundInfo,
            whenSec: eeParams.whenSec,
            volume,
          });
        }
      }

      if (tick === sked.tickCount - 1) {
        // последния нота в цикле
        tick = -1;
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
      tick = -1;
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
        break: !!params.break,
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
