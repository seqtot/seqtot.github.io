'use babel';

import {NoteInfo} from '../types';
import * as un from './index';
import {isRefLine} from './getMidiConfig';
import {getFirstLastRow} from './getFirstLastRow';

type Result = {
    notesByChannels: {
        left: NoteInfo[][],
        right: NoteInfo[][],
    },
    rowsRange: {
        first: number,
        last: number,
    },
    gotoTop: boolean
}

function getNotesArray(text: string): NoteInfo[] {
    text = un.clearNoteLine(text);
    const info = un.getNoteLineMetaAndInstr(text)

    text = info.meta ? info.meta + ' ' + info.noteLine : info.noteLine;

    return un.getNoteLineInfo(text).notes;
}

export function getNextLinesForHandlePlay(dx: {
    block: un.TextBlock,
    getNextRange: boolean,
    //isInitEvent: boolean,
    currRowInfo: Result['rowsRange'],
    skipLineByType?: '$R' | '$L' | '$l' | '$r' | null | undefined
}): Result {
    //console.log('dx', dx);

    const skipUpperLine = (dx.skipLineByType || '').toUpperCase() || undefined;
    const skipLowerLine = (dx.skipLineByType || '').toLowerCase() || undefined;

    const result: Result = {
        notesByChannels: {
            left: [],
            right: []
        },
        rowsRange: {
            first: 0,
            last: 0,
        },
        gotoTop: false,
    }

    let firstRow = dx.getNextRange ? dx.currRowInfo.last + 1 : dx.currRowInfo.first;
    firstRow = firstRow >= dx.block.rows.length ? 0 : firstRow;

    let nextFirstRow = firstRow;
    let nextLastRow = firstRow;
    let text = '';
    let leftNoteArr: NoteInfo[][] = [];
    let rightNoteArr: NoteInfo[][] = [];

    text = dx.block.rows[firstRow].trim();

    const skipLine = (val: string): boolean => {
        return val.startsWith(skipUpperLine) || val.startsWith(skipLowerLine) || !un.startWithChar(un.toneChar, val);
    }

    const getNotes = (row: number, direction: 'up' | 'down') => {
        const range = getFirstLastRow({
            block: dx.block,
            startIndex: row,
            direction: direction,
            skip: <any>skipUpperLine,
        });

        for (let i = range.first; i <= range.last; i++) {
            text = (dx.block.rows[i] || '').trim();

            if (skipLine(text)) continue;

            const isLeft = text.startsWith('$L') || text.startsWith('$l');
            const isRight = text.startsWith('$R') || text.startsWith('$r');

            text = text.split(':').slice(1).join(':');
            const tmp = getNotesArray(text);

            if (tmp.length && isLeft) {
                leftNoteArr.push(tmp);
            }
            else if (tmp.length && isRight) {
                rightNoteArr.push(tmp);
            }

            continue;
        }

        nextFirstRow = range.first;
        nextLastRow = range.last;
    }

    getNotes(
        firstRow,
        // dx.isInitEvent && un.startWithChar(un.toneChar, text) ? 'up' : 'down',
        un.startWithChar(un.toneChar, text) ? 'up' : 'down',
    );

    // если в оставшейся части больше нет нот начинаем сначала
    if (!leftNoteArr.length && !rightNoteArr.length) {
        result.gotoTop = true;
        getNotes(0, 'down');

        if (!leftNoteArr.length && !rightNoteArr.length) {
            nextFirstRow = 0;
            nextLastRow = 0;
        }
    }

    result.notesByChannels.left = leftNoteArr;
    result.notesByChannels.right = rightNoteArr;

    result.rowsRange.first = nextFirstRow;
    result.rowsRange.last = nextLastRow;

    return result;
}
