import {Props} from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import {Range} from 'framework7/framework7-types';
import { Dom7Array } from 'dom7';

import {byId, dyName, getWithDataAttr, getWithDataAttrValue} from '../src/utils';
import { Sound } from '../libs/muse/sound';
import { MultiPlayer } from '../libs/muse/multi-player';
import { Synthesizer } from '../libs/muse/synthesizer';
import * as un from '../libs/muse/utils/utils-note';
import { toneAndDrumPlayerSettings } from '../libs/muse/keyboards';
import keyboardSet from './page_keyboard-utils';
import { getNoteByOffset, parseInteger } from '../libs/muse/utils/utils-note';
import { standardTicks as ticks } from './ticks';
import {DrumCtrl} from './drum-ctrl';
import {Ticker} from '../libs/muse/ticker';

const multiPlayer = new MultiPlayer();
const metronome = new MultiPlayer();
const synthesizer = new Synthesizer();
const ticker = new Ticker(Sound.ctx);
synthesizer.connect({ ctx: Sound.ctx });
synthesizer.setSettings(toneAndDrumPlayerSettings);

const DOWN = 1;
const UP = 0;

type ViewType = 'bassSolo' | 'drums';

const ns = {
    setBmpAction: 'set-bmp-action',
    setNote: 'set-note',
};

const defaultNote = 'da';

export class BassSoloCtrl {

}


interface Page {
    getMetronomeContent(): string;
}

export class KeyboardPage {
    view: ViewType = 'drums'; // 'bassSolo';
    ctrl: BassSoloCtrl = new BassSoloCtrl();
    drumCtrl: DrumCtrl;

    bpmValue = 100;
    playingTick = '';
    bpmRange: Range.Range;
    playingNote: { [key: string]: string } = {};

    fixedRelativeNote = defaultNote;
    lastRelativeNote = defaultNote;
    fixedQuickNote = defaultNote;
    tickInfo = {
        quarterTime: 0,
        quarterNio: 0,
    }
    tickNode: AudioBufferSourceNode | null = null;
    tickStartMs = 0;

    get pageId(): string {
        return this.props.id;
    }

    get pageEl(): HTMLElement {
        return this.context.$el.value[0] as HTMLElement;
    }

    get el$(): Dom7Array {
        return this.context.$el.value;
    }

    get setInfo(): {
        content: string;
        break: string;
        drums: string;
        tracks: { key: string; value: string; name: string }[];
        hideMetronome?: boolean;
    } {
        return keyboardSet as any;
    }

    getId(id: string): string {
        return this.pageId + '-' + id;
    }

    constructor(public props: Props, public context: ComponentContext) {
    }

    onMounted() {
        this.setRightPanelContent();
        this.setPageContent();
        setTimeout(() => {
            this.subscribeRightPanelEvents();
        }, 100);
    }

    // dyName('action-drums', dyName('panel-right-content')).addEventListener(
    //     'click',
    //     () => {
    //         //console.log('action-info');
    //         this.setViewDrums();
    //     }
    // );

    // dyName('action-info', dyName('panel-right-content')).addEventListener(
    //     'click',
    //     () => {
    //         //console.log('action-info');
    //         this.setViewInfo();
    //     }
    // );

    setPageContent(view?: ViewType) {
        view = view ||  this.view;
        this.view = view;

        if (this.view === 'bassSolo') {
            this.setBassSoloContent();
        }
        else
        {
            this.setDrumsContent();
        }

        setTimeout(() => {
            this.subscribeCommonPageEvents();
            this.subscribePageEvents();
        }, 100);
    }

    setRightPanelContent() {
        dyName('panel-right-content').innerHTML = `
      <p data-action-set-view="bassSolo">bassSolo</p>
      <p data-action-set-view="drums">drums</p>
    `;
    }

