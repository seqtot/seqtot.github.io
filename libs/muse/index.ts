'use babel';

import {
    parseInteger,
} from './utils';

import {
    mergeVolume,
    getSafeVolume,
    toneChar,
    isDrum,
    getPartInfo,
    drumsTrack,
    guid,
    getRowNio,
    getPartNio,
    isPresent,
    isNil,
    getTextBlocks,
    drumChar,
    createOutBlock,
    DEFAULT_VOLUME,
    getNRowInPartId,
    NUM_120,
    getPartRowNio,
    getRandomElement,
    getNoteByOffset,
    clearEndComment,
    getVolumeFromString,
} from './utils/utils-note';

import { textModelToLineModel, sortTracks } from './text-model-to-line-model';
import { DEFAULT_TONE_INSTR, defaultSynthSettings, toneAndDrumPlayerSettings } from './keyboards';
import { getFileSettings, getPitchShiftSetting } from './utils/getFileSettings';
import { getFirstLastRow } from './utils/getFirstLastRow';
import { getNearestCharIndex, getMidiConfig,isRefLine,getTopOutListHash, getTopOutList } from './get-midi-config';
import { getNextLinesForHandlePlay } from './get-next-lines-for-handle-play';
import { getNoteLineInfo, isNoteWithDurationOrPause } from './utils/getNoteLineInfo';
import { getNoteLineMetaAndInstr, getOutBlocksInfo } from './utils/getOutBlocksInfo';
import { getSlides, buildVibratoSlides, getPitchAndCent } from './utils/getSlides';
import { Sound } from './sound';
import { Ticker, tickOnTime } from './ticker';

import {drumCodes, drumInfo} from './drums';
import { guitarCodes, bassGuitarCodes, getInstrNameByCode, getInstrCodeBy, getInstrumentObj } from './instruments';
import { LineModel, CELL_SIZE } from './line-model';
import { Synthesizer } from './synthesizer';
import { MultiPlayer } from './multi-player';


export const Muse = {
    // simple
    parseInteger,
    mergeVolume,
    getSafeVolume,
    getPartInfo,
    guid,
    getRowNio,
    getPartNio,
    getTextBlocks,
    isDrum,
    isPresent,
    isNil,
    createOutBlock,
    getNRowInPartId,
    getPartRowNio,
    getRandomElement,
    getInstrNameByCode,
    getNoteByOffset,
    getInstrCodeBy,
    getInstrumentObj,
    clearEndComment,
    getVolumeFromString,

    // const
    toneChar,
    drumsTrack,
    drumCodes,
    drumChar,
    guitarCodes,
    bassGuitarCodes,
    DEFAULT_VOLUME,
    NUM_120,
    DEFAULT_TONE_INSTR,
    defaultSynthSettings,
    toneAndDrumPlayerSettings,
    drumInfo,

    // complex
    sortTracks,
    textModelToLineModel,
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
    Sound,
    Ticker,
    tickOnTime,
    LineModel,
    CELL_SIZE,
    Synthesizer,
    MultiPlayer,
} as const;

// TYPES
export { MidiConfig } from './get-midi-config';
export { LineModel } from './line-model';
export { Synthesizer } from './synthesizer';
export { MultiPlayer } from './multi-player';
export { OutBlockRowInfo } from './utils/getOutBlocksInfo';
export {
    NoteInfo, NoteLineInfo,
    WaveSlide, StoredRow, SongNode,
    TrackInfo, DataByTracks,
    Line, Cell, LineNote,
    KeyData,
    TextBlock,
    SongPartInfo,
    FileSettings,
    RowInfo,
} from './types';
export { Ticker } from './ticker';
export { Sound,KeyInfo, PlayingItem } from './sound';
