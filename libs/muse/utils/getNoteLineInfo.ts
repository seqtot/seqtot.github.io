import {parseInteger} from './parse-integer';

import {
    getVolumeFromString,
    clearNoteLine,
    getDurationFromString,
    getRepeatFromString,
    getBpmFromString,
    PAUSE,
    toneChar,
    decorChar,
    drumChar,
    isPresent,
    getString,
    getPitchShiftFromString,
    timeCharRE,
    timeChar,
    vibratoChar,

} from './utils-note';
import { TNoteLineInfo } from '../types';
import { noteLatByNoteHash } from '../freq';
import { getSlides, buildVibratoSlides } from './getSlides';

// дтрн мфвс злкб
// хлнм щшзв фжс
//
// бв-д-зклмн-рстф
// --г-ж-----п----хцчшщ
//

type Dx = {
    $item: string,
    noteLine: string,
    noteLineArr: string[],
    initInstr: string,
    initDecor: string,
    currInstr: string,
    currDecor: string,
    initVolume: number,
    currVolume: number,
    result: TNoteLineInfo,
    pitchShift: number,
}

function getDx(dx?: Partial<Dx>): Dx {
    return {
        noteLine: '',
        noteLineArr: [],
        initInstr: '',
        initDecor: '',
        currInstr: '',
        currDecor: '',
        initVolume: 0,
        currVolume: 0,
        $item: '',
        result: {
            notes: [],
            durationQ: 0,
            repeat: 1,
            bpm: 0,
        },
        pitchShift: 0,
        ...dx
    }
}

export function isNoteWithDurationOrPause(val: any): boolean {
    const str = getString(val);
    const note = (str.split(timeCharRE)[0] || '').toLowerCase();
    let result = false;

    if (note.startsWith(toneChar) || note.startsWith(decorChar)) {
        result = false;
    }
    else if (noteLatByNoteHash[note]) {
        result = true;
    }
    else if (timeCharRE.test(str) || str.includes('+')) {
        result = true;
    }
    else {
        result = parseInteger(str, -1) > -1;
    }

    return result;
}

function getVolumeVibratoDecorInstr(durationQ: number, val: string): {
    volume?: number,
    decor?: string,
    vibrato?: string,
} {
    val = (val || '').trim();

    const arr = val.split(':').filter(item => item);

    let volume: number | undefined = undefined;
    let vibrato: any = undefined;
    let decor: string | undefined = undefined;

    arr.forEach(item => {
        if (!isPresent(volume)) {
            volume = getVolumeFromString(item, undefined);
        }

        if (item.startsWith(decorChar)) {
            decor = item;

            return;
        }

        if (item.startsWith(vibratoChar)) {
            vibrato = buildVibratoSlides(durationQ, item);

            return;
        }
    });

    const result = {
        volume,
        vibrato,
        decor,
    }

    return  result;
}

/**
 * note.cent=durationForNextQ=durationQ:vVolume:~vibrato
 * до.25=120=60:v30
 */
function getNoteFullInfo(val: string): {
    note: string,
    durationQ: number,
    durationForNextQ: number,
    cent?: number,
    volume?: number,
    decor?: string,
    vibrato?: string,
} {
    val = (val || '').trim();

    const mainStr = val.split(':')[0] || '';
    const addStr = val.split(':').slice(1).join(':');
    const mainArr = mainStr.split(timeCharRE);

    let note = mainArr[0].split('.')[0];
    let cent = parseInteger(mainArr[0].split('.')[1], undefined);
    let durationForNextQ = parseInteger(mainArr[1], 0);
    let durationQ = parseInteger(mainArr[2], null);

    durationQ = durationQ === null ? durationForNextQ : durationQ;

    const addInfo = getVolumeVibratoDecorInstr(durationQ, addStr);

    const result =  {
        note,
        durationQ,
        durationForNextQ,
        cent,
        volume: addInfo.volume,
        decor: addInfo.decor,
        vibrato: addInfo.vibrato,
    };

    return result;
}

