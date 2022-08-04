'use babel';

export type StringHash = { [key: string]: string };

import { NoteLineInfo } from './typing';

export function isPresent(val: any): boolean {
  return val !== null && val !== undefined;
}

export function isNil(val: any): boolean {
  return val === null || val === undefined;
}

function trimLeft(val: any): string {
  val = (val || '').toString();

  return val.toString().replace(/^\s+/, '');
}

export class Deferred<T = any> {
  promise: Promise<T>;
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export type TextBlock = {
  id: string;
  head: string;
  rows: string[];
  nio: number;
  startRow: number;
  endRow: number;
  type: 'text' | 'drums' | 'tones' | 'out' | 'set';
  repeat?: number;
  bpm?: number;
  volume?: number;
};

export function getStringWithBlanks(str: any): string {
  return ' ' + (str || '').trim() + ' ';
}

export function getOutBpm(
  strOrArr: string | string[],
  byDefault = 120
): number {
  //console.log('getOutBpm', strOrArr);

  let str = Array.isArray(strOrArr) ? strOrArr[0] : strOrArr;
  str = (str || '').trim();

  return getBpmFromString(str, byDefault);
}

export function getOutRepeat(
  strOrArr: string | string[],
  byDefault = 1
): number {
  let str = Array.isArray(strOrArr) ? strOrArr[0] : strOrArr;
  str = (str || '').trim();

  return getRepeatCount(str, byDefault);
}

// r100
export function getRepeatCount(str: string, byDefault = 1) {
  str = getStringWithBlanks(str);

  const regExp = / r\d+ /;

  if (!regExp.test(str)) {
    return byDefault;
  }

  str = str.match(regExp)[0].trim().replace('r', '');

  return parseInteger(str, byDefault);
}

// b120
export function getBpmFromString(str: string, byDefault = 120) {
  str = getStringWithBlanks(str);

  const regExp = / b\d+ /;

  if (!regExp.test(str)) {
    return byDefault;
  }

  str = str.match(regExp)[0].trim().replace('b', '');

  return parseInteger(str, byDefault);
}

// v100
export function getVolumeFromString(str: string, byDefault = 100) {
  str = getStringWithBlanks(str);

  const regExp = / v\d+ /;

  if (!regExp.test(str)) {
    return byDefault;
  }

  str = str.match(regExp)[0].trim().replace('v', '');

  return parseInteger(str, byDefault);
}

export function getTextBlocks(rows: string | string[]): TextBlock[] {
  rows = Array.isArray(rows)
    ? rows
    : (rows || '').replace(/\r\n/g, '\n').trim().split(/\n/);

  let result: TextBlock[] = [];
  let blockRows: string[] = [];
  let id: string;
  let type: TextBlock['type'];
  let endRow: number = rows.length - 1;
  let head = '';

  for (let i = rows.length - 1; i > -1; i--) {
    let str = rows[i];

    /^(\s)*</.test('<');

    // это не тэг
    if (!/^(\s)*</.test(str)) {
      // startWith <
      blockRows.push(str);

      continue;
    }

    head = str.trim();
    head = head.replace('<', '');
    head = head.replace('>', '');
    blockRows.push(str);

    const arr = head.split(' ').filter((item) => !!item);
    id = arr[0];
    type = 'text';

    if (
      arr.find(
        (item) => item === 'drums' || item === 'drum' || /_drum/.test(item)
      )
    ) {
      type = 'drums';
    }

    if (arr.find((item) => item === 'tones')) {
      type = 'tones';
    }

    if (arr.find((item) => item === 'set')) {
      type = 'set';
    }

    result.push({
      id,
      type,
      startRow: i,
      endRow: endRow,
      nio: 0, // определяется потом
      head,
      rows: blockRows.reverse(),
      bpm: getOutBpm(str),
      repeat: getOutRepeat(str),
    });

    blockRows = [];
    endRow = i - 1;
    head = '';
  }

  result = result.reverse();

  result.forEach((item, i) => {
    item.nio = i;
  });

  return result;
}

/**
 * Nullable
 */
export function getOutBlock(
  block: string | TextBlock,
  blocks?: TextBlock[]
): TextBlock {
  if (!block) {
    return findBlockById(blocks, 'out');
  }

  if (typeof block === 'object') {
    return block as TextBlock;
  }

  if (typeof block !== 'string') {
    return findBlockById(blocks, 'out');
  }

  let arr = (<string>block).split('\n');

  if (arr.length === 1) {
    return findBlockById(blocks, arr[0]);
  }

  blocks = getTextBlocks(<string>block);

  return blocks[0] || null;
}

/**
 * Nullable
 */
export function findBlockById(
  blocks: TextBlock[],
  id: string,
  ifNotFound: Partial<TextBlock> = null
): TextBlock {
  if (!Array.isArray(blocks) || !blocks.length || !id) {
    return ifNotFound as TextBlock;
  }

  return blocks.find((item) => item.id === id) || (ifNotFound as TextBlock);
}

export function getBlockContent(
  blocks: TextBlock[],
  id: string,
  trimIt: 'trim' = null
): string {
  let rows = findBlockById(blocks, id, { rows: [] }).rows.slice(1);

  if (trimIt) {
    rows = rows.map((row) => row.trim()).filter((row) => !!row);
  }

  return rows.join('\n');
}

// return: [[25, 25, 25, 25], [50, 50]]
export function getDrumQuartersInfo(arr: string[]): number[][] {
  let text = arr.find((item) => item.startsWith('-')).split(':')[1];
  text = trimLeft(text); // text.trimLeft();
  text = text.replace(/\d\d/g, '| ');
  text = text.replace(/\d/g, '|');

  let quarters = text
    .replace(/\|/g, '| ')
    .split('|')
    .filter((item) => !!item);

  let result = quarters.map((quarter) => {
    if (quarter.length === 6) {
      return [17, 17, 16, 17, 17, 16];
    }

    return Array(quarter.length).fill(Math.round(100 / quarter.length));
  });

  return result;
}

// instr-index: noteLine
export function getNoteLineByToneInstruments(arr: string[]): {
  [key: string]: string;
} {
  let instrs = arr
    .filter((item) => item.startsWith('$'))
    .reduce((acc, item, i) => {
      const arr = item.split(':');
      const instr = (arr[0] || '').trim();
      let noteLine = (arr[1] || '').trim();

      noteLine = noteLine.replace(/[{}]/g, ' ').trim(); // {}

      acc[`${instr}-${i}`] = noteLine;

      return acc;
    }, {});

  return instrs;
}

// TODO: поддержка одноимённых инструментов
export function getNoteLineByDrumInstruments(arr: string[]): {
  [key: string]: string;
} {
  let quarters = getDrumQuartersInfo(arr);
  let lengtn = quarters.reduce((acc, item) => {
    return acc + item.length;
  }, 0);

  let instrs = arr
    .filter((item) => item.startsWith('@'))
    .reduce((acc, item) => {
      const arr = item.split(':');
      const name = arr[0].trim();
      let str = arr[1];
      str = str.substr(str.length - lengtn);
      acc[name] = str;

      return acc;
    }, {});

  let result = {};

  Object.keys(instrs).forEach((key) => {
    const beatLine = instrs[key];
    const note = key.replace('@', '');
    let noteLine = '';
    let i = -1;

    for (let quarter of quarters) {
      for (let duration of quarter) {
        i++;

        if (beatLine[i].trim()) {
          noteLine = noteLine + ` ${note}-${duration}`;
        } else {
          noteLine = noteLine + ` ${duration}`;
        }
      }
    }

    result[key] = noteLine.trim();
  });

  return result;
}

/**
 *  instrs: {
 *      organ-1: r1 v100 $organ до-100
 *      organ-2: r1 v100 $organ ро-100
 *  },
 *  repeat: number,
 *  durationQ: number,
 *
 */
export function getOutBlocksInfo(
  blocks: TextBlock[],
  pOutBlock: TextBlock | string = 'out'
): {
  rows: {
    instrs: StringHash;
    headLoopRepeat: number;
    headLoopDurationQ: number;
    rowDurationQ: number;
    rowRepeat: number;
    bpm?: number;
  }[];
  durationQ: number;
} {
  let outBlock: TextBlock;

  if (typeof pOutBlock === 'string') {
    outBlock = findBlockById(blocks, pOutBlock);
  } else {
    outBlock = pOutBlock;
  }

  const result: {
    rows: {
      instrs: StringHash;
      headLoopRepeat: number;
      headLoopDurationQ: number;
      rowDurationQ: number;
      rowRepeat: number;
      bpm?: number;
    }[];
    durationQ: number;
  } = {
    rows: [],
    durationQ: 0,
  };

  if (!outBlock) {
    console.warn('Block OUT not found');
    return result;
  }

  // строки для вывода в out
  const rows = outBlock.rows
    .map((item) => item.trim())
    .filter((item, i) => {
      return i && item && !item.startsWith('#');
    });

  if (!Array.isArray(rows) || !rows.length) {
    console.warn('Bad rows', outBlock);

    return result;
  }

  let totalDurationQ = 0;

  // цикл по строкам out
  rows.forEach((row) => {
    const colArr = (row || '')
      .split(' ')
      .map((item) => item.trim())
      .filter((item) => !!item);

    let headLoopRepeat = 1;
    let headLoopDurationQ = 0;
    let colRepeat = 1;
    let block: TextBlock;
    let instrs: StringHash = {};

    for (let iCol = 0; iCol < colArr.length; iCol++) {
      const item = colArr[iCol];
      const type = getOutType(item); // $: voice @:drum
      const itemInfo = (item || '').split('-');
      let colInstrs: { [key: string]: string };
      let colId = itemInfo[0].trim();
      let volume: number;
      let head = '';

      colRepeat = parseInt(itemInfo[1], 10) || headLoopRepeat;
      colRepeat = isNaN(colRepeat) ? headLoopRepeat : colRepeat;

      block = findBlockById(blocks, colId);

      if (!block) {
        throw new Error(`Block not <${colId}> found`);
      }

      if (iCol === 0) {
        head = 'head';
        headLoopRepeat = colRepeat;
      }

      //console.log('block', block);
      volume = getVolumeFromString(block.head, 100); // jjkl научиться брать громкость и из строки
      //console.log('block.head', block.head, volume);

      if (block.type === 'drums' || type === 'drum') {
        colInstrs = getNoteLineByDrumInstruments(block.rows);
      } else {
        colInstrs = getNoteLineByToneInstruments(block.rows);
      }

      Object.keys(colInstrs).forEach((key, iInst) => {
        if (iCol === 0) {
          const info = getNoteLineInfo(colInstrs[key]);
          headLoopDurationQ = Math.max(headLoopDurationQ, info.durationQ);
        }

        instrs[
          `${key}-${iCol}`
        ] = `${head} r${colRepeat} v${volume} ${colInstrs[key]}`;
      });
    }

    let rowRepeat = 1;
    let rowDurationQ = headLoopDurationQ * headLoopRepeat;
    totalDurationQ = totalDurationQ + rowDurationQ * rowRepeat;

    result.rows.push({
      instrs,
      headLoopRepeat,
      headLoopDurationQ,
      rowDurationQ,
      rowRepeat: 1,
    });
  });

  result.durationQ = totalDurationQ;

  return result;
}

export function clearNoteLine(val: string): string {
  val = (val || '').replace(/\r\n/g, '\n').trim();

  if (!val) {
    return val;
  }

  // text = text
  //     .replace(/\[(.*?)\]/g, ' ') // []
  //     .replace(/\((.*?)\)/g, ' ') // ()
  //     .replace(/{(.*?)}/g, ' ') // {}
  //     .replace(/\|/g, ' ') // |
  //     .replace(/\-/g, ' ') // -
  //     .replace(/!/g, '') // !
  //     .replace(/ +/g, ' '); // space+

  // val = val.replace(/-/g, ':'); //
  val = val.replace(/\[(.*?)\]/g, ' '); // delete []
  val = val.replace(/\((.*?)\)/g, ' '); // delete ()
  val = val.replace(/[{}]/g, ' '); // delete {}
  val = val.replace(/\|/g, ' '); // delete |
  val = val.replace(/\n/g, ' '); // delete \n
  val = val.replace(/ +/g, ' '); // replace space+
  val = val.trim();

  return val;
}

// 'hello #ff'.replace(/#.*$/, '')

export function getKeysFromText(
  val: string,
  defInstrCode?: string | number
): {
  [key: string]: {
    key: string;
    volume: number;
    note: string;
    instr: number | string;
    instrCode: number | string;
    // signRus?: string;
    // signLat?: string;
    // noteLat: string;
  };
} {
  const arr: string[] = val
    .trim()
    .split('\n')
    .filter((item) => item && !item.startsWith('#'))
    .map((item) => item.trim())
    .join('')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && !item.startsWith('#'));

