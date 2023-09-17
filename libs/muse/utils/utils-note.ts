'use babel';

export type StringHash = {[key: string]: string};
export const DEFAULT_BPM = 120;
export const DEFAULT_VOLUME = 50;
export const NUM_100 = 100;
export const VOLUME_100 = 100;
export const NUM_120 = 120;
export const THOUSAND = 1000;
export const msInMin = 60000;
export const toneChar = '$';
export const timeChar = '=';
export const timeCharRE = new RegExp(/[=]/); // [-=]

export const vibratoChar = '~';
export const decorChar = '*';
export const negativeChar = '-';
export const drumChar = '@';
export const drumPrefix = 'drum_';
export const PAUSE = 'pause';
export const commentChar = '#';
export const refChar = '>';
export const nioChar = '№';
export const partIdChar = '%';


type BlockType = 'text' | 'drums' | 'tones' | 'set';

type NoteLineByName = {
    trackName: string,
    noteLine: string
}

export function hasToneChar(val: any): boolean {
    val = isNil(val) ? '': val.toString();

    return new RegExp(`\\${toneChar}`).test(val);
}

export function hasDrumChar(val: any): boolean {
    val = isNil(val) ? '': val.toString();

    return new RegExp(`\\${drumChar}`).test(val);
}

export function isPresent (val: any): boolean {
    return val !== null && val !== undefined;
}

export function isNil (val: any): boolean {
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
    head: string,
    rows: string[];
    nio: number;
    startRow: number;
    endRow: number;
    type: BlockType;
    repeat?: number;
    bpm?: number;
    volume?: number;
};

export function getString(str: any): string {
    return isNil(str) ? '' : str.toString();
}

export function getStringWithBlanks(str: any): string {
    return ' ' + (str || '').trim() + ' ';
}

