import { ToneCtrl } from './tone-ctrl';

export type ToneKeyboardType = 'bass' | 'solo' | 'bassSolo';

const lightBgColor = '#ddd';
const mainBgColor = '#ccc';
const darkBgColor = '#bbb';


function getBgColor(note: string): string {
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

    return bgColor;
}

function getKeyFn(params: {
    id: string | number;
    cellSize?: string;
    fontSize?: string;
}): (note: string, symbol: string) => string {
    const id = params.id || '';
    const fontSize = params.fontSize || '1.3rem';
    const cellSize = params.cellSize || '1.5rem';

    return (note: string, symbol: string): string => {
        symbol = '&nbsp;';

        let step = note[0];

        let fontWeight = ['m', 'f', 'v', 's'].find((item) => item === step)
            ? 800
            : 400;
        let fontColor = 'black';
        let bgColor = getBgColor(note);

        console.log(note, bgColor);

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
        background-color: ${bgColor};"                
        data-note-key="${note}"
        data-name="note-key-${note}"
        data-note-lat="${note}"
        data-keyboard-id="${id}"
        data-bg-color="${bgColor}"

        >${symbol}</div>`
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



function getVerticalHarmKeyboard(id: number | string, keys: string[][]): string {
    id = id || '';

    const getKey = getKeyFn({ id, cellSize: '1.9rem', fontSize: '1.5rem' });

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
    keys.forEach(row => {
        tpl = tpl + '<div>';

        row.forEach(note => {
            tpl = tpl + getKey(note, note)
        })

        tpl = tpl + '</div>';
    });

    keyboard = keyboard.replace('%tpl%', tpl);

    return keyboard;
}

export class BassSoloCtrl extends ToneCtrl {
    lightBgColor = lightBgColor;
    mainBgColor = mainBgColor;
    darkBgColor = darkBgColor;

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

    getContent(type?: ToneKeyboardType): string {
        let wrapper = `<div style="margin: .5rem; user-select: none; touch-action: none; display: flex; justify-content: space-between; position: relative;">
            ${getVerticalHarmKeyboard('bass', bassKeys)}
            ${getVerticalHarmKeyboard('solo', soloKeys)}
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


/*

*/



/*
ABCDEFGHIGKLMNOPQRSTUVWXYZ
A CDEFGH             V

CsDtEiFvGjAoH

 */

// (A) о... наОмаЩу<br/>
// (A) луНаЩаСу<br/>
// (D) луЛуСуЛу<br/>
// (D) щаСаСаСа<br/>
// (E) суЙуЙаЙу<br/>
// (A) щаНаЩаСу<br/>
// (D) луЛуСуЛу<br/>
// (D) щаСаСаСаВу<br/>
// (A) о... наОмаЩу <br/>
// (C) саМаЩаЛу<br/>
// (F) луСуЛуО<br/>
// (G) щаОЖуЛа<br/>
// (C) саЛаЛаМу<br/>
// (F) щаСуЛуМа<br/>
// (G) саЛуСуМа<br/>
// (A) саОзуМа<br/>
// (E) луОоО<br/>
// (E) оОлуЛуСуЛу<br/>
// (E) заОоО<br/>
// (E) оОлуЛуСуЛу<br/>
// (J) гаНуСуСуСа<br/>
// (D) луЛуСу<br/>
// (A) лу... наОмаЩу<br/>
