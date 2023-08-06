import { ToneKeyboardType } from './keyboard-ctrl';

export const bassGuitarInstr = 374; // 388 - eMediator 375 - eFinger
export const cleanGuitarInstr = 276;
export const rockGuitarInstr = 327;
export const organInstr = 182; // 162

export const octaveColor = {
    u: 'black',
    y: 'darkblue',
    o: 'darkgreen',
    a: 'lightblue',
    e: 'lightgreen',
    i: 'yellow',
}

export type GuitarSettings = {
    stringCount: number,
    offset: number
}

export const instrName = {
    327: '$egit*drp',
    321: '$egit*drpm',
    276: '$guit*ec',
    374: '$cBass*f',
    182: '$organ*r',
}

export type ChessCell = {
    colInd: number,
    noteId: number,
    cellId: number,
    bgColor: string,
    char: string,
    startOffsetQ: number,
    totalOffsetQ: number,
    underline: boolean,
    durQ: number,
    octave: string,
}

export const lightBgColor = '#eee';
export const mainBgColor = '#ccc';
export const darkBgColor = '#aaa';

export const mapNoteToChar = {
    d: 'C',
    t: 't',
    r: 'D',
    n: 'n',
    m: 'E',
    f: 'F',
    v: 'v',
    s: 'G',
    z: 'z',
    l: 'A',
    k: 'k',
    b: 'B'
}

export function getBassСellStyles(note: string, iRow: number, iCol: number): {
    bgColor: string,
    borders: string,
    text: string,
} {
    note = note || '';

    let bgColor = mainBgColor;
    let text = '&nbsp;'

    if (iRow === 0 || iRow === 12) {
        text = mapNoteToChar[note[0]] || text;
    }

    if (iRow === 0 || iRow === 3 || iRow === 5 || iRow === 7 || iRow === 9 || iRow === 12) {
        bgColor = darkBgColor;
    }
    // if (note[0] === 'd') {
    //     bgColor = 'white';
    // }
    //
    // if (note[0] === 't') {
    //
    // }
    //
    // if (note[0] === 'r') {
    //
    // }
    //
    // if (note[0] === 'n') {
    //     bgColor = 'white';
    // }
    //
    // if (note[0] === 'm') {
    //
    // }
    //
    // if (note[0] === 'f') {
    //
    // }
    //
    // if (note[0] === 'v') {
    //
    // }
    //
    // if (note[0] === 's') {
    //
    // }
    //
    // if (note[0] === 'z') {
    //     bgColor = 'white';
    // }
    //
    // if (note[0] === 'l') {
    //
    // }
    //
    // if (note[0] === 'k') {
    //
    // }
    //
    // if (note[0] === 'b') {
    //     bgColor = 'white';
    // }

    return {
        bgColor,
        borders: 'border: 1px solid black;',
        text,
    };
}

export function getHarmonicaCellStyles(note: string): {
    bgColor: string,
    borders: string,
    text: string,
} {
    note = note || '';

    let bgColor = '#ccc';

    if (note[0] === 'd') {
        bgColor = 'white';
    }

    if (note[0] === 't') {

    }

    if (note[0] === 'r') {

    }

    if (note[0] === 'n') {
        bgColor = 'white';
    }

    if (note[0] === 'm') {

    }

    if (note[0] === 'f') {

    }

    if (note[0] === 'v') {

    }

    if (note[0] === 's') {

    }

    if (note[0] === 'z') {
        bgColor = 'white';
    }

    if (note[0] === 'l') {

    }

    if (note[0] === 'k') {

    }

    if (note[0] === 'b') {
        bgColor = 'white';
    }

    return {
        bgColor,
        borders: 'border: none;',
        text: '&nbsp;'
    };
}

export function getKeyFn(x: {
    keyboardId: string | number;
    cellSize?: string;
    fontSize?: string;
    cellStylesFn: (note: string, iRow?: number, iCell?: number) => {bgColor: string, borders: string, text: string}
}): (note: string, symbol: string, iRow?: number, iCol?: number) => string {
    const keyboardId = x.keyboardId || '';
    const fontSize = x.fontSize || '1.3rem';
    const cellSize = x.cellSize || '1.5rem';
    let guid = 1;

    return (note: string, symbol: string, iRow?: number, iCol?: number): string => {
        let step = note[0];

        // let fontWeight = ['m', 'f', 'v', 's'].find((item) => item === step)
        //     ? 800
        //     : 400;
        let fontWeight = 400;
        let fontColor = 'black';
        let cellStyles = x.cellStylesFn(note, iRow, iCol);

        return `<div
            style="
            box-sizing: border-box;    
            margin: 0;
            padding: 0;
            display: inline-block;
            width: ${cellSize};
            height: ${cellSize};
            user-select: none;
            touch-action: none;
            font-size: ${fontSize};
            line-height: ${fontSize};
            font-weight: ${fontWeight};
            text-align: center;
            color: ${fontColor};
            ${cellStyles.borders}        
            background-color: ${cellStyles.bgColor};"                
            data-note-key="${note}"
            data-name="note-key-${note}"
            data-note-lat="${note}"
            data-keyboard-id="${keyboardId}"
            data-note-cell-guid="${guid++}"
            data-col="${iCol}"
            data-row="${iRow}"
            data-bg-color="${cellStyles.bgColor}"
        >${cellStyles.text}</div>`
            .replace(/\n/g, ' ')
            .replace(/ +/g, ' ');
    };
} // getKeyFn

