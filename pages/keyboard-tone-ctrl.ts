import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import ideService from './ide/ide-service';
import * as un from '../libs/muse/utils/utils-note';
import {KeyData, Line, LineModel, NoteItem} from './line-model';
import { KeyboardCtrl, ToneKeyboardType, KeyboardPage } from './keyboard-ctrl';

const bassGuitarInstr = 374; // 388 - eMediator 375 - eFinger
const cleanGuitarInstr = 276;
const rockGuitarInstr = 327;
const organInstr = 182; // 162

const octaveColor = {
    u: 'black',
    y: 'darkblue',
    o: 'darkgreen',
    a: 'lightblue',
    e: 'lightgreen',
    i: 'yellow',
}

type GuitarSettings = {
    stringCount: number,
    offset: number
}

const instrName = {
    374: '$cBass*f',
    276: '$guit*ec',
    327: '$egit*drp',
    182: '$organ*r',
}

type ChessCell = {
    noteId: number,
    cellId: number,
    bgColor: string,
    char: string,
    startOffsetQ: number,
    totalOffsetQ: number,
    underline: boolean,

    octave?: string,
}

const lightBgColor = '#eee';
const mainBgColor = '#ccc';
const darkBgColor = '#aaa';

const mapNoteToChar = {
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

function getBassСellStyles(note: string, iRow: number, iCol: number): {
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

function getHarmonicaCellStyles(note: string): {
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

function getKeyFn(x: {
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

const bassGuitarKeys: string[][] = [
    ['bj', 'mu', 'lu', 'ry', 'sy', 'do'],
    ['du', 'fu', 'ku', 'ny', 'zy', 'to'],
    ['tu', 'vu', 'bu', 'my', 'ly', 'ro'],
    ['ru', 'su', 'dy', 'fy', 'ky', 'no'],
    ['nu', 'zu', 'ty', 'vy', 'by', 'mo'],
    ['mu', 'lu', 'ry', 'sy', 'do', 'fo'],
    ['fu', 'ku', 'ny', 'zy', 'to', 'vo'],
    ['vu', 'bu', 'my', 'ly', 'ro', 'so'],
    ['su', 'dy', 'fy', 'ky', 'no', 'zo'],
    ['zu', 'ty', 'vy', 'by', 'mo', 'lo'],
    ['lu', 'ry', 'sy', 'do', 'fo', 'ko'],
    ['ku', 'ny', 'zy', 'to', 'vo', 'bo'],

    ['bu', 'my', 'ly', 'ro', 'so', 'da'],
    ['dy', 'fy', 'ky', 'no', 'zo', 'ta'],
    ['ty', 'vy', 'by', 'mo', 'lo', 'ra'],
    ['ry', 'sy', 'do', 'fo', 'ko', 'na'],
    ['ny', 'zy', 'to', 'vo', 'bo', 'ma'],
    ['my', 'ly', 'ro', 'so', 'da', 'fa'],
    ['fy', 'ky', 'no', 'zo', 'ta', 'va'],
    ['vy', 'by', 'mo', 'lo', 'ra', 'sa'],
    ['sy', 'do', 'fo', 'ko', 'na', 'za'],
    ['zy', 'to', 'vo', 'bo', 'ma', 'la'],
    ['ly', 'ro', 'so', 'da', 'fa', 'ka'],
    ['ky', 'no', 'zo', 'ta', 'va', 'ba'],

    ['by', 'mo', 'lo', 'ra', 'sa', 'de'],
    ['do', 'fo', 'ko', 'na', 'za', 'te'],
    ['to', 'vo', 'bo', 'ma', 'la', 're'],
    ['ro', 'so', 'da', 'fa', 'ka', 'ne'],
    ['no', 'zo', 'ta', 'va', 'ba', 'me'],
    ['mo', 'lo', 'ra', 'sa', 'de', 'fe'],
    ['fo', 'ko', 'na', 'za', 'te', 've'],
    ['vo', 'bo', 'ma', 'la', 're', 'se'],
    ['so', 'da', 'fa', 'ka', 'ne', 'ze'],
    ['zo', 'ta', 'va', 'ba', 'me', 'le'],
    ['lo', 'ra', 'sa', 'de', 'fe', 'ke'],
    ['ko', 'na', 'za', 'te', 've', 'be'],
];

const guitarKeys: string[][] = [
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


const bassKeys: string[][] = [
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


const soloKeys: string[][] = [
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

function getVerticalKeyboard(
    keyboardId: number | string,
    type: ToneKeyboardType,
    keys: string[][],
): string {
    keyboardId = keyboardId || '';

    const isHarmonica = type === 'bassSoloHarmonica' || type === 'bassHarmonica' || type === 'soloHarmonica';
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

const DOWN = 1;
const UP = 0;

export class ToneCtrl extends KeyboardCtrl {
    instrCode = 162;
    playingNote: { [key: string]: string } = {};
    lastPlayingNote = '';
    offset = 0;

    lightBgColor = lightBgColor;
    mainBgColor = mainBgColor;
    darkBgColor = darkBgColor;

    isMemoMode = false;
    memoBuffer: string[] = [];
    memoBuffer2: string[] = [];
    isRecMode = false;



    constructor(
        public page: KeyboardPage,
        public type: ToneKeyboardType
    ) {
        super(page);

        if (type === 'bassGuitar') {
            this.instrCode = bassGuitarInstr; // bassGuitarInstr;
        }
        else if (type === 'guitar') {
            this.instrCode = rockGuitarInstr;
        }
        else {
            this.instrCode = organInstr;
        }
    }

    getPatternsList(patterns?: string[]): string {
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

    getHarmonicaContent(): string {
        let wrapper = `
            <div style="margin: .5rem; user-select: none; touch-action: none; display: flex; justify-content: space-between; position: relative;">
                ${getVerticalKeyboard('base', 'bassHarmonica', bassKeys)}
                ${getVerticalKeyboard('solo', 'soloHarmonica', soloKeys)}
                <div 
                    style="font-size: 2rem;
                    font-family: monospace;
                    width: 100%;
                    position: absolute;
                    top: 0;
                    pointer-events: none;
                    user-select: none;
                    touch-action: none;
                    padding-left: .5rem;"
                    data-type="text-under-board"
                >
                    ${this.getPatternsList()}
                </div>            
            </div>
            <div
                data-name="chess-wrapper"
                style="width: 90%; padding-left: 1rem;"
            ></div>
        `.trim();

        return wrapper;
    }

    getGuitarBoardContent(type?: 'guitar' | 'bassGuitar', settings?: GuitarSettings): string {
        settings = settings || this.getGuitarSettings();

        let stringCount = settings.stringCount;
        let firstString = 0;

        if (type === 'bassGuitar' && stringCount === 4) {
            firstString = 1;
        }

        if (type === 'guitar' && stringCount === 6) {
            firstString = 1;
        }

        let boardKeys = guitarKeys.slice(settings.offset, settings.offset + 13);

        boardKeys = boardKeys.map(row => {
           return row.slice(firstString, stringCount + firstString);
        });

        return getVerticalKeyboard('base', type, boardKeys);
    }

    getGuitarContent(type?: 'guitar' | 'bassGuitar', settings?: GuitarSettings): string {
        settings = settings || this.getGuitarSettings();
        type = type || <any>this.type;

        const actionStyle = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.2rem; user-select: none; touch-action: none;`;
        let stringCountCommands = '';

        if (type === 'guitar') {
            stringCountCommands = `
                <div>
                    <span data-action-set-string-count="6" style="${actionStyle}">6s</span>
                    <span data-action-set-string-count="7" style="${actionStyle}">7s</span>                                    
                </div>
            `.trim();
        }

        if (type === 'bassGuitar') {
            stringCountCommands = `
                <div>
                    <span data-action-set-string-count="4" style="${actionStyle}">4s</span>
                    <span data-action-set-string-count="5" style="${actionStyle}">5s</span>                    
                    <span data-action-set-string-count="6" style="${actionStyle}">6s</span>                                        
                </div>
            `.trim();
        }

        let wrapper = `
            <div style="
                display: flex;
                margin: .5rem;
                justify-content: space-between;
                position: relative;"
            >
                <div 
                    data-guitar-board-wrapper
                    style="user-select: none; touch-action: none;"
                >
                    ${this.getGuitarBoardContent(type, settings)}                
                </div>

                <div style="padding-left: .5rem; padding-top: .5rem;">
                    ${stringCountCommands}<br/>
                    <span data-action-tone="set-offset-up" style="${actionStyle}">up</span>&emsp;
                    <span data-action-tone="set-offset-down" style="${actionStyle}">down</span>&emsp;
                    <span data-action-tone="fix-board-cell" style="${actionStyle}">fix</span>&emsp;
                    <span data-action-tone="unfix-board-cell" style="${actionStyle}">unfix</span><br/><br/>                    
                    
                    <span data-action-tone="memo-mode" style="${actionStyle}">memo</span><br/><br/>
                    <span data-action-tone="memo-clear" style="${actionStyle}">del mem</span><br/><br/>
                    <span
                        style="${actionStyle}"
                        data-action-type="tick"
                    >1:4</span>
                    &nbsp;&nbsp;
                    <span
                        style="${actionStyle}"
                        data-action-type="stop"
                    >stop</span><br/><br/>
                    <span data-action-tone="record-mode" style="${actionStyle}">rec</span><br/><br/>
                    
                </div>
            </div>

            <div 
                data-action-tone="record-beat-wrapper"
                style="margin: .5rem; display: none; width: 90%;"
            >
                <div
                    data-action-tone="record-beat" 
                    style="${actionStyle} display: inline-block; height: 5rem; width: 45%; background-color: whitesmoke;  margin-bottom: .5rem;"
                >beat me</div>
                <div
                    data-action-tone="record-beat" 
                    style="${actionStyle} display: inline-block; height: 5rem; width: 45%; background-color: whitesmoke; margin-bottom: .5rem;"
                >beat me</div>
            </div>
            
            <div style="margin: .5rem;">
                ${this.page.getMetronomeContent()}            
            </div>
                        
            <br/>
                ${this.getTopCommandPanel()}
            <br/>
                        
            <div
                data-name="chess-wrapper"
                style="width: 90%; padding-left: 1rem;"
            ></div>
            
            <br/>           
           
            <div style="margin: .5rem;">            
                <b>ДО</b> - С<br/>
                до диез - С# или <b>t</b> <br/>
                ре бемоль - Db или <b>t</b> <br/>                
                <b>РЕ</b> - D <br/>                                
                ре диез - D# или <b>n</b> <br/>
                ми бемоль - Eb или <b>n</b> <br/>
                <b>МИ</b> - E <br/>
                <b>ФА</b> - F <br/>                            
                фа диез - F# или <b>v</b> <br/>
                соль бемоль - Gb или <b>v</b> <br/>
                <b>СОЛЬ</b> - G <br/>
                соль диез - G# или <b>z</b> <br/>
                ля бемоль - Ab или <b>z</b> <br/>
                <b>ЛЯ</b> - A <br/>
                ля диез - A# или <b>k</b> <br/>
                си бемоль - Hb или B или <b>k</b> <br/>
                <b>СИ</b> - H или B <br/>
            </div>
            
        `.trim();

        return wrapper;
    }

    getContent(type?: ToneKeyboardType): string {
        if (type === 'bassSoloHarmonica') {
            return this.getHarmonicaContent();
        }
        else if(type === 'bassGuitar') {
            return this.getGuitarContent('bassGuitar');
        }
        else if(type === 'guitar') {
            return this.getGuitarContent('guitar');
        }
    }

    setKeysColor() {
        let baseNote = this.playingNote.base || '';
        let baseChar = baseNote[0];

        getWithDataAttr('note-key', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.style.backgroundColor = el.dataset['bgColor'] || 'white';

            if (this.type === 'bassSoloHarmonica') {
                el.style.boxShadow = null;
            }

            const data = (el?.dataset || {}) as {
                keyboardId: string;
                noteLat: string;
                row: string;
            };
            const note = data.noteLat || '';

            if (data.keyboardId === 'solo') {
                if (note[0] === baseChar) {
                    el.style.boxShadow = 'inset 0px 0px 3px black';
                }
                if (note === baseNote) {
                    el.style.boxShadow = 'inset 0px 0px 3px blue';
                }
            }

            // GUITAR
            if (this.type === 'bassGuitar' || this.type === 'guitar') {
                baseChar = this.lastPlayingNote[0];

                if (data.row !== '0' && data.row !== '12') {
                    el.innerHTML = '&nbsp;';
                } else {
                    el.style.color = 'black';
                }

                if (note[0] === baseChar) {
                    const octaveChar = (el.dataset['noteLat'] || '')[1];
                    el.innerText = mapNoteToChar[baseChar];
                    el.style.color = octaveColor[octaveChar] || 'dimgrey';
                }
            }
        });
    }

    toggleRecord() {
        const pageEl = this.page.pageEl;

        this.isRecMode = !this.isRecMode;

        if (this.isRecMode) {
            this.memoBuffer2 = [...this.memoBuffer];

            getWithDataAttrValue('action-tone', 'record-mode',pageEl)?.forEach((el: HTMLElement) => {
                el.style.fontWeight = '700';
            });
            getWithDataAttrValue('action-tone', 'record-beat-wrapper',pageEl)?.forEach((el: HTMLElement) => {
                el.style.display = 'block';
            });
        } else {
            this.clearRecordData();

            getWithDataAttrValue('action-tone', 'record-mode',pageEl)?.forEach((el: HTMLElement) => {
                el.style.fontWeight = '400';
            });
            getWithDataAttrValue('action-tone', 'record-beat-wrapper',pageEl)?.forEach((el: HTMLElement) => {
                el.style.display = 'none';
            });
        }
    }


    getOut(bpm: number, seq: ToneCtrl['keySequence'] ) {
        const rows = LineModel.GetToneLineModelFromRecord(bpm, this.tickStartMs, seq);
        this.liner.setData(rows);
        this.printChess(rows);
    }

    tickStartMs: number = 0;
    keyData: KeyData | null = null;
    keySequence: KeyData[] = [];

    clearRecordData() {
        this.keyData = null;
        this.keySequence = [];
    }

    handleKeyRecord(time: number, type: 0 | 1) {
        const instrCode = this.instrCode;

        if (!this.isRecMode) {
            return;
        }

        if (!this.memoBuffer2.length && this.keyData && !this.keyData.up) {
            this.keyData.up = time;

            ideService.synthesizer.playSound({
                keyOrNote: this.keyData.note,
                id: 'record',
                onlyStop: true,
                instrCode,
            });


            return;
        }

        if (!this.memoBuffer2.length && !this.keyData.next) {
            this.keyData.next = time;
            this.keySequence.push(this.keyData);
            this.keyData = null;

            this.getOut(this.page.bpmValue, this.keySequence);
            this.page.stopTicker();
            this.toggleRecord();

            return;
        }

        // ПЕРВОЕ НАЖАТИЕ
        if (!this.keyData && type === DOWN && this.memoBuffer2.length) {
            const note = this.memoBuffer2.shift();

            this.keyData = {
                note,
                char: note[0],
                code: note,
                down: time,
                up: 0,
                next: 0,
                //quarterTime: this.tickInfo.quarterTime,
                //quarterNio: this.tickInfo.quarterNio,
                quarterTime: 0,
                quarterNio: 0,
                color: 'gray',
                color2: 'lightgray',
            };

            ideService.synthesizer.playSound({
                keyOrNote: note,
                id: 'record',
                instrCode,
            });

            return;
        }

        if (this.keyData) {
            if (type === UP) {
                this.keyData.up = time;
                ideService.synthesizer.playSound({
                    keyOrNote: this.keyData.note,
                    id: 'record',
                    onlyStop: true,
                });
            }

            if (type === DOWN) {
                this.keyData.next = time;
                this.keySequence.push(this.keyData);
                const note = this.memoBuffer2.shift();

                this.keyData = {
                    note,
                    char: note[0],
                    code: note,
                    down: time,
                    up: 0,
                    next: 0,
                    quarterTime: 0,
                    quarterNio: 0,
                    color: 'gray',
                    color2: 'lightgray',
                };

                ideService.synthesizer.playSound({
                    keyOrNote: note,
                    id: 'record',
                    instrCode,
                });
            }
        }
    }

    pushNoteToMemo(note: string | null) {
        if (note) {
            this.memoBuffer.push(note);
        } else {
            this.memoBuffer = [];
        }

        getWithDataAttrValue('action-tone', 'memo-clear', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.style.fontWeight = this.memoBuffer.length ? '700' : '400';
        });
    }


    toggleMemo() {
        this.isMemoMode = !this.isMemoMode;

        getWithDataAttrValue('action-tone', 'memo-mode', this.page.pageEl)?.forEach((el: HTMLElement) => {
            if (this.isMemoMode) {
                el.style.fontWeight = '700';
            } else {
                el.style.fontWeight = '400';
            }
        });
    }

    subscribeEditCommands() {
        const pageEl = this.page.pageEl;

        getWithDataAttrValue('edit-action', 'delete-cell', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.deleteCell(el));
        });

        getWithDataAttr('action-drum-note', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.drumNoteClick(el));
        });

        getWithDataAttrValue('edit-row-action', 'add-row', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addRow());
        });

        getWithDataAttrValue('edit-row-action', 'insert-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.insertRow());
        });

        getWithDataAttrValue('edit-row-action', 'delete-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.deleteRow());
        });
    }

    moveCell(id: number, value: number) {
        const result = this.liner.moveCell(id, value);

        if (result) {
            this.printChess(this.liner.rows);
            //this.highlightCellByRowCol(`${result.row}-${result.col}`);
            this.activeCell.id = id;
        }
    }

    getGuitarSettings(): GuitarSettings {
        if (!localStorage.getItem(`[settings]${this.type}`)) {
            let offset = 0;

            if (this.type === 'guitar') {
                offset = 12;
            }

            this.setGuitarSettings({
                stringCount: 6,
                offset,
            });
        }

        return JSON.parse(localStorage.getItem(`[settings]${this.type}`));
    }

    setGuitarSettings(settings: GuitarSettings) {
        localStorage.setItem(`[settings]${this.type}`, JSON.stringify(settings));
    }

    fixBoardCell(resetFix = false) {
        if (resetFix) {
            getWithDataAttrValue('fix-note-cell', 'true', this.page.pageEl).forEach(el => {
                el.style.boxShadow = null;
                el.dataset['fixCell'] = '';
            });

            return;
        }

        getWithDataAttrValue('note-cell-guid', this.lastNoteCellGuid, this.page.pageEl).forEach(el => {
            if (el.dataset['fixNoteCell']) {
                el.style.boxShadow = null;
                el.dataset['fixNoteCell'] = '';
            } else {
                el.dataset['fixNoteCell'] = 'true';
                el.style.boxShadow = 'inset 0px 0px 6px yellow';
            }
        });
    }

    setGuitarOffset(step: number) {
        console.log('setGuitarOffset', step);

        let settings = this.getGuitarSettings();
        const offset = settings.offset + step;

        if (offset < 0) {
            return;
        }

        settings.offset = offset;
        this.setGuitarSettings(settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = null;
        });

        const boardContent = this.getGuitarBoardContent(<any>this.type, settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = boardContent;
        });

        this.subscribeBoardEvents();
    }

    setStringCount(stringCount: number | string) {
        stringCount = un.parseInteger(stringCount, 6);
        let settings = this.getGuitarSettings();
        settings.stringCount = stringCount;
        this.setGuitarSettings(settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = null;
        });

        const boardContent = this.getGuitarBoardContent(<any>this.type, settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = boardContent;
        });

        this.subscribeBoardEvents();
    }

    lastNoteCellGuid = '';

    subscribeBoardEvents() {
        const pageEl = this.page.pageEl;

        getWithDataAttr('note-key', pageEl)?.forEach((el: HTMLElement) => {
            const keyboardId = el.dataset.keyboardId;
            const keyOrNote = el.dataset.noteLat || '';
            let keyId = keyboardId;

            if (this.type === 'bassGuitar' || this.type === 'guitar') {
                keyId = el.dataset.noteCellGuid;
            }

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                if (this.isRecMode) {
                    const time = Date.now();
                    this.handleKeyRecord(time, DOWN);

                    return;
                }

                const instrCode = this.instrCode;

                ideService.synthesizer.playSound({
                    keyOrNote: this.playingNote[keyId],
                    id: keyId,
                    onlyStop: true,
                });

                this.playingNote[keyId] = keyOrNote;
                this.lastPlayingNote = keyOrNote;
                this.lastNoteCellGuid = el?.dataset?.noteCellGuid || '';

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyId,
                    instrCode,
                });

                this.setKeysColor();

                if (this.isMemoMode) {
                    this.pushNoteToMemo(keyOrNote);
                }
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                if (this.isRecMode) {
                    const time = Date.now();
                    this.handleKeyRecord(time, UP);

                    return;
                }

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyId,
                    onlyStop: true,
                });

                this.playingNote[keyId] = undefined;
            });
        });
    }

    subscribeCommonCommands() {
        const pageEl = this.page.pageEl;

        getWithDataAttr('action-set-string-count', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.setStringCount(el.dataset['actionSetStringCount']));
        });

        getWithDataAttrValue('action-tone', 'set-offset-up', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.setGuitarOffset(1));
        });

        getWithDataAttrValue('action-tone', 'set-offset-down', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.setGuitarOffset(-1));
        });

        getWithDataAttrValue('action-tone', 'fix-board-cell', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.fixBoardCell());
        });

        getWithDataAttrValue('action-tone', 'unfix-board-cell', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.fixBoardCell(true));
        });

        getWithDataAttrValue('page-action', 'play-one', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playOne());
        });

        getWithDataAttrValue('action-tone', 'memo-mode', pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.toggleMemo());
        });

        getWithDataAttrValue('action-tone', 'memo-clear',pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.pushNoteToMemo(null));
        });

        // getWithDataAttrValue('action-tone', 'record-stop',pageEl)?.forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => this.toggleRecord())
        // });

        getWithDataAttrValue('action-tone', 'record-beat',pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                const time = Date.now();
                this.handleKeyRecord(time, DOWN);
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                const time = Date.now();
                return this.handleKeyRecord(time, UP);
            });
        });

        getWithDataAttrValue('action-tone', 'record-mode',pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.toggleRecord())
        });

        const clearColor = () => {
            getWithDataAttr('note-key', pageEl)?.forEach((el: HTMLElement) => {
                el.style.backgroundColor = el.dataset['bgColor'] || 'white';
            });
        };

        // очистка цвета
        let el = dyName('clear-keys-color', pageEl);
        if (el) {
            el.addEventListener('click', () => clearColor());
        }

        el = dyName('select-random-key', pageEl);
        if (el) {
            el.addEventListener('click', () => {
                const val =
                    un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');

                const key = dyName(
                    `note-key-${val}`,
                    dyName(`keyboard-solo`, pageEl)
                );

                if (key) {
                    clearColor();
                    key.style.backgroundColor = 'gray';
                }
            });
        }

    }

    subscribeEvents() {
        this.subscribeCommonCommands();
        this.subscribeMoveCommands();
        this.subscribeEditCommands();
        this.subscribeBoardEvents();
    }

    subscribeRelativeKeyboardEvents() {
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
    }

    getChessCellFor(arr: NoteItem[]): ChessCell {
        const result: ChessCell = {
            noteId: 0,
            cellId: 0,
            char: '',
            //color: 'white',
            bgColor: 'lightgray',
            underline: false,
            startOffsetQ: 0,
            totalOffsetQ: 0,
        }

        if (!arr[0]) {
            return result;
        }

        const char = arr[0].note[0];
        const octave = arr[0].note[1];

        const octaveColor = {
            u: 'black',
            y: 'darkblue',
            o: 'darkgreen',
            a: 'lightblue',
            e: 'lightgreen',
            i: 'yellow',
        }

        result.cellId = arr[0].id;
        result.char = mapNoteToChar[char] || '?';
        result.bgColor = octaveColor[octave] || 'gray';

        return result;
    }

    printChess(rows: Line[]) {
        const rem = 'rem';
        const getMask = (count: number): ChessCell[] => {
            const arr = Array(count).fill(null);
            return arr.map(() => ({
                bgColor: 'whitesmoke',
                noteId: 0,
                cellId: 0,
                char: '',
                startOffsetQ: 0,
                totalOffsetQ: 0,
                underline: false,
            }));
        }

        let totalOut = '';
        let height = 1.26;
        let padding = .07;
        let rowHeight = 1.4;

        rows.forEach((row, iRow) => {
            const nextRow = rows[iRow + 1];
            const offsets = this.liner.getOffsetsByRow(row);
            const hasLine = (!!nextRow && nextRow.blockOffsetQ !== row.blockOffsetQ);
            const rowBorderBottom = hasLine ? '1px solid gray;' : 'none;';

            totalOut = totalOut +
                `<div style="
                    box-sizing: border-box;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    font-size: 1.2rem;
                    line-height: .9rem;
                    color: white;                    
                    user-select: none;
                    padding-top: .07rem;
                    height: 1.4rem;
                    border-bottom: ${rowBorderBottom};
                ">`;

            const cellSizeQ = 10;
            const cols = getMask(row.durQ / row.cellSizeQ);
            cols.forEach((col, i) => {
                col.startOffsetQ = row.startOffsetQ + (cellSizeQ * i);
                col.totalOffsetQ = col.startOffsetQ + row.blockOffsetQ;
            });

            for (let offset of offsets) {
                const iCell = (offset - row.startOffsetQ) / cellSizeQ;
                const notes = this.liner.getNotesListByOffset(row, offset);

                const col = cols[iCell];
                const textAndColor = this.getChessCellFor(notes);

                col.cellId = textAndColor.cellId;
                col.noteId = textAndColor.noteId;
                col.bgColor = textAndColor.bgColor;
                col.char = textAndColor.char;
                col.underline = textAndColor.underline;
            }

            cols.forEach((col, iCol) => {
                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
                        data-chess-cell-col="${iCol}"
                        data-chess-cell-row-col="${iRow}-${iCol}"
                        data-chess-cell-id=""
                        data-chess-total-offset="${col.totalOffsetQ}"                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            z-index: 0;
                            position: absolute;
                            width: ${height}${rem};
                            height: ${height}${rem};
                            background-color: ${col.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            left: ${iCol * height}${rem};
                        "
                    ></span>`.trim();
            });

            cols.forEach((cell, iCell) => {
                if (!cell.cellId) return;

                const textDecoration = cell.underline ? 'underline' : 'none';
                const rem = 'rem';

                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
                        data-chess-cell-col="${iCell}"
                        data-chess-cell-row-col="${iRow}-${iCell}"                                                
                        data-chess-cell-id="${cell.cellId}"
                        data-chess-total-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-row-col="${iRow}-${iCell}"                                                                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            position: absolute;
                            width: ${height}${rem};
                            height: ${height}${rem};
                            background-color: ${cell.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            font-weight: 700;
                            z-index: 0;
                            text-decoration: ${textDecoration};
                            left: ${iCell * height}${rem};
                        "
                    >${cell.char}</span>`.trim();
            });

            totalOut = totalOut + '</div>';
        });

        const el = dyName('chess-wrapper', this.page.pageEl);
        if (el) {
            el.innerHTML = totalOut;
            el.style.height = `${rows.length * rowHeight}rem`;
        }

        this.subscribeChess();
    }

    // jjkl
    playOne() {
        this.page.stop();

        const notes = LineModel.GetToneNotes({
            blockName: 'temp',
            instr: instrName[this.instrCode],
            chnl: this.type === 'bassGuitar' ? '$bass' : '$guit',
            rows: this.liner.rows,
        });

        console.log('notes', notes);

        if (!notes) return;

        let blocks = [
            '<out r100>',
            'temp',
            notes
        ].join('\n');

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks,
            bpm: this.page.bpmValue,
        });
    }
}


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

// keyboard-base
