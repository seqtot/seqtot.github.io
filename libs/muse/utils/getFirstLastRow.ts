'use babel';

import {TextBlock} from '../types';

export function getFirstLastRow(dx: {
    block: TextBlock,
    startIndex: number,
    direction: 'up' | 'down',
    skip?: '$R' | '$L' | null | undefined
}): {first: number, last: number} {
    const skip = dx.skip || undefined;

    function isUpperCase(val: string): boolean {
        return !val.startsWith(skip) && (val.startsWith('$L') || val.startsWith('$R'));
    }

    const getBeforeUpperIndex = (i: number): number => {
        for (i; i >= 0; i--)
            if (isUpperCase(dx.block.rows[i].trim()))
                return i;

        return -1;
    }

    const getAfterUpperIndex = (i: number): number => {
        for (i; i < dx.block.rows.length; i++)
            if (isUpperCase(dx.block.rows[i].trim()))
                return i;

        return -1;
    }

    const getLastIndex = (ind: number): number => {
        let i = ind + 1;

        if (ind >= dx.block.rows.length) {
            return dx.block.rows.length - 1;
        }

        for (i; i < dx.block.rows.length; i++)
            if (isUpperCase(dx.block.rows[i].trim()))
                return i - 1;

        return i;
    }

    let first = 0;
    let last = 0;

    if (dx.direction === 'up') {
        first = getBeforeUpperIndex(dx.startIndex);
        first = first < 0 ? getAfterUpperIndex(dx.startIndex) : first;
    }
    else {
        first = getAfterUpperIndex(dx.startIndex);
    }

    if (first < 0) return {first: 0, last: 0}

    last = getLastIndex(first);

    if (last < 0) return {first: 0, last: 0}

    return {first, last};
}
