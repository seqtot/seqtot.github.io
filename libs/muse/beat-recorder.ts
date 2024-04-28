import { leftKeys, rightKeys } from './freq';
//import {Editor} from 'codemirror';
import {MultiPlayer} from './multi-player';
import * as un from './utils';

type TEditor = any;

export function getCurrRowTextCm(cm: TEditor): string {
    const selections = cm.listSelections(); // [{acnchor, head}]
    const line = selections[0].head.line;

    return cm.getLine(line);
}

type TData = {
    code: string;
    note: string;
    down: number;
    up: number;
    next: number;
};
// syllable ˈsɪləbl слог, слово, звук

type TBpmInfo = {
    bpm: number;
    lastDownTime: number;
    pressCount: number;
    totalMs: number;
};

const emptyBpmInfo = (): TBpmInfo => {
    //console.log('getEmptyBpm');
    return {
        bpm: 0,
        lastDownTime: 0,
        pressCount: 0,
        totalMs: 0,
    };
};

const arrowCodes: string[] = ['ArrowUp' , 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

const DOWN = 1;
const UP = 0;

export class BeatRecorder {
    isRecording = false;
    pressCount = 0;
    startUpTime = 0;
    noteArr: string[] = [];
    syllArr: string[] = [];
    keyData: TData;
    keySequence: TData[] = [];
    beatInput: TEditor;
    textInput: TEditor | string;
    multiBuffer: TEditor;
    playSound: (x: {keyOrNote: string, onlyStop?: boolean}) => void;
    isNote: (str: string) => boolean;
    mode: string = 'Digit1';
    downedKeys: { [key: string]: boolean } = {};
    bpmInfo: TBpmInfo = emptyBpmInfo();
    multiPlayer: MultiPlayer;
    lastTickTime: number = 0;

    connect({
        beatInput,
        textInput,
        multiBuffer,
        playSound,
        isNote,
        multiPlayer,
    }: {
        beatInput: BeatRecorder['beatInput'],
        textInput: BeatRecorder['textInput'],
        multiBuffer: BeatRecorder['multiBuffer'],
        playSound?: (sound: string, onlyStop?: boolean) => void;
        isNote?: (str: string) => boolean;
        multiPlayer?: MultiPlayer;
    }) {
        this.disconnect();

        this.beatInput = beatInput;
        this.textInput = textInput;
        this.multiBuffer = multiBuffer;
        this.playSound = playSound || ((() => {}) as any);
        this.isNote = isNote || ((() => {}) as any);
        this.multiPlayer = multiPlayer || new MultiPlayer();

        // CodeMirror
        beatInput.on('keydown', this.keyDownHandlerCm);
        beatInput.on('keyup', this.keyUpHandlerCm);
    }

    disconnect() {
        this.downedKeys = {};

        if (this.beatInput) {
            // CodeMirror
            this.beatInput.off('keydown', this.keyDownHandlerCm);
            this.beatInput.off('keyup', this.keyUpHandlerCm);
        }

        this.clear(true);
        this.stopTick();

        this.multiBuffer = null;
        this.multiPlayer = null;
        this.textInput = null;
        this.playSound = null;
        this.isNote = null;
        this.lastTickTime = 0;
    }

    handleGetBpmKey(time: number, type: number) {
        const bpmInfo = this.bpmInfo;

        if (type === DOWN) {
            bpmInfo.pressCount++;

            if (bpmInfo.lastDownTime) {
                bpmInfo.totalMs = bpmInfo.totalMs + (time - bpmInfo.lastDownTime);
            }
            bpmInfo.lastDownTime = time;

            if (bpmInfo.totalMs) {
                const avg = this.bpmInfo.totalMs / (this.bpmInfo.pressCount - 1);
                bpmInfo.bpm = Math.round(60000 / avg);
            }

            if (this.multiPlayer) {
                this.multiPlayer.midiPlayer.getNotesMidi({
                    notes: 'cowbell',
                    instrCode: 'cowbell',
                    durationMs: 1000,
                });
            }

            //console.log('bpmInfo', bpmInfo);
        }
    }

    handleRecordKey(code: string, time: number, type: number) {
        //console.log('handleKey', code, type);

        // ПЕРВОЕ НАЖАТИЕ
        if (this.isRecording && !this.startUpTime) {
            this.startUpTime = this.lastTickTime || time;
        }

        if (!this.keyData && type === DOWN) {
            this.keyData = {
                code,
                down: time,
                note: this.noteArr[this.pressCount - 1],
                up: 0,
                next: 0,
            };

            return this.playSound({keyOrNote: this.keyData.note});
        }

        if (
            this.keyData &&
            ((type === UP && code === this.keyData.code) || type === DOWN)
        ) {
            if (!this.keyData.up) {
                this.keyData.up = time;
                this.playSound({keyOrNote: this.keyData.note, onlyStop: true});
            }

            if (type === DOWN) {
                this.keyData.next = time;
                this.keySequence.push(this.keyData);

                this.keyData = {
                    code,
                    down: time,
                    note: this.noteArr[this.pressCount - 1],
                    up: 0,
                    next: 0,
                };

                this.playSound({keyOrNote: this.keyData.note});
            }
        }
    }

    keyUpHandlerCm = (cm: any, e: KeyboardEvent) => {
        this.keyUpHandler(e);
    };

    keyDownHandlerCm = (cm: any, e: KeyboardEvent) => {
        this.keyDownHandler(e);
    };

    keyUpHandler = (evt: KeyboardEvent) => {
        //console.log('keyUpHandler', evt);

        evt.preventDefault();
        evt.stopPropagation();

        delete this.downedKeys[evt.code];

        if (leftKeys[evt.code]) {
           return;
        }

        if (evt.code === 'Digit1' || evt.code === 'Digit2') {
            this.mode = evt.code;
            return;
        }

        //console.log('evt.code', evt.code);
        //  Insert       Home        PageUp
        //  Delete       End         PageDawn
        //  PrintScreen  ScrollLock  Pause

        // ЗАПИСЬ BPM
        if (!this.isRecording && arrowCodes.includes(evt.code)) {
            this.handleGetBpmKey(Date.now(), UP);

            return;
        }

        // PAGE_DOWN
        // isRecording    | !isRecording
        // -              | запуск тикера
        // -              | запуск записи
        if (!this.isRecording && evt.code === 'PageDown' && this.bpmInfo.bpm) {
            this.clear(false);
            this.getText();
            this.isRecording = true;

            this.playTick(this.bpmInfo.bpm);

            return;
        }

        // END
        // isRecording      | !isRecording
        // остановка тикера | остановка тикера
        // сброс записи     |
        if (evt.code === 'End') {
            this.stopTick();

            if (this.isRecording) {
                this.clear(false);
                this.isRecording = false;
            }

            return;
        }

        // DELETE
        // isRecording    | !isRecording
        // остановка тикера | остановка тикера
        // сброс записи   | сброс bpm
        // очистка вывода | очистка вывода
        if (evt.code === 'Delete') {
            this.stopTick();

            if (this.isRecording) {
                this.clear(false);
            } else {
                this.bpmInfo = emptyBpmInfo();
            }

            if (this.multiBuffer) {
                this.multiBuffer.setValue('');
            }

            this.isRecording = false;

            return;
        }

        this.handleRecordKey(evt.code, Date.now(), UP);
    }

    stopTick() {
        if (this.multiPlayer) {
            this.multiPlayer.ticker.stop();
        }
    }

    playTick(bpm: number) {
        this.stopTick();

        if (this.multiPlayer) {
            this.multiPlayer.ticker.tickByBpm({
                bpm,
            }, () => {
                this.lastTickTime = Date.now();

                this.multiPlayer.midiPlayer.getNotesMidi({
                    notes: 'cowbell',
                    instrCode: 'cowbell',
                    durationMs: 1000,
                });
            });
        }
    }

     keyDownHandler = (evt: KeyboardEvent) => {
        //console.log('keyDownHandler', evt);

        if (evt.ctrlKey || evt.altKey) {
            return;
        }

        evt.preventDefault();
        evt.stopPropagation();

        if (evt.repeat || this.downedKeys[evt.code]) {
            return;
        } else {
            this.downedKeys[evt.code] = true;
        }

        if (
            evt.code === 'Digit1' ||
            evt.code === 'Digit2' ||
            evt.code === 'Space' ||
            leftKeys[evt.code]
        ) {
            return;
        }

        // ДАЛЕЕ ОБРАБАТЫВАЮТСЯ ТОЛЬКО СТРЕЛКИ
         if (!arrowCodes.includes(evt.code)) {
             return;
         }

        if (!this.isRecording) {
            this.handleGetBpmKey(Date.now(), DOWN);

            return;
        }

        this.pressCount++;
        this.handleRecordKey(evt.code, Date.now(), DOWN);

        if (this.pressCount > this.noteArr.length) {
            this.clear(false, true);
            this.isRecording = false;
            this.stopTick();
        }
     };

    getOut(multi: boolean = false): string {
        let textOut = '';
        let totalDuration = 0;
        const divider = multi ? '\n' : ' ';

        this.keySequence.forEach((item, i) => {
            let durationQ = item.up - item.down;
            let pause = item.next - item.up;
            durationQ = Math.round(durationQ / 10);
            pause = Math.round(pause / 10);
            const total = durationQ + pause;
            totalDuration += total;
            // sount:total:duration:pause
            textOut += `${item.note}-${total}-${durationQ}-${pause}${divider}`;
        });

        return `{${totalDuration}${divider}${textOut}}`.trim();
    }

    getOut2(multi: boolean = false): string {
        let bpm = 0;
        let qms = 0;

        if (this.bpmInfo.totalMs) {
            qms = this.bpmInfo.totalMs / (this.bpmInfo.pressCount - 1);
            bpm = Math.round(60000 / qms);
        }

        //console.log('this.bpmInfo', bpm, this.bpmInfo);

        let textOut = '';
        let totalDuration = 0;
        const divider = multi ? '\n' : ' ';
        //const qms = 60000 / params.bpm / un.NUM_100;

        this.keySequence.forEach((item, i) => {
            let durationQ = item.up - item.down;
            let pause = item.next - item.up;

            durationQ = Math.round((durationQ / qms) * un.NUM_100);
            pause = Math.round((pause / qms) * un.NUM_100);
            // pause = Math.round(pause / 10);

            // durationX = Math.round(duration / 10);
            // pause = Math.round(pause / 10);

            const total = durationQ + pause;
            totalDuration += total;
            // sount:total:duration:pause
            //textOut += `${item.note}-${total}-${duration}-${pause}${divider}`;
            textOut += `${item.note}-${total}-${durationQ}-${pause}${divider}`;
        });

        return `{b${bpm} d${totalDuration}${divider}${textOut}}`.trim();
    }

    getId(rows: string[], row: number): string | undefined {
        let id: string;
        //console.log('ROWS', rows);
        //console.log('ROW', row);
        for (let i = row; i > -1; i--) {
            const match = rows[i].match(/#\w+/);

            if (!match) {
                continue;
            }

            id = match[0];
            break;
        }

        //console.log(id);
        return id;
    }

    getTextFromInput(): string {
        if (typeof this.textInput === 'string') {
            return this.textInput as string;
        }

        const cm = this.textInput;
        return getCurrRowTextCm(cm);

        // const el = <HTMLTextAreaElement>this.textInput;
        //
        // let textRows = el.value.split('\n');
        // let temp = el.value.substr(0, el.selectionStart).split('\n');
        // let currentLineNumber = temp.length - 1;
        //
        // //console.log(
        // //   'ID',
        // //   this.getId(textRows.slice(0, currentLineNumber + 1), currentLineNumber)
        // // );
        //
        // this.getId(textRows.slice(0, currentLineNumber + 1), currentLineNumber);
        //
        // if (el.selectionStart !== el.selectionEnd) {
        //   return el.value.substr(el.selectionStart, el.selectionEnd).trim();
        // }
        //
        // return (textRows[currentLineNumber] || '').trim();
    }

    getText(): string[] {
        let text: string;

        if (typeof this.textInput === 'string') {
            text = (this.textInput || '').trim();
        } else {
            text = this.getTextFromInput();
        }

        text = text
            .replace(/\[(.*?)\]/g, ' ') // []
            .replace(/\((.*?)\)/g, ' ') // ()
            .replace(/{(.*?)}/g, ' ') // {}
            .replace(/\|/g, ' ') // |
            .replace(/\-/g, ' ') // -
            .replace(/!/g, '') // !
            .replace(/ +/g, ' '); // space+

        let arr = text.split('\n').map((item) => item.trim());
        arr = arr[0].split(' ');

        this.noteArr = arr;

        return arr;
    }

    clear(force: boolean, print: boolean = false) {
        if (print) {
            if (this.multiBuffer) {
                this.multiBuffer.setValue(this.getOut2(true));
            }
        }

        this.pressCount = 0;
        this.startUpTime = 0;
        this.noteArr = [];
        this.keyData = null;
        this.keySequence = [];

        if (force) {
            this.bpmInfo = emptyBpmInfo();
        }
    }
}


// Delete
// isRecording    | !isRecording
// сброс записи   | сброс bpm
//                |
// End            |
// isRecording    | !isRecording
// сброс записи   | остановка тикера
//                |
// PageDown       |
// isRecording    | !isRecording
// -              | запуск тикера

// 4   8     16    32
// 100 50 33 25 20 12.5
