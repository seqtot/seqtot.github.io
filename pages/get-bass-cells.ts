import {Cell, LineNote} from '../libs/muse';
import { Sound } from '../libs/muse';
import {FreqInfo, freqInfoHash} from '../libs/muse/freq';
import {getRandomElement, isPresent} from '../libs/muse/utils';

function firstToLower(val: string): string {
    return val[0].toLowerCase() + val.slice(1);
}

function camelToKebab (val: string): string {
    val = (val || '').trim();

    if (!val) return '';

    val = firstToLower(val);

    return val.replace(/([a-z0-9а-яё])([A-ZА-ЯЁ])/g, '$1-$2').toLowerCase();
    //'хоХоЩаЩу'.replace(/([a-z0-9а-яё])([A-ZА-ЯЁ])/g, '$1-$2').toLowerCase();
}

const bassLinesSrc = [
// соло1_1
'щж ва жщ : 120 90 30 : ноЗаЖу',
'жщ лу жщ : -30 90 90 30 : ноВуЗа',
'жщ за жщ : 60 60 90 30 : ноХоЖаЖу',
'жщ ру щж : -30 90 90 30 : ноЖаЗу',
// соло1_2
'щж ва жщ : 120 90 30 : ноЩаЖа',
'жщ ру щж : -30 90 30 90 : ноЖаЗу',
// соло1_3
'щж ва жщ : 120 90 30 : ноЙаЛу',
'жщ лу жщ : -30 90 90 30 : ноЛуЖу',
'жщ за жщ : 60 60 90 30 : ноНоЗаЗу',
'жщ ру щж : 60 60 90 30 : ноНоЖаЖу',
// соло1_4

'щж на жщ : 60 60 90 30 : ноНоЩаЩу',
'жщ су щж : -30 90 : но',
'щж шу щж : 120 : но',
'щж хо щж : 90 60 120 60 150: ноЙаЛуЖуЩу',

];

// 1 2 3 4 5 6 7 8 9 10 11 12
// с ш н щ л ж з в ф р  г  й
// s w n   l   z v f r  g  j

const char2ToDigit = {
    'но': 0,
    'ха': 1,  'са': 2,  'ща': 3,  'жа': 4,  'ла': 5,  'ша': 6,  'за': 7,  'ва': 8,  'фа': 9,  'ра': 10,  'га': 11,  'йа': 12,
    'ху': -1, 'су': -2, 'щу': -3, 'жу': -4, 'лу': -5, 'шу': -6, 'зу': -7, 'ву': -8, 'фу': -9, 'ру': -10, 'гу': -11, 'йу': -12,
};

const digitTo2Char = {
    '0': 'но',
    '1':  'ха', '2':  'са', '3':  'ща', '4':  'жа', '5':  'ла', '6':  'ша', '7':  'за', '8':  'ва', '9':  'фа', '10':  'ра', '11':  'га', '12':  'йа',
    '-1': 'ху', '-2': 'су', '-3': 'щу', '-4': 'жу', '-5': 'лу', '-6': 'шу', '-7': 'зу', '-8': 'ву', '-9': 'фу', '-10': 'ру', '-11': 'гу', '-12': 'йу',
};

const digit1ToChar = {
    0: 'н', 1: 'х', 2: 'с', 3: 'щ', 4: 'ж', 5: 'л', 6: 'ш', 7: 'з', 8: 'в', 9: 'ф', 10: 'р', 11: 'г', 12: 'й'
};


type BassPattern = {key: string, arr: number[]};

const bassLines: {[key: string]: BassPattern[]} = bassLinesSrc.reduce((acc, item) => {
    let items = item.split(':').map(item => item.trim().replace(/ +/g, ' '));

    const key = `${items[0]}:${items[1]}`;

    if (!acc[key]) {
        acc[key] = [];
    }

    if (!acc[key].find((val) => val.key === items[2])) {
        const notes = camelToKebab(items[2]); //.split('-').map(note => char2ToDigit[note]).filter(isPresent);
        const arr = notes.split('-').map(note => char2ToDigit[note]).filter(isPresent);

        if (notes) {
            acc[key].push({
                key: notes,
                arr,
            });
        }
    }

    return acc;
}, {} as {[key: string]: BassPattern[]});

console.log('bassLines', bassLines);

function getChordStructure(cell: Cell): {notes: string[], codes: number[], formula: string} {
    const result = {
        notes: [],
        codes: [],
        formula: ''
    }

    if (!cell.notes.length) return result;

    const notesInfo = cell.notes
        .map(item => freqInfoHash[Sound.GetNoteLat(item.note)])
        .filter(item => item);

    for (let i=1; i < notesInfo.length; i++) {
        if (notesInfo[i].code < notesInfo[i-1].code) {
            notesInfo[i] = freqInfoHash[notesInfo[i].code + 12];
        }
    }

    for (let i=0; i < notesInfo.length; i++) {
        notesInfo[i] = freqInfoHash[notesInfo[i].code -24];
    }

    result.notes = notesInfo.map(item => item.noteLat);
    result.codes = notesInfo.map(item => item.code);

    if (result.notes.length === 1) {
        result.formula = 'х';
    } else {
        for (let i = 1; i < result.codes.length; i++) {
            const diff = result.codes[i] - result.codes[i-1];

            result.formula += digit1ToChar[diff];
        }
    }

    return result;
}

