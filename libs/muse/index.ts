'use babel';

import * as utils from './utils/utils-note';

import { getFileSettings, getPitchShiftSetting } from './utils/getFileSettings';
import { getFirstLastRow } from './utils/getFirstLastRow';
import { getNearestCharIndex, getMidiConfig,isRefLine,getTopOutListHash, getTopOutList } from './utils/getMidiConfig';
import { getNextLinesForHandlePlay } from './utils/getNextLinesForHandlePlay';
import { getNoteLineInfo, isNoteWithDurationOrPause } from './utils/getNoteLineInfo';
import { getNoteLineMetaAndInstr, getOutBlocksInfo } from './utils/getOutBlocksInfo';
import { getSlides, buildVibratoSlides, getPitchAndCent } from './utils/getSlides';
import { Sound } from './sound';

export const Muse = {
    utils: {
        ...utils,
    },
    parse: {
        getNoteLineInfo,
        isNoteWithDurationOrPause,
        getFileSettings,
        getPitchShiftSetting,
        getFirstLastRow,
        getNearestCharIndex,
        getMidiConfig,
        isRefLine,
        getTopOutListHash,
        getTopOutList,
        getNextLinesForHandlePlay,
        getNoteLineMetaAndInstr,
        getOutBlocksInfo,
        getSlides,
        buildVibratoSlides,
        getPitchAndCent,
    },
    build: {

    },
    classes: {
        Sound,

    }
}