  return arr.reduce((acc, item) => {
    const arr = item.split('~').map((item) => item.trim());

    // 0-key 1-note 2-volume 3-instrCode
    const key = arr[0];
    const note = arr[1];
    // let signLat = arr[2] || key;
    // signLat = signLat === 'Backquote' ? '`' : signLat;
    // let signRus = arr[3] || key;
    let volume = arr[2] ? parseFloat(arr[2]) : 0.5;
    let instrCode = arr[3] ? parseInt(arr[3], 10) : defInstrCode;

    acc[key] = {
      // octave: 'drum', // y o a e i
      // noteLat,
      // noteRus,
      key,
      volume,
      instr: instrCode,
      instrCode,
      note,
      // signRus,
      // signLat,
    };

    return acc;
  }, {});
}

// d400
export function getDurationFromString(str: string, byDefault = 0) {
  str = getStringWithBlanks(str);

  const regExp = / d\d+ /;

  if (!regExp.test(str)) {
    return byDefault;
  }

  str = str.match(regExp)[0].trim().replace('d', '');
  let duration = parseInt(str);

  return isNaN(duration) ? byDefault : duration;
}

export function isDrum(val: string | number) {
  val = (val || '').toString().trim();

  return val.startsWith('@') || val.startsWith('drum_');
}