export const bassGuitarKeys: string[][] = [
    ['bj', 'mu', 'lu', 'ry', 'sy', 'do', 'fo'],
    ['du', 'fu', 'ku', 'ny', 'zy', 'to', 'vo'],
    ['tu', 'vu', 'bu', 'my', 'ly', 'ro', 'so'],
    ['ru', 'su', 'dy', 'fy', 'ky', 'no', 'zo'],
    ['nu', 'zu', 'ty', 'vy', 'by', 'mo', 'lo'],
    ['mu', 'lu', 'ry', 'sy', 'do', 'fo', 'ko'],
    ['fu', 'ku', 'ny', 'zy', 'to', 'vo', 'bo'],
    ['vu', 'bu', 'my', 'ly', 'ro', 'so', 'da'],
    ['su', 'dy', 'fy', 'ky', 'no', 'zo', 'ta'],
    ['zu', 'ty', 'vy', 'by', 'mo', 'lo', 'ra'],
    ['lu', 'ry', 'sy', 'do', 'fo', 'ko', 'na'],
    ['ku', 'ny', 'zy', 'to', 'vo', 'bo', 'ma'],

    ['bu', 'my', 'ly', 'ro', 'so', 'da', 'fa'],
    ['dy', 'fy', 'ky', 'no', 'zo', 'ta', 'va'],
    ['ty', 'vy', 'by', 'mo', 'lo', 'ra', 'sa'],
    ['ry', 'sy', 'do', 'fo', 'ko', 'na', 'za'],
    ['ny', 'zy', 'to', 'vo', 'bo', 'ma', 'la'],
    ['my', 'ly', 'ro', 'so', 'da', 'fa', 'ka'],
    ['fy', 'ky', 'no', 'zo', 'ta', 'va', 'ba'],
    ['vy', 'by', 'mo', 'lo', 'ra', 'sa', 'de'],
    ['sy', 'do', 'fo', 'ko', 'na', 'za', 'te'],
    ['zy', 'to', 'vo', 'bo', 'ma', 'la', 're'],
    ['ly', 'ro', 'so', 'da', 'fa', 'ka', 'ne'],
    ['ky', 'no', 'zo', 'ta', 'va', 'ba', 'me'],

    ['by', 'mo', 'lo', 'ra', 'sa', 'de', 'fe'],
    ['do', 'fo', 'ko', 'na', 'za', 'te', 've'],
    ['to', 'vo', 'bo', 'ma', 'la', 're', 'se'],
    ['ro', 'so', 'da', 'fa', 'ka', 'ne', 'ze'],
    ['no', 'zo', 'ta', 'va', 'ba', 'me', 'le'],
    ['mo', 'lo', 'ra', 'sa', 'de', 'fe', 'ke'],
    ['fo', 'ko', 'na', 'za', 'te', 've', 'be'],
    ['vo', 'bo', 'ma', 'la', 're', 'se', 'di'],
    ['so', 'da', 'fa', 'ka', 'ne', 'ze', 'ti'],
    ['zo', 'ta', 'va', 'ba', 'me', 'le', 'ri'],
    ['lo', 'ra', 'sa', 'de', 'fe', 'ke', 'ni'],
    ['ko', 'na', 'za', 'te', 've', 'be', 'mi'],
];

