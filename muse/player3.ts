import { freqByNoteHash, noteLatByNoteHash } from './freq';
import { Sound, PlayingItem, KeyInfo } from './sound';
import { EventEmitter } from './ee';
import * as un from './utils-note';

const QUANT = 10;
// 10 10 10 10 10
// 0  1  2  3  4
type TicksInfo = {
  [key: string]: {
    notes: string; // вид исходных нот переданных для воспроизведения
    duration: number;
    pause: number;

    soundInfo: KeyInfo | KeyInfo[];
    instrCode: number;
    instr: any;
  };
};

type LoopInfo = {
  id: string | number;
  tickCount: number;
  repeat: number;
  isDrum: boolean;
  volume: number;
};

type LoopAndTicksInfo = LoopInfo & TicksInfo;

function isPresent(value: any): boolean {
  return value !== null && value !== undefined;
}

const ee = new EventEmitter();

class Ticker {
  constructor(public ctx: AudioContext) {}

  isStopped: boolean = true;

  start(quantMs: number, cb: () => void) {
    this.isStopped = false;

    const quant = quantMs / 1000;

    let oscil = this.ctx.createOscillator();
    let nextTime = this.ctx.currentTime + quant;

    const onEnded = () => {
      if (this.isStopped) {
        return;
      }
      nextTime = nextTime + quant;
      oscil = this.ctx.createOscillator();
      oscil.onended = onEnded;
      oscil.start();
      oscil.stop(nextTime);
      cb();
    };

    oscil.onended = onEnded;
    oscil.start(0);
    oscil.stop(nextTime);
  }

  stop() {
    this.isStopped = true;
  }
}

class TickerOld {
  interval: number = null;

  constructor(public ctx: AudioContext) {}

  isStopped: boolean = true;

  start(quant: number, cb: () => void) {
    let nextTime = Date.now() + quant;

    this.interval = setInterval(() => {
      if (Date.now() > nextTime) {
        nextTime = nextTime + quant;
        cb();
      }
    });
  }

  stop() {
    this.isStopped = true;
    if (this.interval !== null) {
      clearInterval(this.interval);
    }

    this.interval = null;
  }
}

export class Player3 extends Sound {
  private loopDfr: un.Deferred;

  private isStopped: boolean = false;
  private loopId: number = 0;
  private interval: any;
  private ticker: Ticker | TickerOld;

  gains: { [key: string]: GainNode } = {} as any;
  loops: { [key: string]: LoopAndTicksInfo } = {};

  connect({
    ctx,
    oscills,
  }: {
    ctx: AudioContext;
    oscills?: { [key: string]: OscillatorNode };
  }): this {
    this.ctx = ctx;
    this.oscills = oscills || {};

    return this;
  }

  play(loopsArr?: (string | number)[]) {
    let totalTickCount = 0;
    this.stop(true);

    this.ticker = new TickerOld(this.ctx);

    this.loopDfr = new un.Deferred();

    const loops = (loopsArr || []).reduce((acc, item) => {
      acc[item] = item;

      return acc;
    }, {});

    Object.keys(loops).forEach((key) => {
      //console.log(this.loops[key]);
      // if (!this.loops[key].isDrum) {
      //   return;
      // }

      const tickCount = this.loops[key].tickCount * this.loops[key].repeat;

      if (tickCount > totalTickCount) {
        totalTickCount = tickCount;
      }
    });

    //console.log('play: maxTick, loops', totalTickCount);
    const startTime = this.ctx.currentTime;

    ee.emit('prepare', loops);

    let currTick = -1;
    const endTick = totalTickCount - 2; // выходим из цикла на тик раньше, это костылёк

    const runTick = () => {
      currTick++;

      if (currTick <= endTick) {
        ee.emit('getNextSound', {
          tick: currTick,
          when: startTime + (currTick * QUANT) / 1000,
        });
      } else {
        this.stop(false);
      }
    };

    this.ticker.start(QUANT, () => runTick());
    runTick();

    return this.loopDfr.promise;
  }