// TODO
// Данные берутся только из noteLine
// {
//      notes: {
//          note: string,
//          durationQ: number,
//          pauseQ: number,
//          volume: number,
//      },
//      durationQ: number,
//      volume: number,
//      repeat: number,
//      bpm: number,
// }
//
export function getNoteLineInfo(noteLine: string): NoteLineInfo {
  const result: NoteLineInfo = {
    notes: [],
    durationQ: 0,
    volume: 100,
    repeat: 1,
    bpm: 0,
  };

  noteLine = clearNoteLine(noteLine);

  //console.log('noteLine', noteLine);
  //noteLine = 'b120 ' + noteLine + ' r10 v80 d500';

  let inNote = false;
  let arr: string[];
  let meta = '';
  let volume = getVolumeFromString(noteLine, 100);

  const noteLineArr = noteLine
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => !!item)
    .map((item) => (/^\d+$/.test(item) ? '__-' + item : item));

  if (!noteLineArr.length) {
    return result;
  }

  // метаданные с начало
  for (const item of noteLineArr) {
    if (/-/.test(item)) {
      break;
    }

    meta = meta + ' ' + item;
  }

  // метаданные с конца
  for (let i = noteLineArr.length - 1; i > -1; i--) {
    let item = noteLineArr[i];

    if (/-/.test(item)) {
      break;
    }

    meta = meta + ' ' + item;
  }

  for (let item of noteLineArr) {
    arr = item.split('-');
    inNote = inNote || arr.length > 1;

    if (inNote) {
      let note = arr[0];
      let durationQ = parseInteger(arr[1], 0);
      let pauseQ = parseInteger(arr[2], 0);

      result.notes.push({
        note,
        durationQ,
        pauseQ,
        volume,
      });
    }
  }

  result.durationQ = getDurationFromString(
    meta,
    result.notes.reduce((acc, item) => acc + item.durationQ + item.pauseQ, 0)
  );
  result.repeat = getRepeatCount(meta, 1);
  result.bpm = getBpmFromString(meta, 0);
  result.volume = getVolumeFromString(meta, 100);

  return result;
}