export const guitarKeys: string[][] = [
    ['bj', 'mu', 'lu', 'ry', 'sy', 'by', 'mo'],
    ['du', 'fu', 'ku', 'ny', 'zy', 'do', 'fo'],
    ['tu', 'vu', 'bu', 'my', 'ly', 'to', 'vo'],
    ['ru', 'su', 'dy', 'fy', 'ky', 'ro', 'so'],
    ['nu', 'zu', 'ty', 'vy', 'by', 'no', 'zo'],
    ['mu', 'lu', 'ry', 'sy', 'do', 'mo', 'lo'],
    ['fu', 'ku', 'ny', 'zy', 'to', 'fo', 'ko'],
    ['vu', 'bu', 'my', 'ly', 'ro', 'vo', 'bo'],
    ['su', 'dy', 'fy', 'ky', 'no', 'so', 'da'],
    ['zu', 'ty', 'vy', 'by', 'mo', 'zo', 'ta'],
    ['lu', 'ry', 'sy', 'do', 'fo', 'lo', 'ra'],
    ['ku', 'ny', 'zy', 'to', 'vo', 'ko', 'na'],

    ['bu', 'my', 'ly', 'ro', 'so', 'bo', 'ma'],
    ['dy', 'fy', 'ky', 'no', 'zo', 'da', 'fa'],
    ['ty', 'vy', 'by', 'mo', 'lo', 'ta', 'va'],
    ['ry', 'sy', 'do', 'fo', 'ko', 'ra', 'sa'],
    ['ny', 'zy', 'to', 'vo', 'bo', 'na', 'za'],
    ['my', 'ly', 'ro', 'so', 'da', 'ma', 'la'],
    ['fy', 'ky', 'no', 'zo', 'ta', 'fa', 'ka'],
    ['vy', 'by', 'mo', 'lo', 'ra', 'va', 'ba'],
    ['sy', 'do', 'fo', 'ko', 'na', 'sa', 'de'],
    ['zy', 'to', 'vo', 'bo', 'ma', 'za', 'te'],
    ['ly', 'ro', 'so', 'da', 'fa', 'la', 're'],
    ['ky', 'no', 'zo', 'ta', 'va', 'ka', 'ne'],

    ['by', 'mo', 'lo', 'ra', 'sa', 'ba', 'me',],
    ['do', 'fo', 'ko', 'na', 'za', 'de', 'fe',],
    ['to', 'vo', 'bo', 'ma', 'la', 'te', 've',],
    ['ro', 'so', 'da', 'fa', 'ka', 're', 'se',],
    ['no', 'zo', 'ta', 'va', 'ba', 'ne', 'ze',],
    ['mo', 'lo', 'ra', 'sa', 'de', 'me', 'le',],
    ['fo', 'ko', 'na', 'za', 'te', 'fe', 'ke',],
    ['vo', 'bo', 'ma', 'la', 're', 've', 'be',],
    ['so', 'da', 'fa', 'ka', 'ne', 'se', 'di',],
    ['zo', 'ta', 'va', 'ba', 'me', 'ze', 'ti',],
    ['lo', 'ra', 'sa', 'de', 'fe', 'le', 'ri',],
    ['ko', 'na', 'za', 'te', 've', 'ke', 'ni',],
];


export const bassKeys: string[][] = [
    ['za', 'la', 'ka', 'ba'],
    ['ma', 'fa', 'va', 'sa'],
    ['da', 'ta', 'ra', 'na'],

    ['zo', 'lo', 'ko', 'bo'],
    ['mo', 'fo', 'vo', 'so'],
    ['do', 'to', 'ro', 'no'],

    ['zy', 'ly', 'ky', 'by'],
    ['my', 'fy', 'vy', 'sy'],
    ['dy', 'ty', 'ry', 'ny'],

    ['zu', 'lu', 'ku', 'bu'],
    ['mu', 'fu', 'vu', 'su'],
    ['du', 'tu', 'ru', 'nu'],
];


export const soloKeys: string[][] = [
    ['ze', 'le', 'ke', 'be'],
    ['me', 'fe', 've', 'se'],
    ['de', 'te', 're', 'ne'],

    ['za', 'la', 'ka', 'ba'],
    ['ma', 'fa', 'va', 'sa'],
    ['da', 'ta', 'ra', 'na'],

    ['zo', 'lo', 'ko', 'bo'],
    ['mo', 'fo', 'vo', 'so'],
    ['do', 'to', 'ro', 'no'],

    ['zy', 'ly', 'ky', 'by'],
    ['my', 'fy', 'vy', 'sy'],
    ['dy', 'ty', 'ry', 'ny'],
];

