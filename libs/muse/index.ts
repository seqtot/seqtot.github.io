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
    getEndPointVolume,
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

import {drumIdByAlias, drumInfo} from './drums';
import { guitarCodes, bassGuitarCodes, getInstrNameByCode, getInstrCodeBy, getInstrumentObj } from './instruments';
import { LineModel, CELL_SIZE } from './line-model';
import { Synthesizer } from './synthesizer';
import { MultiPlayer } from './multi-player';
import { freqInfoHash, freqInfoList } from './freq';

import { WebAudioFontLoader } from './font/loader';
import { getInstrumentTitles } from './font/instrument-titles';
import { getAudioBufferFromBlobString, getAudioBufferFromString } from './font/audio-buffer-to-wav';
import { preparePreset } from './font/prepare';

export const Muse = {
    const: {
        CELL_SIZE,
        freqInfoHash,
        freqInfoList,
        DEFAULT_TONE_INSTR,
    },
    utils: {
        isPresent,
        getSafeVolume,
        mergeVolume,
        parseInteger,
        getRandomElement,
        getEndPointVolume,
        getAudioBufferFromBlobString,
        getAudioBufferFromString,
        isNil,
        getNoteByOffset,
    },
    parser: {

    },
    player: {
        MultiPlayer,
    },
    ticker: {
        Ticker,
    },
    font: {
        WebAudioFontLoader,
        getInstrumentTitles,
        preparePreset,
    },
    class: {
        LineModel,
        Sound,
        Synthesizer,
        MultiPlayer,
        WebAudioFontLoader,
    },
    synth: {
        Synthesizer,
    },

    // simple
    getPartInfo,
    guid,
    getRowNio,
    getPartNio,
    getTextBlocks,
    isDrum,
    createOutBlock,
    getNRowInPartId,
    getPartRowNio,

    getInstrNameByCode,
    getInstrCodeBy,
    getInstrumentObj,
    clearEndComment,
    getVolumeFromString,

    // const
    toneChar,
    drumsTrack,
    drumIdByAlias,
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
    Synthesizer,
    MultiPlayer,
} as const;

// TYPES
export { TMidiConfig } from './get-midi-config';
export { LineModel } from './line-model';
export { Synthesizer } from './synthesizer';
export { MultiPlayer } from './multi-player';
export { TOutBlockRowInfo } from './utils/getOutBlocksInfo';
export {
    TNoteInfo, TNoteLineInfo,
    TWaveSlide, TStoredRow, TSongNode,
    TTrackInfo, TDataByTracks,
    TLine, TCell, TLineNote,
    TKeyData,
    TTextBlock,
    TSongPartInfo,
    TFileSettings,
    TRowInfo,
} from './types';
export { Ticker } from './ticker';
export { Sound,TKeyInfo, TPlayingItem } from './sound';
export { TFreqInfo } from './freq';
export { TSignatureType } from './ticker';

export { TWavePreset } from './font/otypes';
export { WebAudioFontLoader } from './font/loader';