    getMetronomeContent(): string {
        return `
            <a data-tick-trigger="1:4"><b>1:4</b></a>&emsp;
            <a data-tick-trigger="2:4"><b>2:4</b></a>&emsp;
            <a data-tick-trigger="3:4"><b>3:4</b></a>&emsp;
            <a data-tick-trigger="4:4"><b>4:4</b></a>&emsp;
            <a data-action-type="stop"><b>stop</b></a>&emsp;
            <div 
                class="range-slider"
                data-name="slider"
                data-label="true"
                data-min="0"   
                data-max="200"
                data-step="1"
                data-value="100"
                data-scale="true"
                data-scale-steps="10"
                data-scale-sub-steps="5"
            >
            </div>
        `;
    }

    subscribeMetronomeEvents() {
        getWithDataAttr('tick-trigger', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => {
                this.playTick(el?.dataset?.tickTrigger);
            });
        });

        getWithDataAttrValue('action-type', 'tick', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.playTick3());
        });

        getWithDataAttrValue('action-type', 'test', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.playTick3());
        });

        getWithDataAttr(ns.setBmpAction, this.pageEl)?.forEach(
            (el: HTMLElement) => {
                el.addEventListener('pointerdown', () => {
                    this.bpmRange.setValue(parseInt(el?.dataset?.bpm, 10) || 100);
                    this.playTick(this.playingTick);
                });
            }
        );
    }

    setDrumsContent() {
        this.drumCtrl = new DrumCtrl(this);

        this.view = 'drums';
        this.el$.html(this.drumCtrl.getContent('drums'));
        this.bpmRange = (this.context.$f7 as any).range.create({
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    this.bpmValue = range.value;
                },
            },
        });
    }

    setBassSoloContent() {
        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${this.getTracksContent()}                
                <div data-name="setContent">
                    ${this.setInfo.content}
                </div>
            </div>`.trim();

        this.el$.html(content);

        this.bpmRange = (this.context.$f7 as any).range.create({
            // jjkl
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    //console.log('range.onChange', range); // jjkl
                    this.bpmValue = range.value;

                    if (this.playingTick) {
                        this.playTick(this.playingTick);
                    }
                },
            },
        });
    }

    subscribeRightPanelEvents() {
        getWithDataAttr('action-set-view', dyName('panel-right-content'))?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => {
                this.setPageContent(<any>el.dataset.actionSetView);
            });
        });
    }

    subscribeCommonPageEvents() {
        getWithDataAttrValue('action-type', 'stop', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.stop());
        });
    }

    subscribePageEvents() {
        if (this.view === 'bassSolo') {
            this.subscribeBassSoloEvents();
        }
        else if (this.view === 'drums') {
            this.subscribeMetronomeEvents();
            this.subscribeDrumsEvents();
        }

        //this.subscribeRelativeKeyboardEvents();

        // getWithDataAttr('note-line', this.pageEl)?.forEach((el) => {
        //     el.addEventListener('click', (evt: MouseEvent) => {
        //         this.tryPlayTextLine({
        //             text: el?.dataset?.noteLine,
        //         });
        //     });
        // });
        //
        // getWithDataAttr('relative-key', this.pageEl)?.forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => {
        //         const wrapper = dyName('relative-keyboard-wrapper');
        //
        //         if (!wrapper) {
        //             return;
        //         }
        //
        //         let baseNote = wrapper.dataset.relativeKeyboardBase || 'do';
        //         let note = un.getNoteByOffset(baseNote, el.dataset.relativeKey);
        //
        //         if (!note) {
        //             return;
        //         }
        //
        //         wrapper.dataset.relativeKeyboardBase = note;
        //
        //         getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
        //             el.style.backgroundColor = 'white';
        //         });
        //
        //         if (dyName(`set-note-${note}`, this.pageEl)) {
        //             dyName(`set-note-${note}`, this.pageEl).style.backgroundColor =
        //                 'lightgray';
        //         }
        //
        //         this.tryPlayTextLine({ text: `b60 ${note}-25` });
        //     });
        // });
        //
        // getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => {
        //         const wrapper = dyName('relative-keyboard-wrapper', this.pageEl);
        //
        //         if (!wrapper) {
        //             return;
        //         }
        //
        //         getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
        //             el.style.backgroundColor = 'white';
        //         });
        //
        //         el.style.backgroundColor = 'lightgray';
        //         const note = el.innerText.trim();
        //         wrapper.dataset.relativeKeyboardBase = note;
        //         this.tryPlayTextLine({ text: `b60 ${note}-25` });
        //     });
        // });
    }

    setKeysColor() {
        const bassChar = (this.playingNote.bass || '')[0];
        const soloChar = (this.playingNote.solo || '')[0];

        getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
            el.style.backgroundColor = 'white';
            const data = (el?.dataset || {}) as {
                keyboardId: string;
                noteLat: string;
            };
            const firstChar = data.noteLat[0];

            if (data.keyboardId === 'solo' && firstChar === bassChar) {
                el.style.backgroundColor = '#eee';
            }

            // if (data.keyboardId === 'bass' && firstChar === soloChar) {
            //   el.style.backgroundColor = 'lightgray';
            // }
        });
    }

    handleKeyRecord(code: string, time: number, type: 0 | 1) {
        //console.log(code, time, type);

        if (this.drumCtrl.mode !== 'record') {
            return;
        }

        const ctrl = this.drumCtrl;

        // ПЕРВОЕ НАЖАТИЕ
        if (!ctrl.keyData && type === DOWN) {
            ctrl.keyData = {
                code,
                down: time,
                note: code,
                up: 0,
                next: 0,
                //quarterTime: this.tickInfo.quarterTime,
                //quarterNio: this.tickInfo.quarterNio,
                quarterTime: 0,
                quarterNio: 0,
            };

            return;
        }

        if (
            ctrl.keyData
            //&& ((type === UP && code === ctrl.keyData.code) || type === DOWN)
        ) {
            if (type === UP) {
                ctrl.keyData.up = time;
                //this.playSound(this.keyData.note, true);
            }

            if (type === DOWN) {
                ctrl.keyData.next = time;
                ctrl.keySequence.push(ctrl.keyData);

                ctrl.keyData = {
                    code,
                    down: time,
                    note: code,
                    up: 0,
                    next: 0,
                    //quarterTime: this.tickInfo.quarterTime,
                    //quarterNio: this.tickInfo.quarterNio,
                    quarterTime: 0,
                    quarterNio: 0,
                };

                //this.playSound(this.keyData.note);
            }
        }
    }

    getOut(bpm: number, seq: DrumCtrl['keySequence'] ) {
        const getMask = (): {color: string, text: string, note: string}[] => {
            const arr = Array(12).fill(null);
            return arr.map(() => ({
                color: 'whitesmoke',
                text: '',
                note: '',
            }));
        }

        let startTimeMs = this.tickStartMs;
        let qms = Math.round(60000/ bpm); // ms в четверти

        seq.forEach(item => {
            let diffMs = item.down - startTimeMs;
            let quarterNio = Math.floor(diffMs/qms);
            item.quarterTime = startTimeMs + (qms * quarterNio);
            item.quarterNio = quarterNio;
        });

        //console.log('seq', seq);

        //let quarterTime = bpmInfo.lastDownTime + qms;
        let quarterNio = seq[0].quarterNio;
        let quarterTime = seq[0].quarterTime;
        let totalOut = '';
        let currRow: {color: string, text: string, note: string}[] = getMask();
        let outArr: {color: string, text: string, note: string}[][] = [currRow];
        let note = seq[0].note;
        const color1 = 'blue';
        const color2 = 'green';
        let bgColor = color1;
        let durNextItemInd = 0;
        let durItemInd = 0;
        let offsetInd = 0;

        seq.forEach((item, i) => {
            if (note !== item.note) {
                bgColor = bgColor === color1 ? color2 : color1;
                note = item.note;
            }

            if (quarterNio !== item.quarterNio) {
                const diff = item.quarterNio - quarterNio;
                if (diff > 1) {
                    for (i=1; i<diff; i++) {
                        outArr.push(getMask());
                    }
                }

                //console.log(item.quarterTime - quarterTime);
                currRow = getMask();
                outArr.push(currRow);
                quarterTime = item.quarterTime;
                quarterNio = item.quarterNio;
            }

            offsetInd = Math.floor((
                    (Math.floor(item.down - item.quarterTime) / qms) * un.NUM_120)/12
            );
            durItemInd = Math.floor((
                (Math.floor(item.up - item.down) / qms) * un.NUM_120)/12
            ) || 1;
            durNextItemInd = Math.floor((
                (Math.floor(item.next - item.down) / qms) * un.NUM_120)/12
            ) || 1;

            // for (i=offset; i<offset+durItems; i++) {
            //     if (i<11) {
            //         currRow[i].color = bgColor;
            //     }
            // }

            if (currRow[offsetInd]) {
                currRow[offsetInd].color = bgColor;
                currRow[offsetInd].text = 'x';
            }
        });

        if ((durNextItemInd - (11 - offsetInd)) > 0) {
            let count = Math.ceil((durNextItemInd - (11 - offsetInd))/12);
            //console.log(durNextItemInd, offsetInd, count);
            for (let i = 0; i < count; i++) {
                outArr.push(getMask());
            }
        }

        outArr.forEach((row, iRow) => {
            row.forEach((item, iCell) => {
                totalOut = totalOut +
                    `<div 
                        data-cell="${iRow}-${iCell}"
                        style="box-sizing: border-box; border: 1px solid white; display: inline-block; width: 1.5rem; height: 1.5rem; background-color: ${item.color}; user-select: none;"
                    ></div>`;
            });

            totalOut = totalOut + '<br/>';
        });

        const el = dyName('drum-record-out', this.pageEl);
        if (el) {
            el.innerHTML = totalOut;
        }

//  getOut2(multi: boolean = false): string {
//     let bpm = 0;
//     let qms = 0;
//
//     if (this.bpmInfo.totalMs) {
//         qms = this.bpmInfo.totalMs / (this.bpmInfo.pressCount - 1);
//         bpm = Math.round(60000 / qms);
//     }
//
//     //console.log('this.bpmInfo', bpm, this.bpmInfo);
//
//     let textOut = '';
//     let totalDuration = 0;
//     const divider = multi ? '\n' : ' ';
//     //const qms = 60000 / params.bpm / un.NUM_100;
//
//     this.keySequence.forEach((item, i) => {
//         let durationQ = item.up - item.down;
//         let pause = item.next - item.up;
//
//         durationQ = Math.round((durationQ / qms) * un.NUM_100);
//         pause = Math.round((pause / qms) * un.NUM_100);
//         // pause = Math.round(pause / 10);
//
//         // durationX = Math.round(duration / 10);
//         // pause = Math.round(pause / 10);
//
//         const total = durationQ + pause;
//         totalDuration += total;
//         // sount:total:duration:pause
//         //textOut += `${item.note}-${total}-${duration}-${pause}${divider}`;
//         textOut += `${item.note}-${total}-${durationQ}-${pause}${divider}`;
//     });
//
//     return `{b${bpm} d${totalDuration}${divider}${textOut}}`.trim();
// }
    }

    subscribeDrumsEvents() {
        getWithDataAttrValue('action-drum', 'get-bpm-or-stop', this.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                // остановить запись
                if (this.drumCtrl.keyData) {
                    this.drumCtrl.keyData.next = Date.now();
                    this.drumCtrl.keySequence.push(this.drumCtrl.keyData);
                    this.getOut(this.bpmValue, this.drumCtrl.keySequence);
                    this.drumCtrl.clearRecordData();
                    this.stopTicker();

                    return;
                }

                const bpmInfo = this.drumCtrl.bpmInfo;
                const time = Date.now();

                bpmInfo.pressCount++;

                if (bpmInfo.lastDownTime) {
                    bpmInfo.totalMs = bpmInfo.totalMs + (time - bpmInfo.lastDownTime);
                }
                bpmInfo.lastDownTime = time;

                if (bpmInfo.totalMs) {
                    const avg = bpmInfo.totalMs / (bpmInfo.pressCount - 1);
                    bpmInfo.bpm = Math.round(60000 / avg);
                }

                el.innerText = '' + (bpmInfo.bpm || '');
                //this.bpmRange.setValue(bpmInfo.bpm);
                //this.bpmValue = bpmInfo.bpm;
            });
        });

        getWithDataAttrValue('action-drum', 'clear', this.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                getWithDataAttrValue('action-drum', 'get-bpm-or-stop', this.pageEl)?.forEach((el: HTMLElement) => {
                    this.drumCtrl.clearBpmInfo();
                    el.innerText = '';
                });
            });
        });

        getWithDataAttrValue('action-drum', 'record', this.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                if (this.drumCtrl.mode !== 'record') {
                    this.drumCtrl.mode = 'record';
                    el.style.fontWeight = '700';
                } else {
                    this.drumCtrl.mode = null;
                    el.style.fontWeight = '400';
                }
            });
        });

        getWithDataAttr('action-drum-key', this.pageEl)?.forEach((el: HTMLElement) => {
            //console.log(el, el.dataset['actionDrum']);

            const note1 = (el.dataset['actionDrumKey'] || '').split('+')[0];

            if (!note1) {
                return;
            }

            const note2 = (el.dataset['actionDrum'] || '').split('+')[1];
            const notes = [note1, note2].filter(item => !!item && !item.startsWith('empty'));
            const volume = note1 === 'cowbell' ? 0.30 : undefined
            const keyboardId = el.dataset['keyboardId'];

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const time = Date.now();

                if (this.drumCtrl.mode === 'record') {
                    return this.handleKeyRecord(note1, time, DOWN);
                }

                notes.forEach(keyOrNote => {
                    synthesizer.playSound({
                        keyOrNote,
                        volume,
                        id: keyboardId,
                        onlyStop: false,
                    });

                    //this.handleKeyRecord(keyOrNote, time, DOWN);
                });

                if (note2) {
                    getWithDataAttrValue('highlight-drum', el.dataset['actionDrum']).forEach(el => {
                        el.style.border = '1px solid black';
                    });
                }
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                const time = Date.now();

                if (this.drumCtrl.mode === 'record') {
                    return this.handleKeyRecord(note1, time, UP);
                }

                notes.forEach(keyOrNote => {
                    synthesizer.playSound({
                        keyOrNote,
                        id: keyboardId,
                        onlyStop: true,
                    });

                    //this.handleKeyRecord(keyOrNote, time, UP);
                });

                if (note2) {
                    getWithDataAttrValue('highlight-drum', el.dataset['actionDrum']).forEach(el => {
                        el.style.border = null;
                    });
                }
            });
        });

    }

    subscribeBassSoloEvents() {
        getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
            const keyboardId = el?.dataset?.keyboardId;
            const keyOrNote = el?.dataset?.noteLat || '';

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                synthesizer.playSound({
                    keyOrNote: this.playingNote[keyboardId],
                    id: keyboardId,
                    onlyStop: true,
                });

                this.playingNote[keyboardId] = keyOrNote;

                synthesizer.playSound({
                    keyOrNote,
                    id: keyboardId,
                    // instrCode: 366,
                });

                this.setKeysColor();
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                synthesizer.playSound({
                    keyOrNote,
                    id: keyboardId,
                    onlyStop: true,
                });

                this.playingNote[keyboardId] = undefined;
            });
        });

        const clearColor = () => {
            getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
                el.style.backgroundColor = 'white';
            });
        };

        // очистка цвета
        let el = dyName('clear-keys-color', this.pageEl);
        if (el) {
            el.addEventListener('click', () => clearColor());
        }

        el = dyName('select-random-key', this.pageEl);
        if (el) {
            el.addEventListener('click', () => {
                const val =
                    un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');

                const key = dyName(
                    `note-key-${val}`,
                    dyName(`keyboard-solo`, this.pageEl)
                );

                if (key) {
                    clearColor();
                    key.style.backgroundColor = 'lightgray';
                }
            });
        }
    }

    subscribeRelativeKeyboardEvents() {
        const fixEl = dyName('relative-command-fix');
        const zeroEl = dyName('relative-note-0');

        dyName('relative-command-fixQuickNote')?.addEventListener('pointerdown', (evt: MouseEvent) => {
            this.fixedRelativeNote = this.lastRelativeNote;
            this.fixedQuickNote = this.lastRelativeNote;
            fixEl.innerText = this.fixedQuickNote;
            const el = dyName('relative-command-setQuickNote');
            el.innerText = this.fixedQuickNote;
            zeroEl.innerText = this.fixedQuickNote;
        });

        dyName('relative-command-setQuickNote')?.addEventListener('pointerdown', (evt: MouseEvent) => {
            this.fixedRelativeNote = this.fixedQuickNote;
            this.lastRelativeNote = this.fixedQuickNote;
            fixEl.innerText = this.fixedQuickNote;
            zeroEl.innerText = this.fixedQuickNote;
        });

        dyName('relative-command-setDa')?.addEventListener('pointerdown', (evt: MouseEvent) => {
            this.fixedRelativeNote = defaultNote;
            this.lastRelativeNote = defaultNote;
            fixEl.innerText = defaultNote;
            zeroEl.innerText = defaultNote;
        });

        fixEl?.addEventListener('pointerdown', (evt: MouseEvent) => {
            const keyboardId = fixEl?.dataset?.keyboardId;

            synthesizer.playSound({
                keyOrNote: this.playingNote[keyboardId],
                id: keyboardId,
                onlyStop: true,
            });

            if (!this.lastRelativeNote) {
                return;
            }

            this.fixedRelativeNote = this.lastRelativeNote;
            this.playingNote[keyboardId] = this.lastRelativeNote;
            zeroEl.innerText = this.lastRelativeNote;

            synthesizer.playSound({
                keyOrNote: this.lastRelativeNote,
                id: keyboardId,
            });

        });

        fixEl?.addEventListener('pointerup', (evt: MouseEvent) => {
            const keyboardId = fixEl?.dataset?.keyboardId;

            synthesizer.playSound({
                keyOrNote: this.lastRelativeNote,
                id: keyboardId,
                onlyStop: true,
            });

            this.playingNote[keyboardId] = undefined;
        });

        getWithDataAttr('is-relative-note', this.pageEl)?.forEach((el: HTMLElement) => {
            if (!el?.dataset?.pitchOffset) {
                return;
            }

            const keyboardId = el?.dataset?.keyboardId;
            const offset = parseInteger(el?.dataset?.pitchOffset, null);

            if (offset === null) {
                return;
            }

            //console.log(offset, keyboardId);

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const note = getNoteByOffset(this.fixedRelativeNote, offset);

                synthesizer.playSound({
                    keyOrNote: this.playingNote[keyboardId],
                    id: keyboardId,
                    onlyStop: true,
                });
                this.playingNote[keyboardId] = note;
                this.lastRelativeNote = note;

                if (!note) {
                    return;
                }

                if (fixEl) {
                    fixEl.innerText = note;
                }

                synthesizer.playSound({
                    keyOrNote: note,
                    id: keyboardId,
                });

                //this.setKeysColor();
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                const note = getNoteByOffset(this.fixedRelativeNote, offset);

                synthesizer.playSound({
                    keyOrNote: note,
                    id: keyboardId,
                    onlyStop: true,
                });

                this.playingNote[keyboardId] = undefined;
            });
        });

        // const clearColor = () => {
        //   getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
        //     el.style.backgroundColor = 'white';
        //   });
        // };
        //
        // // очистка цвета
        // let el = dyName('clear-keys-color', this.pageEl);
        // if (el) {
        //   el.addEventListener('click', () => clearColor());
        // }
        //
        // el = dyName('select-random-key', this.pageEl);
        // if (el) {
        //   el.addEventListener('click', () => {
        //     const val =
        //         un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');
        //
        //     const key = dyName(
        //         `note-key-${val}`,
        //         dyName(`keyboard-solo`, this.pageEl)
        //     );
        //
        //     if (key) {
        //       clearColor();
        //       key.style.backgroundColor = 'lightgray';
        //     }
        //   });
        // }
    }

    getTracksContent(): string {
        if (!this.setInfo?.tracks?.length) {
            return '';
        }

        return this.setInfo.tracks.reduce(
            (acc, item) => {
                acc =
                    acc +
                    `
        <div class="row">
          <button id="${this.getId(
                        'action-play-' + item.key
                    )}" class="button col">${item.name || item.key}</button>
          </div>
        `;

                return acc.trim();
            },
            `
        <div class="row">
          <button id="${this.getId(
                'action-stop'
            )}" class="button col">stop</button>
        </div>                  
    `
        );
    }

    stopTicker() {
        ticker.stop();
        synthesizer.playSound({
            keyOrNote: 'cowbell',
            id: 'ticker',
            onlyStop: true,
        });

        if (this.tickNode) {
            this.tickNode.stop();
            this.tickNode = null;
        }
    }

    playTick3() {
        this.stopTicker();

        const cb = (x: {ab: AudioBufferSourceNode, startTimeMs: number}) => {
            this.tickNode = x.ab;
            this.tickStartMs = x.startTimeMs;
            // console.log('start');
            // setTimeout(() => {
            //     x.ab.stop(0);
            //     x.ab.stop(0);
            // }, 2000);
        }

        ticker.createTickSource({
            qms: Math.round(60000/ this.bpmValue),
            preset:synthesizer.instruments['drum_56'],
            repeat: 100,
            cb,
        });
    }

    playTick2(name?: string) {
        this.tickInfo = {
            quarterTime: Date.now(),
            quarterNio: -1,
        }

        ticker.tickByBpm({
            bpm: this.bpmValue,
        }, () => {
            synthesizer.playSound({
                keyOrNote: 'cowbell',
                id: 'ticker',
                onlyStop: true,
            });
            synthesizer.playSound({
                keyOrNote: 'cowbell',
                id: 'ticker',
                onlyStop: false,
            });
            this.tickInfo = {
                quarterTime: Date.now(),
                quarterNio: this.tickInfo.quarterNio + 1,
            }
        });
    }

    playTick(name?: string) {
        name = name || '';
        this.playingTick = name;

        metronome.stopAndClearMidiPlayer();

        const tick = ticks[this.playingTick];

        if (!tick) {
            this.playingTick = '';

            return;
        }

        const blocks = `
        <out r1000000>
        tick

        ${tick}
        `;

        metronome.tryPlayMidiBlock({
            blocks,
            bpm: this.bpmValue,
            // cb: (type, data) => {
            //     if (type === 'tick' && !data.isVirtTick) {
            //         this.tickTime = Date.now();
            //     }
            //
            //     //console.log(type, this.tickCount, data);
            // }
        });
    }

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        return multiPlayer.tryPlayTextLine({ text, repeat });
    }

    stop() {
        multiPlayer.stopAndClearMidiPlayer();
        metronome.stopAndClearMidiPlayer();
        this.stopTicker();
    }

    async play(text: string, repeatCount?: number) {
        multiPlayer.tryPlayMidiBlock({
            blocks: text,
            repeatCount,
            //bpmMultiple: this.bpmMultiple,
        });
    }
}