export function getVerticalKeyboard(
    keyboardId: number | string,
    type: ToneKeyboardType,
    keys: string[][],
): string {
    keyboardId = keyboardId || '';

    const isHarmonica = type === 'bassSolo34' || type === 'bass34' || type === 'solo34';
    const size = 1.9;


    const getKey = getKeyFn({
        keyboardId,
        cellSize: `${size}rem`,
        fontSize: '1.5rem',
        cellStylesFn: isHarmonica ? getHarmonicaCellStyles: getBassСellStyles,
    });

    let minWidth = '';

    if (keys[0] && keys[0].length) {
        minWidth = `min-width: ${size * keys[0].length + 0.1}rem;`;
    }

    let keyboard = `
        <div style="
            font-family: monospace;
            user-select: none;
            touch-action: none;
            ${minWidth}    
            padding: 0.5rem 0 0.5rem 0.5rem;"            
            data-name="keyboard-${keyboardId}"
        >%tpl%</div>
    `.trim();

    let tpl = '';
    keys.forEach((row, iRow) => {
        tpl = tpl + '<div>';

        row.forEach((note, iCol) => {
            tpl = tpl + getKey(note, note, iRow, iCol)
        })

        tpl = tpl + '</div>';
    });

    keyboard = keyboard.replace('%tpl%', tpl);

    return keyboard;
}

export function getPatternsList(patterns?: string[]): string {
    patterns = [
        `
            (A) о... наОмаЩу
            (A) луНаЩаСу
            (D) луЛуСуЛу
            (D) щаСаСаСа
            (E) суЙуЙаЙу
            (A) щаНаЩаСу
            (D) луЛуСуЛу
            (D) щаСаСаСаВу`,
        `
            (A) о... наОмаЩу
            (C) саМаЩаЛу
            (F) луСуЛуО
            (G) щаОЖуЛа
            (C) саЛаЛаМу
            (F) щаСуЛуМа
            (G) саЛуСуМа
            (A) саОзуМа
            (E) луОоО
            (E) оОлуЛуСуЛу
            (E) заОоО
            (E) оОлуЛуСуЛу
            (J) гаНуСуСуСа
            (D) луЛуСу
            (A) лу... наОмаЩу`,
        `
            (A) луНаЩаСу
            (D) луЛуСуЛу
            (D) щаОЛаО
            (F) саМуСаЛа
            (V) лаНаСуМу
            (A) щаЩуСаЩу
            (D) лаСаСаОЗу            
            `
    ];

    const topArr: string[][] = [];
    let result = '';

    patterns.forEach(block => {
        block = block.trim();
        const arr = block.split('\n').map(item => item.trim()).filter(item => item);
        topArr.push(arr);
    })

    topArr.forEach(block => {
        result = result + '<div data-type="pattern-block" style="margin-bottom: .5rem;">'
        block.forEach(item => {
            result = result + `<p data-type="pattern-item" style="margin: 0; padding: 0;">${item}</p>`
        })

        result = result + '</div>'
    });

    return  result;
}