  getSoundMidi(params: {
    soundInfo: KeyInfo | KeyInfo[];
    duration: number; // ms
    pause: number;
    instrCode: number | string;
    isDrum?: boolean;
    volume?: number;
    instr?: any;
    when?: number;
  }): any {
    if (!params.instr || !params.soundInfo || !params.duration) {
      return;
    }

    let { duration, volume } = params;

    volume = volume ? volume / 100 : 1;

    const item = (<any>{
      isSound: true,
      midis: [],
    }) as PlayingItem;

    if (params.isDrum) {
      duration = 1000; //duration * 2;
    }

    const sounds = Array.isArray(params.soundInfo)
      ? params.soundInfo
      : [params.soundInfo];

    for (let soundInfo of sounds) {
      item.midis.push(
        this.fontPlayer.queueWaveTable(
          this.ctx,
          this.ctx.destination,
          params.instr,
          params.when || 0, // when in sec
          soundInfo.code,
          duration / 1000, // in sec / 1000
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

  getNoteLineInfo(val: string): {
    notes: string[];
    repeat: number;
    volume: number;
    bpm: number;
    durationInQuarter: number;
  } {
    const result: {
      notes: string[];
      repeat: number;
      volume: number;
      bpm: number;
    } = {
      notes: [],
      repeat: 1,
      volume: 50,
      bpm: 120,
      quarterCount: 0,
    } as any;

    val = (val || '').trim();

    if (!val) {
      return result as any;
    }

    val = un.clearNoteLine(val);

    let arr: string[] = val
      .split(' ')
      .filter((item) => !!item)
      .map((item) => {
        if (/^\d+$/.test(item)) {
          return '__-' + item;
        }

        return item;
      })
      .filter((item) => {
        if (!/-/.test(item)) {
          return false;
        }

        return true;
      });

    result.notes = arr;

    //console.log('noteLineInfo', result);

    return result as any;
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
      const soundInfo = (this.playingKey || {})[noteLat];

      result.push(soundInfo);
    });

    return result.filter((item) => !!item);
  }

  getSked(props: {
    noteLine: string; // очищенная от {}
    qms: number; // с разрядами
    quant: number;
    isDrum?: boolean;
    instrCode?: number;
  }): LoopAndTicksInfo {
    // https://www.html5rocks.com/en/tutorials/audio/scheduling/
    const { noteLine, qms, quant, isDrum } = props;

    // this.getNoteLineInfo(noteLine);

    let arr: string[] = noteLine
      .split(' ')
      .filter((item) => !!item)
      .map((item) => {
        if (/^\d+$/.test(item)) {
          return '__-' + item;
        }

        return item;
      })
      .filter((item) => /-/.test(item));

    let offsetQ = 0;
    let offsetMs = 0;
    const sked: LoopAndTicksInfo = {
      isDrum,
    } as any;

    arr.forEach((item, i) => {
      let subArr = item.split('-');

      let soundInfoArr = this.getSoundInfoArr(subArr[0]);

      let durationQ = parseInt(subArr[1], 10);
      durationQ = isNaN(durationQ) ? 0 : durationQ;
      let duration = durationQ * qms;
      // duration = Math.floor(duration / props.quant) * props.quant;

      let pauseQ = parseInt(subArr[2] || '0', 10);
      pauseQ = isNaN(pauseQ) ? 0 : pauseQ;
      let pause = pauseQ * qms;
      // pause = Math.floor(pause / props.quant) * props.quant;

      let tickNumber = Math.round(offsetMs / quant);
      offsetQ = offsetQ + durationQ + pauseQ;
      offsetMs = offsetQ * qms;

      const instrCode = isPresent(props.instrCode)
        ? props.instrCode
        : (soundInfoArr[0] || {}).instr;

      const instr = this.instruments[instrCode];

      if (soundInfoArr.length) {
        sked[tickNumber] = {
          notes: subArr[0],
          duration: Math.round(duration),
          pause: Math.round(pause),
          soundInfo: soundInfoArr,
          instrCode,
          instr,
        };
      }
    });

    offsetQ = un.getDurationFromString(noteLine) || offsetQ;
    offsetMs = offsetQ * qms;

    sked.tickCount = Math.floor(offsetMs / quant);

    (sked as any)['_noteLine'] = noteLine;
    (sked as any)['_totalQ'] = offsetQ;

    return sked;
  }

  addLoop(params: {
    noteLine: string;
    repeat?: number;
    mode?: 'full' | 'prev';
    bpm: number;
    isDrum?: boolean;
    instrCodeOrAlias?: string | number;
    volume?: number;
  }): LoopAndTicksInfo {
    const qms = 60000 / params.bpm / 100;
    let tick = -1;
    let repeated = 0;

    this.loopId++;
    const loopId = this.loopId;

    let { noteLine, repeat, mode, isDrum, instrCodeOrAlias } = params;

    //console.log('instrCodeOrAlias', instrCodeOrAlias);

    repeat = repeat || 1;
    mode = mode || 'full';

    if (repeat === Infinity) {
      repeat = 1_000_000;
    }

    noteLine = (noteLine || '').trim();
    noteLine = un.clearNoteLine(noteLine);
    let volume = un.getVolumeFromString(noteLine);

    const sked = this.getSked({
      noteLine,
      qms,
      quant: QUANT,
      isDrum,
    });

    //console.log('sked', sked);

    sked.id = loopId;
    sked.repeat = repeat;

    delete this.loops[loopId];
    this.loops[loopId] = sked;

    const onGetNextSound = (eeParams: { tick: number; when: number }) => {
      tick++;

      if (sked[tick]) {
        const item = sked[tick];

        this.getSoundMidi({
          duration: item.duration,
          pause: item.pause,
          isDrum: params.isDrum,
          instrCode: item.instrCode,
          instr: item.instr,
          soundInfo: item.soundInfo,
          when: eeParams.when,
          volume,
        });
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

    //console.log('schedule', sked);

    return sked as any;
  }

  clear() {
    this.stop(true);
    ee.emit('clear');
    this.loopId = 0;
    this.loops = {};
  }

  stop(result?: boolean) {
    // this.isStopped = true;
    ee.emit('stop');
    clearInterval(this.interval);

    if (this.ticker) {
      this.ticker.stop();
    }

    if (this.loopDfr) {
      const loopDfr = this.loopDfr;
      this.loopDfr = null;
      loopDfr.resolve(!!result);
    }
  }

  setSettings(settings: any): { [key: string]: KeyInfo } {
    const playingKey = this.getSettingsForKeys(settings);

    // console.log('setSettings', settings);
    // console.log('playingKey 1', { ...playingKey });

    Object.keys(playingKey).forEach((key) => {
      const item = playingKey[key];

      playingKey[item.noteLat] = item;
      item.freq = freqByNoteHash[item.noteLat];

      delete playingKey[key];
    });

    this.playingKey = playingKey;

    return playingKey;
  }
}
