import * as un from './utils';
import {getInstrumentObj} from './instruments';
import {TWavePreset, TWaveZone} from './font/otypes';
import {TNoteLineInfo, TWaveSlide} from './types';
import {PAUSE} from './utils';
import {getSoundsInfoArr, TMidiCodeAndZone} from './get-sound-info-arr';

/**
 * Одиночная нота для воспроизведения
 */
export type TNoteForTick = {
    notes: string; // вид исходных нот переданных для воспроизведения
    offsetFromBeatMs?: number;
    durationMs?: number;
    volume: number,
    pitchShift: number,
    slides?: TWaveSlide[],
    cent?: number,

    soundsInfo: TMidiCodeAndZone[];
    instrName: string;
    instrObj: TWavePreset;
    zone?: TWaveZone
};

export type TTicksInfoMap = {
    [key: string]: TNoteForTick[];
};

export type TLoopInfo = {
    id: string | number;
    tickCount: number;
    durationQ: number;
    repeat: number;
    isDrum: boolean;
    volume: number; // ??? parentVolume
    isHead?: boolean;
    // [key]: TicksInfo
    // [key]: TicksInfo
};

export type TLoopAndTicksInfo = TLoopInfo & TTicksInfoMap;

function getBeatIndex(offsetQ: number, dx: {
    restForNextRowQ: number,
    lastBeatInd: number
}): number {
    const index = Math.floor(offsetQ/un.NUM_120);
    if (dx.restForNextRowQ && index === dx.lastBeatInd + 1) return dx.lastBeatInd;
    return index;
}

function getOffsetFromBeatMs(
    startBeat: number,
    offsetFromBeatQ: number,
    dx: {beatsMs: number[]}
): number {
    // смещение от начала бита в ms
    return Math.round(offsetFromBeatQ * (dx.beatsMs[startBeat] / un.NUM_120));
}

function getDurationMs(
    startBeat: number,
    offsetFromBeatQ: number,
    durationQ: number,
    dx: {
        beatsMs: number[],
        beatsQ: number[],
        restForNextRowQ: number,
        lastBeatInd: number
    }
): { durationMs: number, hundredthMs: number } {
    let lastBeat = getBeatIndex(
        dx.beatsQ[startBeat] + offsetFromBeatQ + durationQ,
        dx
    );

    lastBeat = lastBeat >= dx.beatsMs.length ? dx.beatsMs.length - 1 : lastBeat;

    let beatsDurationMs = dx.beatsMs
        .slice(startBeat, lastBeat + 1)
        .reduce((acc, val) => {
            return acc + val;
        }, 0);

    let hundredthMs = beatsDurationMs / ((lastBeat - startBeat + 1) * un.NUM_120);

    return {
        durationMs: Math.round(durationQ * hundredthMs),
        hundredthMs
    };
}

function buildSked (ind: number, dx: {
    offsetQ: number,
    noteLineInfo: TNoteLineInfo,
    beatsMs: number[],
    beatsQ: number[],
    instrAny?: string | number | TWavePreset,
    restForNextRowQ: number,
    restFromPrevRowQ,
    lastBeatInd: number,
    parentVolume: number,
    sked: TLoopAndTicksInfo,
    colLoopDurationQ: number,
})  {
    //console.log('buildSked', ind, dx);

    if (ind) {
        dx.offsetQ = dx.restFromPrevRowQ + (dx.colLoopDurationQ * ind); // dx.restForNextRow
    }

    dx.noteLineInfo.notes.forEach(info => {
        const isDrum = un.isDrum(info.instr);

        let soundsInfoArr: TMidiCodeAndZone[];

        if (info.note === PAUSE) {
            soundsInfoArr = [];
        } else {
            soundsInfoArr = getSoundsInfoArr(isDrum ? info.instr : info.note);
        }

        let beatIndex = getBeatIndex(dx.offsetQ, dx);

        if (beatIndex >= dx.beatsMs.length) {
            return;
        }

        let offsetFromBeatQ = dx.offsetQ - dx.beatsQ[beatIndex];
        let offsetFromBeatMs = getOffsetFromBeatMs(beatIndex, offsetFromBeatQ, dx);
        let durationCalc = getDurationMs(beatIndex, offsetFromBeatQ, info.durationQ, dx);
        let durationMs = durationCalc.durationMs;

        dx.offsetQ = dx.offsetQ + info.durationForNextQ;

        const instrObj = getInstrumentObj(info.instr || dx.instrAny);
        let volume = un.getSafeVolume(info.volume);
        volume = un.mergeVolume(volume, dx.parentVolume);
        let pitchShift = info.pitchShift || 0;

        if (soundsInfoArr.length) {
            dx.sked[beatIndex] = Array.isArray(dx.sked[beatIndex]) ? dx.sked[beatIndex] : [];

            const slides = info.slides
                ? info.slides.map(item => ({
                    ...item,
                    endWhen: item.endWhen * durationCalc.hundredthMs / 1000,
                }))
                : undefined;

            dx.sked[beatIndex].push({
                notes: info.note,
                durationMs,
                offsetFromBeatMs,
                soundsInfo: soundsInfoArr,
                instrName: info.instr,
                instrObj,
                volume,
                pitchShift,
                slides,
                cent: info.cent,
            });
        }
    });
}

