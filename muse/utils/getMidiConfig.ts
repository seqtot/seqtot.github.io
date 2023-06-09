'use babel';

import * as un from './index';
import {clearEndComment} from './index';

export type RowInfo = {
    first: number,
    last: number,
}

export function isRefLine(val: string): boolean {
    return /^\s*>/.test(val)
}

function getNearestCharIndex(char: string, from: number, arr: string[]) {
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

function createOutBlock({bpm, volume, currBlock, rows, id}: {
    id?: string,
    bpm?: number,
    volume?: number,
    currBlock?: un.TextBlock,
    rows: string[],
}): un.TextBlock {
    currBlock = currBlock || <un.TextBlock>{};
    id = id || 'out';
    bpm = bpm || currBlock.bpm || un.DEFAULT_BPM;

    volume = un.getSafeVolume(volume, 0) || un.getSafeVolume(currBlock.volume);

    const head = `out b${bpm} v${volume}`;

    return <un.TextBlock>{
        id,
        head,
        bpm,
        volume,
        repeat: 1,
        startRow: 0,
        endRow: rows.length,
        type: 'set',
        nio: 0,
        rows: [
            `<${head} >`,
            ...rows,
        ],
    };
}

export function getMidiConfig(x: {
    blocks: un.TextBlock[],
        midiBlock: un.TextBlock,
        currBlock: un.TextBlock,
        playBlock: string | un.TextBlock,
        currRowInfo: RowInfo,
        topBlocks: string[],
        excludeIndex?: number[],
}) {
    const excludeIndex = Array.isArray(x.excludeIndex) ? x.excludeIndex: [];

    if (x.currBlock.type === 'set') {
        x.midiBlock = x.currBlock;
        x.playBlock = x.midiBlock.id;
    }
    else if (x.currBlock.type === 'tones' || x.currBlock.type === 'drums') {
        //console.log('currBlock', x.currBlock);
        const repeat = x.currBlock.repeat || 1;
        x.midiBlock = x.currBlock;
        x.playBlock = createOutBlock({
            currBlock: x.currBlock,
            rows: [`${x.midiBlock.id}-${repeat}`],
        });
    }
    else {
        const nearestIndex = getNearestCharIndex('>', x.currRowInfo.first, x.currBlock.rows);

        if (nearestIndex > 0) {
            x.currRowInfo.first = nearestIndex;
            x.currRowInfo.last = nearestIndex;

            let rows = x.currBlock.rows
                .filter((item, i) => {
                    console.log(item, i);

                    return isRefLine(item) && i >= nearestIndex && !excludeIndex.includes(i);
                })
                .join('|')
                .split('|')
                .map(item => un.clearEndComment(item))
                .map(item => item.replace('>', '').trim());

            if (rows.length) {
                rows.unshift('tick');
                x.topBlocks = rows;
                rows = un.buildOutBlock(x.blocks, rows);
                x.midiBlock = createOutBlock({currBlock: x.currBlock, rows});
                x.playBlock = x.midiBlock;
            }
        }
    }
}

export function getTopOutList(currBlock: un.TextBlock): string[] {
    let result: string[] = [];

    currBlock.rows.forEach(row => {
        row = clearEndComment(row).trim();

        if (!isRefLine(row)) {
            return;
        }

        result.push(row.replace('>', '').trim());
    });

    return result;
}