function handleNote (dx: Dx) {
    let arrSlides = dx.$item.split('_').filter(item => !!item);
    const firstSegment = arrSlides.shift() || '';
    const note = getNoteFullInfo(firstSegment); // note volume pitch

    note.volume = isPresent(note.volume) ? note.volume : dx.currVolume;

    let slidesText: string;

    if (arrSlides.length) {
        slidesText = arrSlides.join('_');
    }

    if (note.vibrato) {
        slidesText = note.vibrato;
        arrSlides = note.vibrato.split('_');
    }

    const slides = getSlides(arrSlides, note);

    //console.log('note', note);

    dx.result.notes.push({
        note: note.note,
        durationQ: note.durationQ,
        durationForNextQ: note.durationForNextQ,
        volume: note.volume,
        pitchShift: dx.pitchShift,
        instr: `${dx.currInstr}${note.decor ? note.decor : dx.currDecor}`,
        cent: note.cent,
        slides,
        slidesText,
    });
}

function handleNotNote (dx: Dx) {
    function setInstr(val: string) {
        const arr = val.split('*');
        const instr = arr[0] || '';
        let decor = arr[1] || '';
        decor = decor ? `*${decor}` : '';

        if (!dx.initInstr) {
            dx.initInstr = instr;
            dx.initDecor = decor;
        }

        dx.currInstr = instr || dx.initInstr;
        dx.currDecor = decor || dx.initDecor;
    }

    const volume = getVolumeFromString(dx.$item, dx.currVolume);
    //const pitchShift = getPitchShiftFromString(dx.$item, null);

    if (dx.$item.startsWith(toneChar) || dx.$item.startsWith(drumChar) || dx.$item.startsWith(decorChar)) {
        setInstr(dx.$item)
    }
    else if (isPresent(volume)) {
        dx.currVolume = volume;
    }
    // else if (isPresent(pitchShift)) {
    //     dx.pitchShift = pitchShift;
    // }
}

// Данные берутся только из noteLine
// {
//      notes: {
//          note: string,
//          durationQ: number,
//          durationForNextQ: number,
//          volume: number,
//      },
//      durationQ: number,
//      volume: number,
//      repeat: number,
//      bpm: number,
// }
//

function prepare(dx: Dx) {
    dx.noteLine = clearNoteLine(dx.noteLine);
    dx.initVolume = getVolumeFromString(dx.noteLine);
    dx.currVolume = dx.initVolume;
    dx.pitchShift = getPitchShiftFromString(dx.noteLine);
    dx.noteLineArr = dx.noteLine
        .split(' ')
        .map(item => item.trim())
        .filter(item => !!item)
        .map((item) => /^\d+$/.test(item) ? `${PAUSE}${timeChar}${item}` : item);
}

export function getNoteLineInfo(noteLine: string): TNoteLineInfo {
    const dx = getDx({noteLine});

    prepare(dx);

    if (!dx.noteLineArr.length) return dx.result;

    for(const item of dx.noteLineArr) {
        dx.$item = item;
        if (isNoteWithDurationOrPause(dx.$item)) {
            handleNote(dx);
        } else {
            handleNotNote(dx);
        }
    }

    dx.result.durationQ = getDurationFromString(
        dx.noteLine,
        dx.result.notes.reduce((acc, item) => acc + item.durationForNextQ, 0)
    );
    dx.result.repeat = getRepeatFromString(dx.noteLine, 1);
    dx.result.bpm = getBpmFromString(dx.noteLine, 0);

    return dx.result;
}

// getNoteLineInfo
//   getDx
//   prepare
//   handleNotNote
//   handleNote
//     getNoteFullInfo
//       getVolumeVibratoDecorInstr
//     isNoteWithDurationOrPause
//     getPitchAndCent
//     buildVibratoSlides
//     getSlides