/**
 * beatsMs не включает элемент сдвига
 */
export function getSkedByQuarters(
    props: {
        noteLine: string; // очищенная от {}
        noteLineInfo: TNoteLineInfo;
        isDrum: boolean;
        instrAny: string | number | TWavePreset;
        beatsMs: number[];
        repeat: number;
        parentVolume: number;
        restFromPrevRowQ: number; // добавляется только для первого цикла
        restForNextRowQ: number;  // добавляется только для первого цикла
        colLoopDurationQ: number; // длина одного цикла внутри которого надоходится линейка
    }
): TLoopAndTicksInfo {
        // все поля обязательно, но проверям их заполненность
        //console.log('getSkedByQuarters.props', props);

        const dx = {
            noteLineInfo: null as TNoteLineInfo,
            offsetQ: 0,
            lastBeatInd: 0,
            beatsMs: props.beatsMs,
            beatsQ: [] as number[],
            repeat: 0,
            sked: {} as TLoopAndTicksInfo,
            restForNextRowQ: props.restForNextRowQ || 0,
            restFromPrevRowQ: 0,
            colLoopDurationQ: 0,
            parentVolume: 0,
            buildCount: 0,
            durationByBeatsCountQ: 0,
        };

        let isDrum = !!props.isDrum;
        let isHead = /head /.test(props.noteLine);

        dx.parentVolume = un.getSafeVolume(props.parentVolume);
        dx.noteLineInfo = props.noteLineInfo || un.getNoteLineInfo(props.noteLine);
        dx.colLoopDurationQ = props.colLoopDurationQ  || dx.noteLineInfo.durationQ | 0;
        dx.sked.isDrum = isDrum;
        dx.beatsQ = dx.beatsMs.map((item, i) => i * un.NUM_120); // jjkl
        dx.restFromPrevRowQ = props.restFromPrevRowQ || 0;
        dx.offsetQ = dx.restFromPrevRowQ;
        dx.lastBeatInd = dx.beatsMs.length - 1;
        dx.repeat = props.repeat || dx.noteLineInfo.repeat || 1;

        dx.durationByBeatsCountQ = dx.beatsMs.length * un.NUM_120;
        //console.log('доступное количество повторов', beatsMs, beatsQ, durationByBeatsCountQ, noteLineInfo.durationQ);
        //dx.buildCount = Math.ceil(dx.durationByBeatsCountQ / dx.noteLineInfo.durationQ); //let buildCount = Math.ceil((beatsMs.length * un.NUM_120) / noteLineInfo.durationQ );
        dx.buildCount = Math.ceil(dx.durationByBeatsCountQ / dx.colLoopDurationQ); //let buildCount = Math.ceil((beatsMs.length * un.NUM_120) / noteLineInfo.durationQ );
        dx.buildCount = Math.min(dx.repeat, dx.buildCount);

        for (let i = 0; i < dx.buildCount; i++) {
            buildSked(i, dx);
        }

        dx.sked.repeat = 1;
        dx.sked.tickCount = dx.beatsMs.length;
        dx.sked.isHead = isHead;
        //sked.durationQ = beatsMs.length  * un.NUM_120; // sked.durationQ = noteLineInfo.durationQ;

        //console.log('getSkedByQuarters.sked', dx);

        return dx.sked;
    }

// https://www.html5rocks.com/en/tutorials/audio/scheduling/
// https://www.youtube.com/user/UsernameInvalidTBH/videos
