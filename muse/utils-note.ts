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

export type BlockInfo = {
  id: string;
  nio: number;
  startRow: number;
  endRow: number;
  rows: string[];
  type: 'out' | 'set' | 'drum' | 'note';
  repeat?: number;
  bpm?: number;
  volume?: number;
};

function trimLeft(val: any): string {
  val = (val || '').toString();

  return val.toString().replace(/^\s+/, '');
}

export function getOutBpm(
  strOrArr: string | string[],
  byDefault = 120
): number {
  let str = Array.isArray(strOrArr) ? strOrArr[0] : strOrArr;
  str = (str || '').trim();

  let bpm = getBpmFromString(str, 0);

  if (bpm) {
    return bpm;
  }

  bpm = parseInt(str.split(' ')[1], 10);

  return isNaN(bpm) ? 120 : bpm || byDefault;
}

export function getOutRepeat(
  strOrArr: string | string[],
  byDefault = 1
): number {
  let str = Array.isArray(strOrArr) ? strOrArr[0] : strOrArr;
  str = (str || '').trim();

  let repeat = getRepeatCount(str, -1);

  if (repeat !== -1) {
    return repeat;
  }

  repeat = parseInt(str.split(' ')[2], 10);

  return isNaN(repeat) ? byDefault : repeat || byDefault;
}

export function getStringWithBlanks(str: any): string {
  return ' ' + (str || '').trim() + ' ';
}

// r100
export function getRepeatCount(str: string, byDefault = 1) {
  str = getStringWithBlanks(str);

  const regExp = / r\d+ /;

  if (!regExp.test(str)) {
    return byDefault;
  }

  str = str.match(regExp)[0].trim().replace('r', '');
  let count = parseInt(str);

  return isNaN(count) ? byDefault : count;
}

// b120
export function getBpmFromString(str: string, byDefault = 120) {
  str = getStringWithBlanks(str);

  const regExp = / b\d+ /;

  if (!regExp.test(str)) {
    return byDefault;
  }

  str = str.match(regExp)[0].trim().replace('b', '');
  let bpm = parseInt(str);

  return isNaN(bpm) ? byDefault : bpm;
}

// v100
export function getVolumeFromString(str: string, byDefault = 100) {
  str = getStringWithBlanks(str);

  const regExp = / v\d+ /;

  if (!regExp.test(str)) {
    return byDefault;
  }

  str = str.match(regExp)[0].trim().replace('v', '');
  let volume = parseInt(str);

  return isNaN(volume) ? byDefault : volume;
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

export function getBlocks(rows: string | string[]): BlockInfo[] {
  rows = Array.isArray(rows) ? rows : (rows || '').split(/\n/);
  rows = rows.map((item) => item.trim());

  let result: BlockInfo[] = [];
  let blockRows: string[] = [];
  let id: string;
  let type: BlockInfo['type'];
  let endRow: number = rows.length - 1;

  for (let i = rows.length - 1; i > -1; i--) {
    let str = rows[i];

    // const match = rows[i].match(/#\S+/);
    // if (!match) {
    //   continue;
    // }

    if (!str.startsWith('<')) {
      blockRows.push(str);

      continue;
    }

    str = str.replace('<', '');
    str = str.replace('>', '');
    blockRows.push(str);

    // id = (match[0] || '').replace('#', '');

    const arr = str.split(' ');
    id = arr[0];
    type = 'set';

    if (blockRows.find((item) => item.startsWith('@'))) {
      type = 'drum';
    }

    if (blockRows.find((item) => item.startsWith('$'))) {
      type = 'note';
    }

    if (arr[0] === 'out') {
      type = 'out';
    }

    result.push({
      id,
      type,
      startRow: i,
      endRow: endRow,
      nio: 0, // определяется потом
      rows: blockRows.reverse(),
      bpm: getOutBpm(str),
      repeat: getOutRepeat(str),
    });

    blockRows = [];
    endRow = i - 1;
  }

  result = result.reverse();

  result.forEach((item, i) => {
    item.nio = i;
  });

  return result;
}

export function findBlockById(blocks: BlockInfo[], id: string): BlockInfo {
  return blocks.find((item) => item.id === id);
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

export function getNoteInstruments(arr: string[]): { [key: string]: string } {
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

export function getDrumInstruments(arr: string[]): { [key: string]: string } {
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

export function getOutType(val: string): 'drum' | 'voice' | '' {
  val = val || '';

  if (/\$/.test(val)) return 'voice';

  if (/@/.test(val)) return 'drum';

  return '';
}

export function getOutBlocksInfo(blocks: BlockInfo[]): {
  instrs: string[];
  repeat: number;
}[] {
  const out = findBlockById(blocks, 'out');
  const result: any[] = [];

  if (!out) {
    console.warn('Block OUT not found');
    return result;
  }

  // строки для вывода в out
  const rows = out.rows
    .map((item) => item.trim())
    .filter((item, i) => {
      return i && item && !item.startsWith('#');
    });

  if (!Array.isArray(rows) || !rows.length) {
    console.warn('Bad rows', out);

    return result;
  }

  // цикл по строка out
  rows.forEach((row, i) => {
    const rowArr = (row || '')
      .split(' ')
      .map((item) => item.trim())
      .filter((item) => !!item);

    let headRepeat = 1;
    let currRepeat = 1;
    let block: BlockInfo;
    let instrs: { [key: string]: string } = {};

    for (let j = 0; j < rowArr.length; j++) {
      const item = rowArr[j];
      const type = getOutType(item);
      const itemInfo = (item || '').split('-');
      let currInstrs: { [key: string]: string };
      let itemId = itemInfo[0].trim();
      let volume: number;
      let head = '';

      currRepeat = parseInt(itemInfo[1], 10) || 1;
      currRepeat = isNaN(currRepeat) ? 1 : currRepeat;
      volume = getVolumeFromString(itemInfo.join(' '));

      block = findBlockById(blocks, itemId);

      if (!block) {
        throw new Error(`Block not <${itemId}> found`);
      }

      if (j === 0) {
        head = 'head';
        headRepeat = currRepeat;
      }

      if (type === 'drum') {
        currInstrs = getDrumInstruments(block.rows);
      } else {
        currInstrs = getNoteInstruments(block.rows);
      }

      Object.keys(currInstrs).forEach((key) => {
        instrs[
          `${key}-${j}`
        ] = `${head} r${currRepeat} v${volume} ${currInstrs[key]}`;
      });
    }

    result.push({
      instrs,
      repeat: headRepeat,
    });
  });

  return result;
}

export function clearNoteLine(val: string): string {
  val = (val || '').replace(/\r\n/g, '\n').trim();

  if (!val) {
    return val;
  }

  // val = val.replace(/-/g, ':'); //
  val = val.replace(/\((.*?)\)/g, ' '); // ()
  val = val.replace(/\[(.*?)\]/g, ' '); // []
  val = val.replace(/[{}]/g, ' '); // {}
  val = val.replace(/\n/g, ' '); // \n
  val = val.replace(/ +/g, ' '); // space+
  val = val.trim();

  return val;
}

export function getBeatsByBpm(
  bpm: number,
  count: number,
  delayMs: number = 0
): number[] {
  const quarterMs = Math.round(60000 / bpm);

  const result = new Array(count).fill(quarterMs);
  result.unshift(delayMs);

  return result;
}

// 'hello #ff'.replace(/#.*$/, '')