export function getOutType(val: string): 'drum' | 'voice' | '' {
  val = val || '';

  if (/\$/.test(val)) return 'voice';

  if (/@/.test(val)) return 'drum';

  return '';
}

export function parseInteger(
  val: string | number,
  ifError: number = 0
): number {
  if (typeof val === 'number') {
    return val;
  }

  val = (val || '').toString().trim();
  const num = parseInt(val, 10);

  return isNaN(num) ? ifError : num;
}

/**
 * Массив битов (четрвертей). Первый элемент задержка перед стартом
 *
 * @param bpm
 * @param count
 * @param offsetMs
 */
export function getBeatsByBpmWithOffset(
  bpm: number,
  count: number,
  offsetMs: number = 0
): number[] {
  const quarterMs = Math.round(60000 / bpm);

  const result = new Array(count).fill(quarterMs);
  result.unshift(offsetMs);

  return result;
}

/**
 * Массив битов (четрвертей).
 *
 * @param bpm
 * @param count
 * @param offsetMs
 */
export function getBeatsByBpm(bpm: number, count: number): number[] {
  const quarterMs = Math.round(60000 / bpm);

  const result = new Array(count).fill(quarterMs);

  return result;
}

/**
 * delayMs-count-bpm
 *
 */
export function getBeatsArrayFromString(val: string): number[] {
  val = (val || '').toString().trim();

  const arr = val.split('-');
  const delayMs = parseInteger(arr[0]);
  const count = parseInteger(arr[1]);
  const bpm = parseInteger(arr[2]);

  return getBeatsByBpmWithOffset(bpm, count, delayMs);
}

export function getRandomElement(arr: any[] | string): any {
  const length = arr ? arr.length : 0;

  const i = Math.floor(Math.random() * length);

  return arr[i];
}

// 'hello #ff'.replace(/#.*$/, '')
export function getNoteByOffset(
  pNote: string,
  pOffset: string | number
): string {
  pNote = (pNote || '').toLowerCase();

  let noteOrder = `
      du tu ru nu mu fu vu su zu lu ku bu
      dy ty ry ny my fy vy sy zy ly ky by
      do to ro no mo fo vo so zo lo ko bo
      da ta ra na ma fa va sa za la ka ba
      de te re ne me fe ve se ze le ke be
      di ti ri ni mi fi vi si zi li ki bi
    `
    .replace(/\n/g, ' ')
    .split(' ')
    .filter((item) => !!item);

  const offset: number = parseInt(<string>pOffset, 10);

  let index = noteOrder.findIndex((item) => item === pNote);

  return noteOrder[index + offset] || '';
}