function getBeatStructure(bassCells: Cell[], startOffsetQ: number, nextOffsetQ: number): number[] {
    let pause = 0;
    let arr = [];

    bassCells.forEach((curr, i) => {
        let iNextOffsetQ = nextOffsetQ;

        if (!i) {
            pause = startOffsetQ - (curr.blockOffsetQ + curr.startOffsetQ);
            if (pause) {
                arr.push(pause);
            }
        }

        const next = bassCells[i+1];

        if (next) {
            iNextOffsetQ = (next.blockOffsetQ + next.startOffsetQ);
        }

        arr.push(iNextOffsetQ - (curr.blockOffsetQ + curr.startOffsetQ));
    });

    return arr;
}


function cutNotes(notes: LineNote[]): LineNote[] {
    notes.forEach(note => {
        if (note.durQ) {
            note.durQ = note.durQ > 10 ? note.durQ - 10 : note.durQ;
        }
    });

    return notes;
}

function createSimpleBass(bassCells: Cell[], headCells: Cell[], endOffsetQ: number) {
    console.log('bassCells', bassCells);

    bassCells.forEach((cell, i) => {
        const nextCell = bassCells[i+1];

        if (nextCell) {
            cell.notes.forEach(note => {
                note.durQ = (nextCell.blockOffsetQ + nextCell.startOffsetQ) - (cell.blockOffsetQ + cell.startOffsetQ);
            });
        }  else {
            cell.notes.forEach(note => {
                note.durQ = endOffsetQ - (cell.blockOffsetQ + cell.startOffsetQ);
            });
        }

        let headCell: Cell;

        for (let j = 0; j < headCells.length; j++) {
            if ((headCells[j].startOffsetQ + headCells[j].blockOffsetQ) <= (cell.startOffsetQ + cell.blockOffsetQ)) {
                headCell = headCells[j];
            }

            if ((headCells[j].startOffsetQ + headCells[j].blockOffsetQ) > (cell.startOffsetQ + cell.blockOffsetQ) ) {
                break;
            }
        }

        if (headCell && headCell.notes.length) {
            let note = (cell.notes.find(note => note.instName === '@bd') || cell.notes.find(note => note.instName === '@sn')) as LineNote;

            if (!note) {
                cell.notes = [];

                return;
            }

            note = {
                durQ: note.durQ,
                volume: 50,
                id: note.id,
                lineOffsetQ: note.lineOffsetQ,
                instCode: '',
                instName: note.instName,
            } as LineNote;

            let latNote = '';

            if (note.instName === '@bd') {
                latNote = Sound.GetNoteLat(headCell.notes[0].note);
                note.note = latNote[0] + 'u';
            } else {
                latNote = getRandomElement(headCell.notes).note;
                note.note = latNote[0] + 'y';
            }

            if (!latNote) {
                //note.durQ = 0;
                cell.notes = [];

                return;
            }

            note.instName = '$eBass*f'; // $egit*cl $eBass*f $tuba
            note.instCode = '';
            cell.notes = cutNotes([note]);
        } else {
            cell.notes = [];
        }
    });
}

export function getBassCells(harmCells: {curr: Cell, next: Cell}, bassCells: Cell[], endOffsetQ: number) { // Cell[]
    const curr = getChordStructure(harmCells.curr);
    const next = getChordStructure(harmCells.next);
    const bassDiff = next.codes[0] - curr.codes[0];

    let beatStructure = getBeatStructure(
        bassCells,
        harmCells.curr.startOffsetQ + harmCells.curr.blockOffsetQ,
        harmCells.next.startOffsetQ + harmCells.next.blockOffsetQ
    );

    const patternId = `${curr.formula} ${digitTo2Char[bassDiff]} ${next.formula}:${beatStructure.join(' ')}`;
    const pattern = getRandomElement(bassLines[patternId] || []) || {key: '', arr: []};
    const pitchArr = pattern.arr;

    beatStructure = beatStructure.filter(item => item > -1)

    if (!pitchArr.length || pitchArr.length !== bassCells.length) {
        console.log(`pattern for ${patternId} not found!`);

        return createSimpleBass(bassCells, [harmCells.curr, harmCells.next], endOffsetQ);
    }

    let currCode = curr.codes[0];
    let freqInfo: FreqInfo[] = [];

    pitchArr.forEach(item => {
        currCode = currCode + item;

        if (freqInfoHash[currCode]) {
          freqInfo.push(freqInfoHash[currCode]);
        }
    });

    if (!freqInfo.length || freqInfo.length !== bassCells.length) {
        console.log(`pattern for ${patternId} not found!`);

        return createSimpleBass(bassCells, [harmCells.curr, harmCells.next], endOffsetQ);
    }

    freqInfo.forEach((item, i) => {
        let cell = bassCells[i];
        let note = cell.notes[0];

        const isBD = cell.notes.find(item => item.instName === '@bd');
        const isSN = cell.notes.find(item => item.instName === '@sn');

        note = {
            id: note.id,
            volume: 50,
            instName: isBD && isSN ? '$cBass*s' : '$cBass*f',
            durQ: beatStructure[i],
            startOffsetQ: note.startOffsetQ,
            note: item.noteLat,
        }

        console.log('note', note);

        cell.notes = [note];
    });

    //console.log('freqInfo', freqInfo);
    //console.log(pattern, bassCells);
}
