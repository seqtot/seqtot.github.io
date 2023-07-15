import { ToneCtrl } from './tone-ctrl';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import ideService from './ide/ide-service';
import * as un from '../libs/muse/utils/utils-note';
import {Synthesizer} from '../libs/muse/synthesizer';
import {MultiPlayer} from '../libs/muse/multi-player';
import {ComponentContext} from 'framework7/modules/component/component';
import {getNoteByOffset, parseInteger} from '../libs/muse/utils/utils-note';

export type ToneKeyboardType = 'bass' | 'solo' | 'bassSolo';

interface Page {
    bpmValue: number;
    pageEl: HTMLElement;
    getMetronomeContent(): string;
    stopTicker();
    stop();
    //getOut(bpm: number, seq: DrumCtrl['keySequence'] );
    synthesizer: Synthesizer;
    multiPlayer: MultiPlayer;
    context: ComponentContext,
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
    id: string | number;
    cellSize?: string;
    fontSize?: string;
    cellStylesFn: (note: string, iRow?: number, iCell?: number) => {bgColor: string, borders: string, text: string}
}): (note: string, symbol: string, iRow?: number, iCol?: number) => string {
    const id = x.id || '';
    const fontSize = x.fontSize || '1.3rem';
    const cellSize = x.cellSize || '1.5rem';

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
            data-keyboard-id="${id}"
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
    id: number | string,
    type: ToneKeyboardType,
    keys: string[][],
): string {
    id = id || '';

    const getKey = getKeyFn({
        id, cellSize: '1.9rem',
        fontSize: '1.5rem',
        cellStylesFn: type === 'bassSolo' ? getHarmonicaCellStyles: getBassСellStyles,
    });

    let keyboard = `
        <div style="
            font-family: monospace;
            user-select: none;
            touch-action: none;    
            padding: 0.5rem 0 0.5rem 0.5rem;"
            data-name="keyboard-${id}"
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

export class BassSoloCtrl extends ToneCtrl {
    playingNote: { [key: string]: string } = {};

    lightBgColor = lightBgColor;
    mainBgColor = mainBgColor;
    darkBgColor = darkBgColor;

    constructor(
        public page: Page,
        public type: ToneKeyboardType)
    {
        super();
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
        let wrapper = `<div style="margin: .5rem; user-select: none; touch-action: none; display: flex; justify-content: space-between; position: relative;">
            ${getVerticalKeyboard('bass', 'bassSolo', bassKeys)}
            ${getVerticalKeyboard('solo', 'bassSolo', soloKeys)}
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
        </div>`.trim();

        return wrapper;
    }

    getBassContent(): string {
        const actionStyle = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;

        let wrapper = `
            <div style="margin: .5rem; user-select: none; touch-action: none; display: flex; justify-content: space-between; position: relative;">
                ${getVerticalKeyboard('bass', 'bass', bassGuitarKeys)}
                <div>
                    <span style="${actionStyle}">memo</span><br/>
                    <span style="${actionStyle}">clear</span><br/>
                    <span style="${actionStyle}">rec</span><br/>
                    <span style="${actionStyle}">stop</span><br/>
                </div>
            </div>
            <div style="margin: .5rem;">            
                <b>ДО</b> - С</br>
                до диез - С# или <b>t</b> </br>
                ре бемоль - Db или <b>t</b> </br>                
                <b>РЕ</b> - D </br>                                
                ре диез - D# или <b>n</b> </br>
                ми бемоль - Eb или <b>n</b> </br>
                <b>МИ</b> - E </br>
                <b>ФА</b> - F </br>                            
                фа диез - F# или <b>v</b> </br>
                соль бемоль - Gb или <b>v</b> </br>
                <b>СОЛЬ</b> - G </br>
                соль диез - G# или <b>z</b> </br>
                ля бемоль - Ab или <b>z</b> </br>
                <b>ЛЯ</b> - A </br>
                ля диез - A# или <b>k</b> </br>
                си бемоль - Hb или B или <b>k</b> </br>
                <b>СИ</b> - H или B </br>                
            </div>
        `.trim();

        return wrapper;
    }

    getContent(type?: ToneKeyboardType): string {
        if (type === 'bassSolo') {
            return this.getHarmonicaContent();
        }
        else if(type === 'bass') {
            return this.getBassContent();
        }
    }

    setKeysColor() {
        const bassNote = this.playingNote.bass;
        const bassChar = (this.playingNote.bass || '')[0];
        const soloChar = (this.playingNote.solo || '')[0];

        getWithDataAttr('note-key', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.style.backgroundColor = el.dataset['bgColor'] || 'white';

            const data = (el?.dataset || {}) as {
                keyboardId: string;
                noteLat: string;
                row: string;
            };
            const note = data.noteLat || '';

            if (data.keyboardId === 'solo') {
                if (note[0] === bassChar) {
                    el.style.backgroundColor = this.lightBgColor;
                }
                if (note === bassNote) {
                    el.style.backgroundColor = this.darkBgColor;
                }
            }

            // BASS
            if (data.keyboardId === 'bass' && this.type === 'bass') {
                if (data.row !== '0' && data.row !== '12') {
                    el.innerHTML = '&nbsp;';
                }

                if (note[0] === bassChar && data.row !== '0' && data.row !== '12') {
                    //console.log(el.dataset);
                    //el.style.backgroundColor = this.lightBgColor;
                    el.innerText = mapNoteToChar[bassChar];
                    el.style.color = 'dimgrey';
                }
            }
        });
    }

    subscribeEvents() {
        const pageEl = this.page.pageEl;

        getWithDataAttr('note-key', pageEl)?.forEach((el: HTMLElement) => {
            const keyboardId = el?.dataset?.keyboardId;
            const keyOrNote = el?.dataset?.noteLat || '';

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                ideService.synthesizer.playSound({
                    keyOrNote: this.playingNote[keyboardId],
                    id: keyboardId,
                    onlyStop: true,
                });

                this.playingNote[keyboardId] = keyOrNote;

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyboardId,
                    // instrCode: 366,
                });

                this.setKeysColor();
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyboardId,
                    onlyStop: true,
                });

                this.playingNote[keyboardId] = undefined;
            });
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
