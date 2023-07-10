import { ToneCtrl } from './tone-ctrl';

function getBgColor(note: string): string {
    note = note || '';

    let bgColor = 'white';

    if (note[0] === 'd') {
        bgColor = 'white';
    }

    if (note[0] === 't') {
        bgColor = 'lightgray';
    }

    if (note[0] === 'r') {
        bgColor = 'lightgray';
    }

    if (note[0] === 'n') {
        bgColor = 'white';
    }

    if (note[0] === 'm') {
        bgColor = 'lightgray';
    }

    if (note[0] === 'f') {
        bgColor = 'lightgray';
    }

    if (note[0] === 'v') {
        bgColor = 'lightgray';
    }

    if (note[0] === 's') {
        bgColor = 'lightgray';
    }

    if (note[0] === 'z') {
        bgColor = 'white';
    }

    if (note[0] === 'l') {
        bgColor = 'lightgray';
    }

    if (note[0] === 'k') {
        bgColor = 'lightgray';
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
    getContent(): string {
        let wrapper = `<div style="margin: .5rem; user-select: none; touch-action: none; display: flex; justify-content: space-between;">
            ${getVerticalHarmKeyboard('bass', bassKeys)}
            ${getVerticalHarmKeyboard('solo', soloKeys)}
        </div>`.trim();

        return wrapper;
    }
}