//subscribeRelativeKeyboardEvents() {
    // const fixEl = dyName('relative-command-fix');
    // const zeroEl = dyName('relative-note-0');
    //
    // dyName('relative-command-fixQuickNote')?.addEventListener('pointerdown', (evt: MouseEvent) => {
    //     this.fixedRelativeNote = this.lastRelativeNote;
    //     this.fixedQuickNote = this.lastRelativeNote;
    //     fixEl.innerText = this.fixedQuickNote;
    //     const el = dyName('relative-command-setQuickNote');
    //     el.innerText = this.fixedQuickNote;
    //     zeroEl.innerText = this.fixedQuickNote;
    // });
    //
    // dyName('relative-command-setQuickNote')?.addEventListener('pointerdown', (evt: MouseEvent) => {
    //     this.fixedRelativeNote = this.fixedQuickNote;
    //     this.lastRelativeNote = this.fixedQuickNote;
    //     fixEl.innerText = this.fixedQuickNote;
    //     zeroEl.innerText = this.fixedQuickNote;
    // });
    //
    // dyName('relative-command-setDa')?.addEventListener('pointerdown', (evt: MouseEvent) => {
    //     this.fixedRelativeNote = defaultNote;
    //     this.lastRelativeNote = defaultNote;
    //     fixEl.innerText = defaultNote;
    //     zeroEl.innerText = defaultNote;
    // });
    //
    // fixEl?.addEventListener('pointerdown', (evt: MouseEvent) => {
    //     const keyboardId = fixEl?.dataset?.keyboardId;
    //
    //     ideService.synthesizer.playSound({
    //         keyOrNote: this.playingNote[keyboardId],
    //         id: keyboardId,
    //         onlyStop: true,
    //     });
    //
    //     if (!this.lastRelativeNote) {
    //         return;
    //     }
    //
    //     this.fixedRelativeNote = this.lastRelativeNote;
    //     this.playingNote[keyboardId] = this.lastRelativeNote;
    //     zeroEl.innerText = this.lastRelativeNote;
    //
    //     ideService.synthesizer.playSound({
    //         keyOrNote: this.lastRelativeNote,
    //         id: keyboardId,
    //     });
    //
    // });
    //
    // fixEl?.addEventListener('pointerup', (evt: MouseEvent) => {
    //     const keyboardId = fixEl?.dataset?.keyboardId;
    //
    //     ideService.synthesizer.playSound({
    //         keyOrNote: this.lastRelativeNote,
    //         id: keyboardId,
    //         onlyStop: true,
    //     });
    //
    //     this.playingNote[keyboardId] = undefined;
    // });
    //
    // getWithDataAttr('is-relative-note', this.pageEl)?.forEach((el: HTMLElement) => {
    //     if (!el?.dataset?.pitchOffset) {
    //         return;
    //     }
    //
    //     const keyboardId = el?.dataset?.keyboardId;
    //     const offset = parseInteger(el?.dataset?.pitchOffset, null);
    //
    //     if (offset === null) {
    //         return;
    //     }
    //
    //     //console.log(offset, keyboardId);
    //
    //     el.addEventListener('pointerdown', (evt: MouseEvent) => {
    //         const note = getNoteByOffset(this.fixedRelativeNote, offset);
    //
    //         ideService.synthesizer.playSound({
    //             keyOrNote: this.playingNote[keyboardId],
    //             id: keyboardId,
    //             onlyStop: true,
    //         });
    //         this.playingNote[keyboardId] = note;
    //         this.lastRelativeNote = note;
    //
    //         if (!note) {
    //             return;
    //         }
    //
    //         if (fixEl) {
    //             fixEl.innerText = note;
    //         }
    //
    //         ideService.synthesizer.playSound({
    //             keyOrNote: note,
    //             id: keyboardId,
    //         });
    //
    //         //this.setKeysColor();
    //     });
    //
    //     el.addEventListener('pointerup', (evt: MouseEvent) => {
    //         const note = getNoteByOffset(this.fixedRelativeNote, offset);
    //
    //         ideService.synthesizer.playSound({
    //             keyOrNote: note,
    //             id: keyboardId,
    //             onlyStop: true,
    //         });
    //
    //         this.playingNote[keyboardId] = undefined;
    //     });
    // });
    //
    // // const clearColor = () => {
    // //   getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
    // //     el.style.backgroundColor = 'white';
    // //   });
    // // };
    // //
    // // // очистка цвета
    // // let el = dyName('clear-keys-color', this.pageEl);
    // // if (el) {
    // //   el.addEventListener('click', () => clearColor());
    // // }
    // //
    // // el = dyName('select-random-key', this.pageEl);
    // // if (el) {
    // //   el.addEventListener('click', () => {
    // //     const val =
    // //         un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');
    // //
    // //     const key = dyName(
    // //         `note-key-${val}`,
    // //         dyName(`keyboard-solo`, this.pageEl)
    // //     );
    // //
    // //     if (key) {
    // //       clearColor();
    // //       key.style.backgroundColor = 'lightgray';
    // //     }
    // //   });
    // // }
//}

/*
> ИНТРО: (A) о... наОмаЩу <!-- cceh --> <br/>
> SOLO1: (A) луНаЩаСу  луЛуСуЛу щаСаСаСа суЙуЙаЙу <!-- ACFE DCBA DNEF EeEe--> <br/>
> SOLO2: (A) щаНаЩаСу луЛуСуЛу щаСаСаСа ву:      <!-- ACFE DCHA DTEF A --><br/>
> ИНТРО: (A) о... наОмаЩу <br/>
> SOLO3: (C) саМаЩаЛу луСуЛуО щаОЖуЛа саЛаЛаМу <!--ДМЛС ФМРР ССЛБ ДРМД--> <br/>
> SOLO4: (F) щаСуЛуМа саЛуСуМа саОзуМа <!-- ФМРВ СФМЗ ЛЛРВ --><br/>
> SOLO4: (E) луОоО оОлуЛуСуЛу заОоО оОлуЛуСуЛу <!--  ММММ ММрдбл ММММ ММрдбл --> <br/>
> SOLO4: (J) гаНуСуСуСа луЛуСу <!-- зфмнм рдб --><br/>
> ИНТРО: (A) лу... наОмаЩу <br/>
> SOLO5: (A) луНаЩаСу луЛуСуЛу <!-- ACFE DCHA --><br/>
> SOLO5: (D) щаОЛаО саМуСаЛа лаНаСуМу щаЩуСаЩу лаСаСаО зу <!-- DDEE FSDE VAJE AEFC DTEE A -->
*/
