'use babel';

import {NoteLineInfo} from '../types';
import {
    TextBlock,
    findBlockById,
    getBlockType,
    getSafeVolume,
    getVolumeFromString,
    getNoteLnsByDrumInstruments,
    getNoteLnsByToneInstruments,
    parseInteger, getRepeatFromString,
    toneChar, drumChar, DEFAULT_VOLUME,
    mergeVolume, clearEndComment, nioChar,
    partIdChar,
} from './utils-note';

import {getNoteLineInfo, isNoteWithDurationOrPause} from './getNoteLineInfo';

export type NoteLn = {
    trackName: string,
    noteLine: string,
    parentVolume: number,
    repeat: number,
    noteLineInfo: NoteLineInfo,
    colLoopDurationQ: number,

    startOffsetQ?: number,
}


export type OutBlockRowInfo = {
    trackLns: NoteLn[];
    headLoopRepeat: number;
    headLoopDurationQ: number;
    rowDurationByHeadQ: number;
    rowRepeat: number;
    bpm?: number,
    //mask?: string | number,
    text?: string,
    startOffsetQ?: number,
};

type OutBlocksInfo = {
    rows: OutBlockRowInfo[],
    durationQ: number,
}

/**
 * meta в конце
 */
export function getNoteLineMetaAndInstr(noteLine: string, instr?: string): {
    noteLine: string,
    meta: string,
    instr: string,
} {
    const arr = noteLine.split(' ');

    let i = arr.length;

    for (i; i > 0; i--) {
        if(isNoteWithDurationOrPause(arr[i-1])) {
            break;
        }
    }

    //console.log('getNoteAndMetaFromNoteLine', noteLine);

    const meta = arr.slice(i);
    noteLine = arr.slice(0, i).join(' ');

    for (const item of meta) {
        if (item.startsWith(toneChar) || item.startsWith(drumChar)) {
            instr = item;

            break;
        }
    }

    //console.log({meta, noteLine, instr});

    return {
        noteLine,
        meta: meta.join(' '),
        instr,
    }
}

/**
 *  trackLns: {
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
): OutBlocksInfo {
    let outBlock: TextBlock;

    if (typeof pOutBlock === 'string') {
        outBlock = findBlockById(blocks, pOutBlock);
    } else {
        outBlock = pOutBlock;
    }

    const result = <OutBlocksInfo>{
        rows: [],
        durationQ: 0
    };

    if (!outBlock) {
        console.warn('Block OUT not found');
        return result;
    }

    const rootVolume = getSafeVolume(outBlock.volume);

    // строки для вывода в out
    //console.log('outBlocks2', [...outBlock.rows]);
    const textRows = outBlock.rows
        .map((item) => clearEndComment(item)) // jjkl
        .map((item) => item.trim())
        .filter((item, i) => {
            return i && item && !item.startsWith('#');
        });

    if (!Array.isArray(textRows) || !textRows.length) {
        console.warn('Bad rows', outBlock);

        return result;
    }

    let totalDurationQ = 0;
    // box
    //    row
    //       col
    //          noteLines

    // цикл по строкам out - это не ссылки на другие блоки
    textRows.forEach((row, iRow) => {
        let metaByLine = '';
        let rowInPartId = '';
        let partId = '';

        const colArr = (row || '')
            .split(' ')
            .filter(item => !!item)
            .reduce((acc, item) => {
                if (item.startsWith('[')) {
                    metaByLine =  (metaByLine + ' ' + item.replace(/[\[\]]/g, '')).trim();

                    return acc;
                }

                if (item.startsWith(nioChar)) {
                    rowInPartId =  item.replace(nioChar, '');

                    return acc;
                }

                if (item.startsWith(partIdChar)) {
                    partId =  item.replace(partIdChar, '');

                    return acc;
                }

                acc.push(item);

                return acc;
            }, []);

        //console.log('metaByLine', metaByLine );

        let headLoopRepeat = 1;
        let headLoopDurationQ = 0;
        let colRepeat = 1;
        let block: TextBlock;
        let rowNoteLns: NoteLn[] = [];

        //console.log('findBlockById', colArr);

        for (let iCol = 0; iCol < colArr.length; iCol++) {
            const item = colArr[iCol];
            const typeByName = getBlockType(item); // $: voice @:drum
            const colInfoArr = (item || '').split(/[:]/).filter(item => !!item); // [-:]
            const colInfoStr = colInfoArr.join(' ');
            let noteLinesWithTrackName: {trackName: string, noteLine: string}[];
            let colNoteLns: NoteLn[] = [];
            let colId = colInfoArr[0].trim();
            let colVolume: number;
            let head = '';
            let colLoopDurationQ = 0;

            colRepeat = parseInteger(colInfoArr[1], 0) || getRepeatFromString(colInfoStr, headLoopRepeat);

            //console.log('colId', colId);

            block = findBlockById(blocks, colId);

            if (!block) {
                throw new Error(`Block not <${colId}> found`);
            }

            if (iCol === 0) {
                head = 'head ';
                headLoopRepeat = colRepeat;
            }

            //volume = getVolumeFromString(itemInfoStr, 0) || getVolumeFromString(block.head);
            colVolume = getVolumeFromString(colInfoStr, DEFAULT_VOLUME);

            if (block.type === 'drums' || typeByName === 'drums') {
                noteLinesWithTrackName = getNoteLnsByDrumInstruments(block.rows);
            } else {
                noteLinesWithTrackName = getNoteLnsByToneInstruments(block.rows);
            }

            noteLinesWithTrackName.forEach(noteLineWithTrackName => {
                //console.log('noteLinesByName', item);

                const info = getNoteLineMetaAndInstr(noteLineWithTrackName.noteLine, noteLineWithTrackName.trackName);
                const volume = getVolumeFromString(info.meta);
                const noteLine = `${head}r${colRepeat} v${volume} ${info.instr} ${info.noteLine}`;
                const noteLineInfo = getNoteLineInfo(noteLine);

                colLoopDurationQ = Math.max(colLoopDurationQ, noteLineInfo.durationQ);

                if (iCol === 0) {
                    headLoopDurationQ = colLoopDurationQ;
                }

                colNoteLns.push({
                    trackName: noteLineWithTrackName.trackName,
                    noteLine,
                    noteLineInfo,
                    repeat: colRepeat,
                    parentVolume: mergeVolume(colVolume, rootVolume),
                    colLoopDurationQ: 0,
                })
            });

            //console.log('colNoteLns', colNoteLns);

            colNoteLns.forEach(noteLn => {
                //console.log('noteLn', noteLn);

                noteLn.colLoopDurationQ = colLoopDurationQ;
                rowNoteLns.push(noteLn);
            });
        }

        let rowRepeat = 1;
        let rowDurationByHeadQ = headLoopDurationQ * headLoopRepeat;
        totalDurationQ = totalDurationQ + (rowDurationByHeadQ * rowRepeat);

        result.rows.push({
            trackLns: rowNoteLns,
            headLoopRepeat,
            headLoopDurationQ,
            rowDurationByHeadQ,
            rowRepeat,
            //mask: mask || rowDurationByHeadQ,
            text: row
        });
    });

    result.durationQ = totalDurationQ;

    //console.log('RES', result);

    return result;
}
