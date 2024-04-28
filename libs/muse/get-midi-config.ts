
import {TTextBlock, TSongPartInfo} from './types';
import * as un from './utils';

export function isRefLine(val: string): boolean {
    return /^\s*>/.test(val)
}

export function getNearestCharIndex(char: string, from: number, arr: string[]) {
    const regExp = new RegExp(`^\\s*${char}`);

    // ищем вверх
    for (let i = from; i >= 0; i--) {
        if (regExp.test(arr[i])) {
            return i;
        }
    }

    // ищем вниз
    for (let i = from; i <arr.length; i++) {
        if (regExp.test(arr[i])) {
            return i;
        }
    }

    return -1;
}

export type TMidiConfig = {
    blocks: TTextBlock[],
    excludeIndex: number[],
    currBlock: TTextBlock,
    currRowInfo: {first: number, last: number},
    midiBlockOut: TTextBlock,
    playBlockOut: string | TTextBlock,
    topBlocksOut: string[],
}

export function getMidiConfig(x: TMidiConfig) {
    const excludeIndex = Array.isArray(x.excludeIndex) ? x.excludeIndex: [];

    if (x.currBlock.type === 'set') {
        x.midiBlockOut = x.currBlock;
        x.playBlockOut = x.midiBlockOut.id;
    }
    else if (x.currBlock.type === 'tones' || x.currBlock.type === 'drums') {
        const repeat = x.currBlock.repeat || 1;
        x.midiBlockOut = x.currBlock;
        x.playBlockOut = un.createOutBlock({
            currBlock: x.currBlock,
            rows: [`${x.midiBlockOut.id}:${repeat}`], // jjkl repeat
        });
    }
    else {
        const nearestIndex = getNearestCharIndex('>', x.currRowInfo.first, x.currBlock.rows);

        if (nearestIndex > 0) {
            x.currRowInfo.first = nearestIndex;
            x.currRowInfo.last = nearestIndex;

            let rows = getTopOutList({
                topBlock: x.currBlock,
                nearestIndex,
                excludeIndex,
                printN: true
            });

            if (rows.length) {
                x.topBlocksOut = rows;
                rows = un.buildOutBlock(x.blocks, rows);

                if (x.blocks.find(item => item.id === 'tick')) {
                    rows.unshift('tick');
                }

                x.midiBlockOut = un.createOutBlock({currBlock: x.currBlock, rows});
                x.playBlockOut = x.midiBlockOut;
            }
        }
    }
}

export function getTopOutList(x: {
    topBlock: TTextBlock,
    nearestIndex?: number,
    excludeIndex?: number[]
    printN?: boolean,
}
): string[] {
    let partNio = 0;
    let nearestIndex = x.nearestIndex | 0;
    let excludeIndex = Array.isArray(x.excludeIndex) ? x.excludeIndex : [];
    let printN = !!x.printN;
    let rows: string[] = [];

    x.topBlock.rows.forEach(item => {
        item = un.clearEndComment(item).trim();

        if (isRefLine(item)) {
            item = item.replace('|', '>');
            const arr = item.split('>').map(item => item.trim()).filter(item => item).map(item => `> ${item}`);
            arr.forEach(item => rows.push(item));
        } else {
            rows.push(item);
        }
    });

    rows = rows.reduce((acc, item, i) => {
        if (isRefLine(item)) {
            partNio++;
        }

        if (!isRefLine(item) || i < nearestIndex || excludeIndex.includes(i)) {
            return acc;
        }

        item = item.replace('>', '').trim();

        if (!item) return acc;

        let N = '';

        if (printN) {
            const part = un.getPartInfo(item);

            if (!part.partNio) {
                N = printN ? `${un.getNRowInPartId(partNio)} ` : '';
            }
        }

        return [...acc, `${N}${item}`];
    }, <string[]>[]);

    //console.log('getTopOutList' , rows);

    return rows;
}

export function getTopOutListHash(x: {
    topBlock: TTextBlock,
    nearestIndex?: number,
    excludeIndex?: number[]
}): TSongPartInfo[] {
    let partNio = 0;
    let nearestIndex = x.nearestIndex | 0;
    let excludeIndex = Array.isArray(x.excludeIndex) ? x.excludeIndex : [];
    let result: TSongPartInfo[] = [];
    let rows: string[] = [];

    x.topBlock.rows.forEach(item => {
        item = un.clearEndComment(item).trim();

        if (isRefLine(item)) {
            item = item.replace('|', '>');
            const arr = item.split('>').map(item => item.trim()).filter(item => item).map(item => `> ${item}`);
            arr.forEach(item => rows.push(item));
        } else {
            rows.push(item);
        }
    });

    result = rows.reduce((acc, item, i) => {
        if (isRefLine(item)) {
            partNio++;
        }

        if (!isRefLine(item) || i < nearestIndex || excludeIndex.includes(i)) {
            return acc;
        }

        item = item.replace('>', '').trim();

        if (!item) return acc;

        const part = un.getPartInfo(item);

        part.partNio = partNio;
        part.rowInPartId =`${partNio}-${0}`;

        return [...acc, part];
    }, <TSongPartInfo[]>[]);

    return result;
}
