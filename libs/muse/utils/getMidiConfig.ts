'use babel';

import * as un from './index';

export type RowInfo = {
    first: number,
    last: number,
}

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

export function getMidiConfig(x: {
    blocks: un.TextBlock[],
    currBlock: un.TextBlock,
    currRowInfo: RowInfo,
    excludeIndex?: number[],
    playBlockOut: string | un.TextBlock,
    midiBlockOut: un.TextBlock,
    topBlocksOut: string[],
}) {
    const excludeIndex = Array.isArray(x.excludeIndex) ? x.excludeIndex: [];

    if (x.currBlock.type === 'set') {
        x.midiBlockOut = x.currBlock;
        x.playBlockOut = x.midiBlockOut.id;
    }
    else if (x.currBlock.type === 'tones' || x.currBlock.type === 'drums') {
        //console.log('currBlock', x.currBlock);
        const repeat = x.currBlock.repeat || 1;
        x.midiBlockOut = x.currBlock;
        x.playBlockOut = un.createOutBlock({
            currBlock: x.currBlock,
            rows: [`${x.midiBlockOut.id}-${repeat}`],
        });
    }
    else {
        const nearestIndex = getNearestCharIndex('>', x.currRowInfo.first, x.currBlock.rows);

        if (nearestIndex > 0) {
            x.currRowInfo.first = nearestIndex;
            x.currRowInfo.last = nearestIndex;

            let rows = x.currBlock.rows
                .filter((item, i) => {
                    //console.log(item, i);

                    return isRefLine(item) && i >= nearestIndex && !excludeIndex.includes(i);
                })
                .join('|')
                .split('|')
                .map(item => un.clearEndComment(item))
                .map(item => item.replace('>', '').trim());

            if (rows.length) {
                rows.unshift('tick');
                x.topBlocksOut = rows;
                rows = un.buildOutBlock(x.blocks, rows);
                x.midiBlockOut = un.createOutBlock({currBlock: x.currBlock, rows});
                x.playBlockOut = x.midiBlockOut;
            }
        }
    }
}

export function getTopOutList(currBlock: un.TextBlock): string[] {
    let result: string[] = [];

    currBlock.rows.forEach(row => {
        row = un.clearEndComment(row).trim();

        if (!isRefLine(row)) {
            return;
        }

        result.push(row.replace('>', '').trim());
    });

    return result;
}