// r100
export function getRepeatFromString(str: string, byDefault = 1) {
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

export function getEndPointVolume(val: any, byDefault?: number): number {
    const valIn = getSafeVolume(val, byDefault);

    //return val;

    let valOut: number;
    let mid = 20;

    if (valIn === 0 || valIn === 100) {
        valOut = valIn;
    } else {
        valOut = valIn / 100;
        valOut = (1 - Math.sqrt(1 - (valOut * valOut))) * 100;
    }

    //console.log(val, valIn, valOut);

    return valOut

    // if (valIn === 0 || valIn === 100) {
    //     valOut = valIn;
    // }
    // else if (valIn <= 50) {
    //     valOut = valIn / 50;
    //     //valOut = mid * valOut;
    //     valOut = (1 - Math.sqrt(1 - (valOut * valOut))) * mid;
    // } else {
    //     valOut = (valIn - 50 ) / 50;
    //     valOut = ((100 - mid) * valOut) + mid;
    //
    //     //valOut = ((1 - Math.sqrt(1 - (valOut * valOut))) * (100 - mid)) + mid;
    // }
    //
    // console.log(val, valIn, valOut);
    //
    // return valOut;
}

export function getSafeVolume(val: any, byDefault?: number): number {
    function getVolume(val: any): number {
        val = parseInteger(val, null);

        if (isNil(val)) {
            return null;
        }

        if (val > 100) {
            val = 100;
        }

        if (val < 0) {
            val = 0;
        }

        return val;
    }

    byDefault = getVolume(byDefault);
    byDefault = isNil(byDefault)? DEFAULT_VOLUME: byDefault;
    val = getVolume(val);

    return isNil(val)? byDefault: val;
}

// v100
export function getVolumeFromString(str: string, byDefault: number | null = DEFAULT_VOLUME) {
    str = getStringWithBlanks(str);

    const regExp = / v\d+ /;

    if (!regExp.test(str)) {
        return byDefault;
    }

    str = str.match(regExp)[0].trim().replace('v', '');

    return parseInteger(str, byDefault);
}

// v100
export function getPitchShiftFromString(str: string, byDefault = 0) {
    str = getStringWithBlanks(str);

    const regExp = / s\d+ /;

    if (!regExp.test(str)) {
        return byDefault;
    }

    str = str.match(regExp)[0].trim().replace('s', '');

    return parseInteger(str, byDefault);
}

export function mergeVolume(a: number, b: number): number {
    return a * (b / DEFAULT_VOLUME);
}

export function getTextBlocks(rows: string | string[]): TextBlock[] {
    rows = Array.isArray(rows) ? rows : (rows || '').replace(/\r\n/g, '\n').trim().split(/\n/);

    let result: TextBlock[] = [];
    let blockRows: string[] = [];
    let id: string;
    let type: TextBlock['type'];
    let endRow: number = rows.length - 1;
    let head = '';

    for (let i = rows.length - 1; i > -1; i--) {
        let str = rows[i];

        /^(\s)*</.test('<')

        // это не тэг
        if (!/^(\s)*</.test(str)) { // startWith <
            blockRows.push(str);

            continue;
        }

        head = str.trim();
        head = head.replace('<', '');
        head = head.replace('>', '');
        head = head.trim();
        blockRows.push(str);

        const headItems = head.split(' ').filter(item => !!item);
        id = headItems[0];
        type = 'text';

        if (headItems.find((item) => item === drumChar || item === 'drums' || item === 'drum')) {
            //|| /_drum/.test(item)
            type = 'drums';
        } else if (headItems.find((item) => item === toneChar || item === 'tones' || item === 'tone')) {
            type = 'tones';
        } else if (headItems.find((item) => item === 'set')) {
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
            bpm: getBpmFromString(head),
            volume: getVolumeFromString(head),
            repeat: getRepeatFromString(head),
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
export function getOutBlock(block: string | TextBlock, blocks?: TextBlock[]): TextBlock {
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
export function findBlockById(blocks: TextBlock[], id: string, ifNotFound: Partial<TextBlock> = null): TextBlock {
    if (!Array.isArray(blocks) || !blocks.length || !id) {
        return ifNotFound as TextBlock;
    }

    return blocks.find((item) => item.id === id) || ifNotFound as TextBlock;
}

export function getBlockContent(blocks: TextBlock[], id: string, trimIt: 'trim' = null): string {
    let rows = findBlockById(blocks, id, {rows: []}).rows.slice(1);

    if (trimIt) {
        rows = rows.map(row => row.trim()).filter(row => !!row);
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
        return Array(quarter.length).fill(Math.round(NUM_120 / quarter.length));
    });

    return result;
}

// instr-index: noteLine
export function getNoteLnsByToneInstruments(arr: string[]): NoteLineByName[] {
    let noteLns = arr
        .filter((item) => item.startsWith(toneChar))
        .reduce((acc, item, i) => {
            const arr = getString(item).split(':');
            const name = (arr.shift() || '').trim();
            const noteLine = clearNoteLine(arr.join(':') || '');

            acc.push({
                trackName: name,
                noteLine
            });

            return acc;
        }, <NoteLineByName[]>[]);

    return noteLns;
}

// TODO: поддержка одноимённых инструментов
export function getNoteLnsByDrumInstruments(arr: string[]): NoteLineByName[] {
    let quarters = getDrumQuartersInfo(arr);
    let lengtn = quarters.reduce((acc, item) => {
        return acc + item.length;
    }, 0);

    let noteLns: NoteLineByName[] = arr
        .filter((item) => item.startsWith(drumChar))
        .reduce((acc, item) => {
            const arr = item.split(':');
            const name = arr[0].trim();
            let noteLine = arr[1];
            noteLine = noteLine.substr(noteLine.length - lengtn);

            acc.push({ trackName: name, noteLine})

            return acc;
        }, <NoteLineByName[]>[]);

    let result: NoteLineByName[] = [];

    noteLns.forEach(noteLn => {
        const beatLine = noteLn.noteLine;
        const trackName = noteLn.trackName;
        const asNote = trackName.replace(drumChar, '');
        let noteLine = '';
        let i = -1;

        for (let quarter of quarters) {
            for (let durationQ of quarter) {
                i++;

                if (beatLine[i].trim()) {
                    noteLine = noteLine + ` ${asNote}${timeChar}${durationQ}`;
                } else {
                    noteLine = noteLine + ` ${durationQ}`;
                }
            }
        }

        result.push({
            trackName: noteLn.trackName,
            noteLine: `drums ${noteLine.trim()}`,
        });
    });

    return result;
}

export function clearEndComment(val: any) {
    let str = getString(val);
    //console.log(str, str.replace(/#.*$/, ''));
    return str.replace(/#.*$/, ''); // коммент в конце строки
}

export function clearNoteLine(val: string): string {
    val = getString(val).replace(/\r\n/g, '\n').trim();
    val = val.split('\n').map(item => clearEndComment(item).trim()).filter(item => item).join(' ');

    if (!val) {
        return val;
    }

    // .replace(/\-/g, ' ')  // -
    // .replace(/!/g, '')    // !
    // .replace(/-/g, ':');  //
    // .replace(/\n/g, ' '); // delete \n

    val = val.replace(/\[(.*?)\]/g, ' '); // delete []
    val = val.replace(/\((.*?)\)/g, ' '); // delete ()
    val = val.replace(/[{}]/g, ' ');      // delete {}
    val = val.replace(/\|/g, ' ');        // delete |
    val = val.replace(/ +/g, ' ');        // replace space+
    val = val.trim();

    return val;
}

export function getKeysFromText(
    val: string,
    defInstrCode?: string | number
): {
    [key: string]: {
        key: string;
        volume: number;
        note: string;
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
    let durationQ = parseInt(str, 10);

    return isNaN(durationQ) ? byDefault : durationQ;
}

export function isDrum(val: string | number) {
    val = (val || '').toString().trim();

    return val.startsWith(drumChar) || val.startsWith(drumPrefix);
}


export function getBlockType(val: string): BlockType {
    if (hasToneChar(val)) return 'tones';
    if (hasDrumChar(val)) return 'drums';

    //if (/\$/.test(val)) return 'tones';
    //if (/@/.test(val)) return 'drums';

    return <any>'';
}

export function parseInteger(val: string | number, ifError: number = 0): number {
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
export function getBeatsByBpmWithOffset(bpm: number, count: number, offsetMs: number = 0): number[] {
    const quarterMs = Math.round(msInMin / bpm);

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
    const quarterMs = Math.round(msInMin / bpm);

    const result = new Array(count).fill(quarterMs);

    return result;
}

/**
 * delayMs-count-bpm
 *
 */
export function getBeatsArrayFromString(val: string): number[] {
    val = getString(val).trim();

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

export type SongPartInfo = {
    partNio: number,
    rowNio: number,
    partId: string,
    info: string,
    ref: string,
    rowInPartId: string,
};

export function getPartInfo(val: string): SongPartInfo {
    val = (val || '').trim();
    const arr = val.split(' ').filter(item => item);

    let partId = '';
    let partNio = 0;
    let rowNio = 0;
    let info = '';
    let ref = '';

    arr.forEach(item => {
        // id
        if (item.startsWith(partIdChar)) {
            if (!partId) {
                partId = item.replace(partIdChar, '');
            }

            return;
        }

        // partNio
        if (item.startsWith(nioChar)) {
            if (!partNio) {
                partNio = parseInteger(item.replace(nioChar, '').split('-')[0], 0);
                rowNio = parseInteger(item.replace(nioChar, '').split('-')[1], 0);
            }

            return;
        }

        // info
        if (item.startsWith('[')) {
            if (!info) {
               info = item.replace(/[\[\]]/g, '');
            }

            return;
        }

        ref = ref + item + ' ';
    });

    ref = ref.trim();

    const result = {
        partId, partNio, rowNio, ref, info,
        rowInPartId: `${partNio}-${rowNio}`
    };

    return result;
}

export function getNRowInPartId(part: number, row?: number): string {
    if (!isPresent(row)) {
        return `${nioChar}${part}`;
    }

    return `${nioChar}${part}-${row}`;
}

export function buildOutBlock(blocks: TextBlock[], rows: string[]): string[] {
    const result: string[] = [];

    // строка может содержать номер части (№1 и т.п.)
    rows.forEach(rowItem => {
        const part = getPartInfo(rowItem);

        const block = blocks.find(block => block.id === part.partId) || blocks.find(block => block.id === part.ref);

        if (!block) {
            return;
        }

        let rowInBlockNio = 0;

        if (block.type === 'tones' || block.type === 'drums') {
            rowInBlockNio++;
            const N = getNRowInPartId(part.partNio, rowInBlockNio);

            result.push(`${part.ref} ${N} %${part.partId}`);
        } else if (block.type === 'set') {
            let rows = block.rows.slice(1)
                .map(item => clearEndComment(item))
                .map(item => item.trim())
                .filter(item => !!(item && !item.startsWith('#')))
                .map(item => {
                    rowInBlockNio++;
                    const N = getNRowInPartId(part.partNio, rowInBlockNio);

                    return `${item} ${N} %${part.partId}`;
                });

            Array.prototype.push.apply(result, rows);
        }
    });

    return result;
}

export function startWithChar(char: string, val: string) {
    if (char === '$') {
        char = `\\${char}`;
    }

    const regExp = new RegExp(`^\\s*${char}`);

    return regExp.test(val);
}

export function createOutBlock({bpm, volume, currBlock, rows, id, type}: {
    id?: string,
    bpm?: number,
    volume?: number,
    currBlock?: TextBlock,
    rows: string[],
    type?: BlockType,
}): TextBlock {
    currBlock = currBlock || <TextBlock>{};
    id = id || 'out';
    bpm = bpm || currBlock.bpm || DEFAULT_BPM;
    type = type || 'set';

    volume = getSafeVolume(volume, 0) || getSafeVolume(currBlock.volume);

    const head = `out b${bpm} v${volume}`;

    return <TextBlock>{
        id,
        head,
        bpm,
        volume,
        repeat: 1,
        startRow: 0,
        endRow: rows.length,
        type,
        nio: 0,
        rows: [
            `<${head} >`,
            ...rows,
        ],
    };
}

export function guid(length: number = 10) {
    let value = '';

    while(value.length < length) {
        value =
            Math.random().toString(36).slice(2).replace(/\d/g, '') +
            Math.random().toString(36).slice(2).replace(/\d/g, '') +
            Math.random().toString(36).slice(2).replace(/\d/g, '')
        ;
    }

    return value.slice(0, length);
}

export function getPartNio(pVal: any): number {
    let val = (pVal || '') as string;
    val = val.replace(nioChar, '').trim();

    return parseInteger(val.split('-')[0], 0);
}

export function getRowNio(pVal: any): number {
    let val = (pVal || '') as string;
    val = val.replace(nioChar, '').trim();

    return parseInteger(val.split('-')[1], 0);
}

export function getPartRowNio(val: any): {partNio: number, rowNio: number} {
    return {
        partNio: getPartNio(val),
        rowNio: getRowNio(val),
    };
}

// arduino гармошка
// https://www.youtube.com/watch?v=aVjl3yQguc4

